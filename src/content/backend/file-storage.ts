export const content = {
  title: "File Storage & CDN",
  sections: [
    {
      heading: "Object Storage",
      body: `**Object storage** (S3, GCS, Cloudflare R2, MinIO) stores files as objects with a key — a flat namespace, not a file system hierarchy. Files are stored redundantly across multiple availability zones, infinitely scalable, and served over HTTP. Never store user files on your application server's disk — it breaks horizontal scaling and risks data loss.`,
      items: [
        "**Bucket** — a named container for objects (like a top-level folder). Set access policies at the bucket level.",
        "**Object** — a file plus metadata. Identified by its key (e.g., `avatars/user-42/photo.jpg`)",
        "**Key design**: include user ID and purpose in the path: `uploads/{user_id}/{purpose}/{uuid}.{ext}`",
        "**AWS S3** — the standard, vast ecosystem, most tooling, pay-per-use",
        "**Cloudflare R2** — S3-compatible, free egress (no bandwidth fees), cheaper for read-heavy workloads",
        "**MinIO** — self-hosted S3-compatible storage. Use in development and for on-premise requirements",
      ],
    },
    {
      heading: "Direct Upload with Presigned URLs",
      body: `The naive approach is to upload to your server, then forward to S3 — this wastes bandwidth, adds latency, and strains your server. The **presigned URL** pattern lets clients upload directly to S3 without your server seeing the file bytes at all.`,
      code: `# Presigned URL flow:
# 1. Client requests an upload URL from your API
# 2. Your API generates a presigned URL (signed with S3 credentials, expires in N minutes)
# 3. Client uploads directly to S3 using the URL
# 4. Client notifies your API that upload is complete
# 5. Your API saves the S3 key to the database

# Step 2: Generate presigned upload URL (Python + boto3)
import boto3, uuid

s3 = boto3.client("s3")

@router.post("/uploads/presign")
async def get_presigned_upload_url(
    content_type: str,
    current_user: User = Depends(get_current_user)
):
    ext = content_type.split("/")[-1]  # "image/jpeg" → "jpeg"
    key = f"uploads/{current_user.id}/{uuid.uuid4()}.{ext}"

    url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": "my-bucket",
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=300,  # URL expires in 5 minutes
    )
    return {"upload_url": url, "key": key}

# Step 3: Client uploads directly (no server involved)
# PUT {upload_url}
# Content-Type: image/jpeg
# [binary file bytes]

# Step 4: Client confirms upload
@router.post("/uploads/confirm")
async def confirm_upload(key: str, current_user: User = Depends(get_current_user)):
    # Validate the key belongs to this user
    if not key.startswith(f"uploads/{current_user.id}/"):
        raise HTTPException(403)
    current_user.avatar_key = key
    db.commit()
    return {"url": f"https://cdn.example.com/{key}"}`,
    },
    {
      heading: "Presigned Download URLs",
      body: `For private files, generate a time-limited URL that grants temporary read access — no permanent public access needed.`,
      code: `# Generate presigned download URL
@router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: int,
    current_user: User = Depends(get_current_user)
):
    doc = db.get(Document, doc_id)
    if doc.owner_id != current_user.id:
        raise HTTPException(403)

    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": "my-bucket", "Key": doc.s3_key},
        ExpiresIn=60,  # URL expires in 60 seconds
    )
    # Redirect client directly to S3 — no file bytes through your server
    return RedirectResponse(url)

# Public files: set bucket policy to allow public read
# Then serve via CDN: https://cdn.example.com/{key}
# (much faster than going through your server)`,
    },
    {
      heading: "CDN Integration",
      body: `A **CDN (Content Delivery Network)** caches files at edge nodes around the world, serving them from the location closest to the user. Essential for images, videos, JS/CSS bundles, and any static asset.`,
      items: [
        "**How it works**: CDN sits in front of your origin (S3 or your server). First request fetches from origin and caches it. Subsequent requests served from the nearest edge node.",
        "**Cloudfront (AWS)** — native S3 integration, advanced features, global network",
        "**Cloudflare** — easier setup, free tier, DDoS protection included, R2 storage with free egress",
        "**Cache-Control headers**: set on S3 objects or your server. `Cache-Control: public, max-age=31536000, immutable` for versioned assets (hashed filenames).",
        "**Cache busting**: use content-hashed filenames (`logo.abc123.png`) so you can set infinite TTLs — the URL changes when the content changes",
        "**Image transformation**: Cloudflare Images, Imgix, and Cloudinary resize/convert images on the fly at the CDN edge",
      ],
    },
    {
      heading: "File Validation & Security",
      body: `Never trust uploaded files. Malicious uploads can cause code execution, server compromise, or expose other users' data.`,
      items: [
        "**Validate content type by reading magic bytes** — don't trust the `Content-Type` header or file extension, which a client can fake",
        "**Limit file size** — set `max_content_length` in your framework and also in S3 bucket policies",
        "**Virus scan** — run uploaded files through ClamAV or a cloud AV service (AWS GuardDuty, Cloudmersive) before making them accessible",
        "**Store outside the web root** — never serve uploaded files directly from a path that could execute code (no PHP, no .html)",
        "**Randomize filenames** — use UUIDs, not user-provided filenames. Prevents path traversal and predictable URL enumeration",
        "**Separate domain for user content** — serve user uploads from a different domain (`cdn.example.com`) so cookies from `app.example.com` aren't sent and XSS is isolated",
      ],
    },
  ],
};
