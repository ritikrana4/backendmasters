export const content = {
  title: "CloudFront & CDN",
  sections: [
    {
      heading: "What is CloudFront?",
      body: "**Amazon CloudFront** is AWS's Content Delivery Network (CDN). It caches content at 400+ **edge locations** (Points of Presence) worldwide so users fetch files from a nearby edge server instead of travelling all the way to your origin (S3, ALB, EC2, Lambda@Edge). This reduces latency, offloads traffic from your origin, and — when fronting S3 — is the standard way to add HTTPS to a static site.\n\nCloudFront is also a security layer: it absorbs DDoS traffic (integrated with AWS Shield), enforces HTTPS, supports custom SSL certificates, and enables AWS WAF rules at the edge.",
      items: [
        "`Distribution` — the CloudFront configuration object. Has one or more origins and a set of cache behaviours.",
        "`Origin` — where CloudFront fetches content that isn't cached: S3 bucket, ALB, EC2, or any HTTPS endpoint.",
        "`Edge location` — a CDN PoP. Caches content close to users. 400+ globally.",
        "`Regional edge cache` — a larger mid-tier cache between edge locations and your origin. Reduces origin load.",
        "`TTL (Time-To-Live)` — how long CloudFront caches an object. Controlled by `Cache-Control: max-age=<seconds>` headers from origin.",
      ],
    },
    {
      heading: "Cache Behaviours & Distributions",
      body: "A distribution can have multiple **cache behaviours** — rules that match URL path patterns to different origins and cache settings. For example: `*.js` and `*.css` from S3 with a long TTL, `/api/*` forwarded to an ALB with no caching, and `/` as default.\n\n**Viewer protocol policy** controls whether CloudFront redirects HTTP to HTTPS (`redirect-to-https`), allows both (`allow-all`), or HTTPS only (`https-only`). Always use `redirect-to-https` or `https-only` in production.",
      code: `# CloudFront distribution (Terraform)
resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = ["www.example.com"]

  # Origin: S3 static assets
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "s3-assets"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Default: serve from S3, cache aggressively
  default_cache_behavior {
    target_origin_id       = "s3-assets"
    viewer_protocol_policy = "redirect-to-https"
    cached_methods         = ["GET", "HEAD"]
    allowed_methods        = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    ssl_support_method  = "sni-only"
  }
}`,
    },
    {
      heading: "Origin Access Identity (OAI) & OAC",
      body: "When serving from S3, you want the bucket to be **private** — only CloudFront can read it, not the public. This prevents users from bypassing CloudFront (and its WAF rules) by hitting the S3 URL directly.\n\n**Origin Access Identity (OAI)** is the older mechanism — a CloudFront identity you grant `s3:GetObject` access via bucket policy. The newer **Origin Access Control (OAC)** is preferred: it signs requests with SigV4, supports all S3 regions, and works with SSE-KMS encrypted buckets.",
      code: `# S3 bucket policy granting OAC access
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "cloudfront.amazonaws.com"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/EDFDVBD6EXAMPLE"
      }
    }
  }]
}`,
      items: [
        "`OAI` — legacy, still widely used. Uses a CloudFront principal in the bucket policy.",
        "`OAC` — new standard. Supports SSE-KMS, POST/PUT/DELETE (for API origins), and is region-agnostic.",
        "Never enable `s3:GetObject` for `*` (public). Always restrict to CloudFront principal.",
      ],
    },
    {
      heading: "Cache Invalidation & Lambda@Edge",
      body: "When you deploy new content to S3, CloudFront may serve the old cached version until the TTL expires. **Cache invalidation** lets you immediately purge cached objects by path pattern (`/index.html`, `/assets/*`). First 1,000 paths per month are free; after that $0.005/path.\n\n**Lambda@Edge** and **CloudFront Functions** let you run code at the edge — close to users — to modify requests/responses without hitting your origin. Use cases: URL rewriting, A/B testing, adding security headers, authentication checks, and personalisation.",
      items: [
        "`Cache invalidation` — up to 3,000 paths per invalidation request. Wildcard `/*` invalidates everything (use sparingly — costly and slow).",
        "`CloudFront Functions` — lightweight JavaScript at the edge. Sub-millisecond latency. For simple header manipulation, URL rewrites.",
        "`Lambda@Edge` — full Node.js/Python Lambda at the edge. For complex logic: auth, personalisation, A/B testing.",
        "`Geo-restriction` — block or allow requests from specific countries at the CloudFront layer.",
        "`Custom error pages` — return a custom HTML page for 404/500 responses instead of AWS default error pages.",
      ],
    },
  ],
};
