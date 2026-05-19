export const content = {
  title: "Headers & Request Body",
  sections: [
    {
      heading: "What are Headers?",
      body: `HTTP headers are key-value metadata pairs sent alongside every request and response. They carry information about the message itself — not the content. Headers are case-insensitive and separated from the body by a blank line.`,
      code: `# Request headers
GET /api/users HTTP/1.1
Host: api.example.com               ← required in HTTP/1.1
Accept: application/json            ← what format the client wants back
Accept-Language: en-US,en;q=0.9    ← language preference
Authorization: Bearer eyJhbGci...   ← credentials
Content-Type: application/json      ← format of the request body
User-Agent: MyApp/2.1.0             ← client identification
X-Request-ID: abc-123               ← custom header (X- prefix convention)

# Response headers
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 347
Cache-Control: public, max-age=300
ETag: "abc123def456"
X-RateLimit-Remaining: 47`,
    },
    {
      heading: "Essential Request Headers",
      body: `These are the headers you'll set or read most often when building or consuming APIs:`,
      items: [
        "`Host` — the target domain. Required in HTTP/1.1. Allows virtual hosting (multiple sites on one IP).",
        "`Authorization` — credentials. `Bearer <token>` for JWT, `Basic <base64>` for username:password.",
        "`Content-Type` — the MIME type of the request body. Must match what you're actually sending.",
        "`Accept` — the MIME type(s) the client can handle in the response. Server uses this for content negotiation.",
        "`Accept-Language` — preferred response language: `en-US`, `fr-FR`.",
        "`Cache-Control` — caching directives: `no-cache`, `max-age=3600`.",
        "`If-None-Match` — send the server an ETag; server returns `304 Not Modified` if unchanged.",
        "`X-Request-ID` / `X-Correlation-ID` — custom trace ID for distributed logging.",
      ],
    },
    {
      heading: "Content-Type and Request Bodies",
      body: `The **body** carries the payload of POST, PUT, and PATCH requests. The \`Content-Type\` header tells the server how to parse it. Getting this wrong is one of the most common causes of 400 Bad Request errors.`,
      code: `# 1. JSON (most common for APIs)
POST /api/users HTTP/1.1
Content-Type: application/json

{"name": "Alice", "email": "alice@example.com"}


# 2. URL-encoded form data (classic HTML forms)
POST /auth/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

email=alice%40example.com&password=secret


# 3. Multipart form data (file uploads)
POST /api/avatar HTTP/1.1
Content-Type: multipart/form-data; boundary=----FormBoundary7MA4YWx

------FormBoundary7MA4YWx
Content-Disposition: form-data; name="user_id"
42
------FormBoundary7MA4YWx
Content-Disposition: form-data; name="file"; filename="avatar.png"
Content-Type: image/png
<binary data>
------FormBoundary7MA4YWx--


# 4. Plain text
Content-Type: text/plain
Hello, world.`,
    },
    {
      heading: "Essential Response Headers",
      body: `Server response headers carry metadata about the response body, caching instructions, security policies, and CORS permissions:`,
      items: [
        "`Content-Type` — MIME type of the response body: `application/json`, `text/html`, `image/png`.",
        "`Content-Length` — byte size of the body. Lets clients show download progress.",
        "`Cache-Control` — `public, max-age=3600` (cacheable for 1hr), `no-store` (never cache), `private` (user-specific).",
        "`ETag` — fingerprint of the resource. Client sends it back in `If-None-Match`; server returns `304` if unchanged.",
        "`Location` — used with `201 Created` (URL of new resource) or `3xx` redirects.",
        "`Retry-After` — seconds to wait before retrying (used with `429` or `503`).",
        "`X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` — rate limit status.",
      ],
    },
    {
      heading: "Content Negotiation",
      body: `**Content negotiation** is how the client and server agree on the format of the response. The client declares what it can accept; the server picks the best match and signals its choice via \`Content-Type\` in the response. This allows one endpoint to serve JSON to an API client and HTML to a browser.`,
      code: `# Client requests JSON specifically
GET /api/report
Accept: application/json
→ 200 OK, Content-Type: application/json

# Client accepts JSON or XML (prefers JSON via q values)
GET /api/report
Accept: application/json;q=1.0, application/xml;q=0.8
→ 200 OK, Content-Type: application/json   (higher q wins)

# Client accepts anything (default browser behaviour)
GET /api/report
Accept: */*
→ Server picks its default (usually JSON for APIs)

# Server can't produce any accepted format
GET /api/report
Accept: application/pdf
→ 406 Not Acceptable`,
    },
  ],
};
