import type { DiagramConfig } from "@/components/FlowDiagram";

const cdnDiagram: DiagramConfig = {
  width: 760,
  height: 220,
  caption: "CDN edge nodes serve cached content globally; only cache misses reach the origin server",
  nodes: [
    { id: "eu",   type: "client",   label: "EU User",      x: 75,  y: 70  },
    { id: "us",   type: "client",   label: "US User",      x: 75,  y: 155 },
    { id: "eup",  type: "cdn",      label: "EU Edge PoP",  x: 310, y: 70  },
    { id: "usp",  type: "cdn",      label: "US Edge PoP",  x: 310, y: 155 },
    { id: "orig", type: "server",   label: "Origin Server", x: 570, y: 112 },
    { id: "db",   type: "database", label: "Database",     x: 700, y: 112 },
  ],
  edges: [
    { from: "eu",   to: "eup",  label: "request" },
    { from: "us",   to: "usp",  label: "request" },
    { from: "eup",  to: "orig", label: "cache miss", dashed: true },
    { from: "usp",  to: "orig", label: "cache miss", dashed: true },
    { from: "orig", to: "db",   dashed: true },
  ],
};

export const content = {
  title: "CDN & Edge Delivery",
  sections: [
    {
      heading: "How CDNs Work",
      diagram: cdnDiagram,
      body: `A **CDN (Content Delivery Network)** is a globally distributed network of **Points of Presence (PoPs)** — edge servers located close to users. When a user requests a resource, their DNS resolves to the nearest PoP. If the PoP has the content cached, it responds directly — no round trip to the origin server. If not, it fetches from origin, caches it, and serves it.

This reduces latency (the edge is geographically closer), reduces origin load (most requests are cache hits), and absorbs DDoS traffic at the edge before it reaches your infrastructure.`,
      items: [
        "**Latency reduction**: a London user hitting a London PoP has ~5ms RTT vs ~100ms to a US origin server.",
        "**Origin offload**: a CDN cache-hit ratio of 90% means the origin handles only 10% of total traffic.",
        "**DDoS mitigation**: CDN providers (Cloudflare, AWS CloudFront) absorb volumetric attacks at the edge with their multi-Tbps capacity.",
        "**Popular CDNs**: Cloudflare (also a reverse proxy and WAF), CloudFront (AWS-integrated), Fastly (programmable VCL), Akamai (enterprise).",
      ],
    },
    {
      heading: "Cache-Control Headers",
      body: `The origin server instructs CDNs and browsers what to cache using HTTP **Cache-Control** headers. Getting these right determines your cache-hit ratio and how quickly content updates propagate.`,
      code: `# Static assets — cache forever (content-addressed URLs)
# e.g. /static/app.a3f9b2c.js — hash in filename changes when content changes
Cache-Control: public, max-age=31536000, immutable
# public: CDN can cache this (vs private = only browser)
# max-age=31536000: cache for 1 year
# immutable: browser won't revalidate on reload (boosts performance)

# HTML pages — short cache, must revalidate
Cache-Control: public, max-age=60, stale-while-revalidate=3600
# Serve stale for up to 1 hour while fetching fresh in background

# API responses — no CDN caching (user-specific or dynamic)
Cache-Control: private, no-store

# Shared API responses — CDN can cache, short TTL
Cache-Control: public, max-age=30, s-maxage=300
# max-age: browser TTL (30s)
# s-maxage: CDN TTL (300s) — overrides max-age for CDNs

# Surrogate-Control (Fastly-specific, not sent to browsers)
Surrogate-Control: max-age=3600

# Vary header — cache separate copies for different Accept-Encoding values
Vary: Accept-Encoding   # different cached copy for gzip vs br vs identity`,
    },
    {
      heading: "Origin Shield",
      body: `**Origin shield** (also called a **mid-tier cache**) adds a second caching layer between edge PoPs and the origin. When an edge PoP has a cache miss, it first checks the origin shield. Only if the shield also misses does the request reach the actual origin.

With 100+ edge PoPs worldwide and a cache miss on each, the origin could receive 100 simultaneous requests for the same resource (**thundering herd**). Origin shield collapses these into a single request to the origin.`,
      items: [
        "**Reduces origin load**: instead of 100 PoPs hitting origin simultaneously, only the shield hits origin — and only once per cache miss.",
        "**Faster propagation**: when content is updated, only the shield needs to re-fetch from origin; edge PoPs warm from the shield (low latency).",
        "**CloudFront**: Origin Shield is a feature you enable per distribution, placing a regional cache between edge locations and the origin.",
        "**Fastly**: uses \"shielding\" — designate one PoP as the shield; all others check it before going to origin.",
        "**Trade-off**: adds one extra hop (latency) on a shield miss. Acceptable because shield misses are rare once the cache is warm.",
      ],
    },
    {
      heading: "Cache Invalidation",
      body: `The hardest problem in CDN caching: how do you update content that's cached across hundreds of PoPs when it changes?`,
      code: `# Strategy 1: Content-addressed URLs (best for static assets)
# When file changes, the URL changes — old URL expires naturally
# New URL has zero CDN cache (fresh from origin)
# /static/logo.abc123.png  → content hasn't changed, cache forever
# /static/logo.def456.png  → new content, new URL, cache forever

# Strategy 2: Instant purge via CDN API
import requests

def purge_cloudfront(paths: list[str], distribution_id: str):
    """Create a CloudFront invalidation for the given paths."""
    cf = boto3.client("cloudfront")
    cf.create_invalidation(
        DistributionId=distribution_id,
        InvalidationBatch={
            "Paths": {"Quantity": len(paths), "Items": paths},
            "CallerReference": str(time.time()),
        }
    )

purge_cloudfront(["/api/products/42", "/pages/products/42"], "E2QWRUHEXAMPLE")
# Takes 1-5 minutes to propagate to all edge nodes

# Strategy 3: Surrogate keys / cache tags (Fastly, Cloudflare)
# Tag cached responses with related keys; purge all tagged content at once
# Response header: Surrogate-Key: product:42 category:electronics
# Purge: POST /service/{id}/purge — body: {"surrogate_key": "product:42"}
# Instantly purges ALL responses tagged with product:42 across all PoPs`,
    },
  ],
};
