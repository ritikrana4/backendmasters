export const content = {
  title: "S3 & Object Storage",
  sections: [
    {
      heading: "S3 Fundamentals",
      body: "**Amazon S3 (Simple Storage Service)** is AWS's object storage. Unlike block storage (EBS), you don't mount S3 as a filesystem — you interact with it via HTTP API calls (`GET`, `PUT`, `DELETE`). Each object is stored in a **bucket** and identified by a **key** (path-like string). There's no real directory hierarchy; it's a flat namespace, but keys with `/` characters look like folders in the console.\n\nS3 provides 11 nines of durability (99.999999999%) by automatically replicating objects across multiple availability zones. It scales to unlimited storage and handles millions of requests per second.",
      items: [
        "`Bucket` — globally unique namespace container. Names are globally unique across all AWS accounts.",
        "`Object` — any file up to 5 TB. Stored as bytes with a key, metadata, and optional tags.",
        "`Key` — the object's full path, e.g., `images/profile/user-42.jpg`.",
        "`Region` — buckets are created in a specific region; data stays there unless you configure replication.",
        "`S3 Standard` — default storage class: high availability, low latency. Other classes trade retrieval speed for lower storage cost.",
      ],
    },
    {
      heading: "Bucket Policies & Access Control",
      body: "By default, S3 buckets and objects are **private**. Access is controlled by three layers: IAM policies on the caller, bucket policies on the bucket, and ACLs (legacy — avoid new ACLs in favour of bucket policies).\n\nFor most applications, the correct pattern is: keep the bucket private, grant your application's IAM role read/write access via an IAM policy, and use **pre-signed URLs** to grant temporary access to specific objects for end users without making them public.",
      code: `# Bucket policy: allow a specific IAM role to read all objects
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::123456789012:role/my-api-role"
    },
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}

# Generate a pre-signed URL (valid for 1 hour)
aws s3 presign s3://my-bucket/report.pdf --expires-in 3600`,
      items: [
        "`Block Public Access` — account-level and bucket-level setting that prevents any policy from making objects public. Enable it unless you're intentionally hosting public content.",
        "`Pre-signed URL` — a time-limited signed URL that grants temporary access to a private object without AWS credentials.",
        "`S3 Object Ownership` — set to `BucketOwnerEnforced` to disable ACLs and simplify access control.",
      ],
    },
    {
      heading: "Versioning & Lifecycle Rules",
      body: "**Versioning** keeps all historical versions of an object. When enabled, deleting an object adds a **delete marker** instead of removing it; older versions remain accessible by version ID. Essential for backup and accidental deletion recovery.\n\n**Lifecycle rules** automate moving objects to cheaper storage classes or deleting them after a period. Common pattern: move to S3 Infrequent Access after 30 days, Glacier after 90 days, delete after 365 days.",
      code: `# Lifecycle rule via AWS CLI
aws s3api put-bucket-lifecycle-configuration \\
  --bucket my-bucket \\
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "archive-old-logs",
      "Status": "Enabled",
      "Filter": {"Prefix": "logs/"},
      "Transitions": [
        {"Days": 30, "StorageClass": "STANDARD_IA"},
        {"Days": 90, "StorageClass": "GLACIER"}
      ],
      "Expiration": {"Days": 365}
    }]
  }'`,
      items: [
        "`S3 Standard-IA` — Infrequent Access: same durability, cheaper storage but retrieval fee. Good for logs, backups accessed rarely.",
        "`S3 Glacier Instant Retrieval` — archived data, millisecond retrieval, ~68% cheaper than Standard.",
        "`S3 Glacier Deep Archive` — lowest cost, 12-hour retrieval. Long-term compliance archives.",
        "`Intelligent-Tiering` — automatically moves objects between tiers based on access patterns; zero retrieval fee.",
      ],
    },
    {
      heading: "Static Website Hosting & Common Patterns",
      body: "S3 can serve a static website directly — HTML, CSS, JS, images — without any server. Enable static website hosting on a bucket, upload your build output, and optionally front it with **CloudFront** for HTTPS and global caching.\n\nFor dynamic file uploads from a browser, the recommended pattern is **server-generated pre-signed PUT URLs**: your backend generates a signed URL with `PutObject` permissions, the client uploads directly to S3, and the file never passes through your server — saving bandwidth and cost.",
      code: `import boto3

s3 = boto3.client("s3", region_name="us-east-1")

# Generate a pre-signed URL the browser can PUT to
url = s3.generate_presigned_url(
    "put_object",
    Params={
        "Bucket": "my-bucket",
        "Key": f"uploads/{user_id}/avatar.jpg",
        "ContentType": "image/jpeg",
    },
    ExpiresIn=300,  # 5 minutes
)
# Return this URL to the frontend; browser uploads directly`,
      items: [
        "`S3 Transfer Acceleration` — routes uploads through AWS edge locations for faster global uploads.",
        "`Multipart Upload` — required for objects over 5 GB; recommended over 100 MB for reliability and resumability.",
        "`S3 Event Notifications` — trigger Lambda, SQS, or SNS when objects are created/deleted. Classic use: thumbnail generation.",
        "`S3 Replication` — automatically replicate objects to another bucket (same or cross-region) for disaster recovery or compliance.",
      ],
    },
  ],
};
