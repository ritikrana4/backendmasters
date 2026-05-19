export const content = {
  title: "HTTPS & Security",
  sections: [
    {
      heading: "Why HTTP is Dangerous",
      body: `Plain HTTP sends everything as readable text over the network — your credentials, tokens, and data can be read by anyone on the same network (coffee shop WiFi, your ISP, corporate networks). **HTTPS** wraps HTTP in **TLS (Transport Layer Security)**, encrypting everything in transit. In 2024, there's no valid reason to serve an API over plain HTTP.`,
      items: [
        "**Eavesdropping** — anyone on the network path can read HTTP traffic",
        "**Man-in-the-middle** — attacker intercepts and modifies requests/responses",
        "**Session hijacking** — attacker steals session cookies from plain HTTP",
        "HTTPS prevents all of these by encrypting the connection end-to-end",
      ],
    },
    {
      heading: "TLS Handshake",
      body: `Before encrypted data flows, client and server perform a **TLS handshake** to agree on encryption parameters and verify the server's identity. In TLS 1.3 (current standard), this takes only one round trip.`,
      code: `# TLS 1.3 Handshake (simplified)

Client                                    Server
  |                                         |
  |─── ClientHello ────────────────────>    |
  |    (supported cipher suites,            |
  |     client random, key share)           |
  |                                         |
  |    <─── ServerHello ─────────────────── |
  |         (chosen cipher, server random,  |
  |          key share, certificate,        |
  |          Certificate Verify)            |
  |                                         |
  |─── Finished ───────────────────────>    |
  |    (derives shared secret here)         |
  |                                         |
  |    [encrypted application data flows]   |

# Key outcomes:
# 1. Both sides derived the same symmetric key (never sent over the wire)
# 2. Client verified server's certificate is valid and trusted
# 3. All subsequent data is AES-256 encrypted`,
    },
    {
      heading: "TLS Certificates",
      body: `A TLS certificate proves that a server is who it claims to be. It's issued by a **Certificate Authority (CA)** that your browser trusts. The chain of trust: browser trusts CA → CA vouches for domain → you trust the domain.`,
      items: [
        "**DV (Domain Validated)** — CA verifies you control the domain. Issued in minutes. Free from Let's Encrypt.",
        "**OV (Organisation Validated)** — CA verifies the organisation's legal identity. Takes days.",
        "**EV (Extended Validation)** — highest assurance, shows org name in browser bar. Expensive, weeks to get.",
        "**Let's Encrypt** — free, automated CA. Used by ~60% of HTTPS sites. Certificates expire every 90 days.",
        "**Certificate pinning** — client only accepts a specific certificate or public key. Prevents CA compromise attacks.",
      ],
    },
    {
      heading: "CORS — Cross-Origin Resource Sharing",
      body: `Browsers enforce the **same-origin policy**: JavaScript on \`app.com\` cannot make requests to \`api.example.com\` unless the API explicitly allows it. **CORS** is the mechanism for APIs to declare which origins they trust. CORS is a *browser* security feature — it doesn't protect your API from non-browser clients.`,
      code: `# Browser makes a "preflight" OPTIONS request before cross-origin POST/PUT/DELETE
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type

# API server responds with what it allows:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400   ← cache preflight for 24hrs

# Then browser sends the actual request
# If the server doesn't include CORS headers → browser blocks the response

# Wildcard (allows all origins — only safe for public read-only APIs)
Access-Control-Allow-Origin: *
# Can NOT use * with credentials (cookies, Authorization header)`,
    },
    {
      heading: "Security Headers",
      body: `Beyond TLS, every API and website should set these response headers to protect against common attacks:`,
      items: [
        "`Strict-Transport-Security: max-age=31536000; includeSubDomains` — HSTS: tell browsers to always use HTTPS for this domain (even if user types http://)",
        "`X-Content-Type-Options: nosniff` — prevent browsers from guessing the content type (stops MIME-sniffing attacks)",
        "`X-Frame-Options: DENY` — prevent the page from being embedded in iframes (stops clickjacking)",
        "`Content-Security-Policy` — whitelist which scripts, styles, and resources can load (major XSS mitigation)",
        "`Referrer-Policy: no-referrer-when-downgrade` — control how much referrer info is sent to other sites",
        "`Permissions-Policy` — disable browser features you don't use: camera, microphone, geolocation",
      ],
      code: `# Example security headers for an API
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'none'
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()

# For a web app (not just API), also add:
Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com`,
    },
  ],
};
