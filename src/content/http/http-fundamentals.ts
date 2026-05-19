export const content = {
  title: "HTTP Fundamentals",
  sections: [
    {
      heading: "Request and Response",
      body: `HTTP (**HyperText Transfer Protocol**) is a text-based, stateless request–response protocol. Every interaction is a pair: the client sends a **request**, the server returns a **response**. Stateless means each request carries all the information the server needs — the server doesn't remember previous requests.`,
      code: `# An HTTP request — what your browser actually sends

GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
User-Agent: Mozilla/5.0


# An HTTP response — what the server sends back

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 89
Cache-Control: max-age=60

{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com"
}`,
    },
    {
      heading: "HTTP Methods",
      body: `The method tells the server what action to perform. Methods have two important properties: **safe** (does not modify state) and **idempotent** (calling it multiple times has the same effect as calling it once).`,
      items: [
        "`GET` — retrieve a resource. Safe + idempotent. Never use GET to modify data.",
        "`POST` — create a resource or trigger an action. Neither safe nor idempotent.",
        "`PUT` — replace a resource entirely. Idempotent (calling twice = same result).",
        "`PATCH` — partially update a resource. Not inherently idempotent.",
        "`DELETE` — remove a resource. Idempotent.",
        "`HEAD` — same as GET but returns headers only, no body. Safe + idempotent.",
        "`OPTIONS` — describe what methods the server supports for a URL. Used by CORS preflight.",
      ],
      code: `# GET — retrieve user 42
GET /api/users/42

# POST — create a new user
POST /api/users
Body: {"name": "Bob", "email": "bob@example.com"}

# PUT — fully replace user 42
PUT /api/users/42
Body: {"name": "Bob Smith", "email": "bob@example.com", "role": "admin"}

# PATCH — update only the email
PATCH /api/users/42
Body: {"email": "bobsmith@example.com"}

# DELETE — remove user 42
DELETE /api/users/42`,
    },
    {
      heading: "Status Codes",
      body: `Every response has a three-digit status code telling the client what happened. The first digit defines the category:`,
      items: [
        "**1xx — Informational**: `100 Continue`, `101 Switching Protocols` (WebSocket upgrade)",
        "**2xx — Success**: `200 OK`, `201 Created`, `204 No Content`",
        "**3xx — Redirect**: `301 Moved Permanently`, `302 Found`, `304 Not Modified`",
        "**4xx — Client Error**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`",
        "**5xx — Server Error**: `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`",
      ],
      code: `201 Created          — POST /api/users succeeded, new resource at Location header
204 No Content       — DELETE succeeded, nothing to return
301 Moved Permanently— The URL has permanently changed (update your bookmarks)
304 Not Modified     — Cached version is still fresh (If-None-Match matched ETag)
400 Bad Request      — Malformed JSON, missing required field
401 Unauthorized     — No auth token, or token expired (misleadingly named)
403 Forbidden        — Valid token, but you don't have permission
404 Not Found        — Resource doesn't exist
409 Conflict         — Username already taken
422 Unprocessable    — Valid JSON, but semantic validation failed
429 Too Many Requests— Rate limit exceeded
500 Internal Error   — Something broke server-side (check server logs)
503 Service Unavailable — Server is overloaded or down for maintenance`,
    },
    {
      heading: "HTTP Versions",
      body: `HTTP has evolved significantly since its introduction, each version addressing bottlenecks of the previous one:`,
      items: [
        "**HTTP/1.0** (1996) — new TCP connection for every single request. Very slow.",
        "**HTTP/1.1** (1997) — persistent connections (keep-alive), pipelining. Still the most common.",
        "**HTTP/2** (2015) — binary framing, multiplexing (multiple requests on one connection), header compression, server push.",
        "**HTTP/3** (2022) — runs over QUIC (UDP-based) instead of TCP. Eliminates head-of-line blocking. Faster on lossy networks.",
      ],
      code: `# HTTP/1.1: requests are serialised per connection
# (pipelining rarely works in practice)
Connection 1: GET /page  →  wait  →  GET /style.css  →  wait  →  GET /app.js

# HTTP/2: multiple requests fly over one connection simultaneously
Connection 1: GET /page  ─┐
              GET /style  ─┤  all in parallel over one TCP connection
              GET /app.js ─┘

# HTTP/3: same multiplexing but on QUIC (UDP)
# A dropped packet only stalls that stream, not all streams`,
    },
    {
      heading: "Statelessness",
      body: `HTTP is **stateless** — the server treats every request as independent and remembers nothing between them. This makes servers easy to scale horizontally (any server can handle any request) but means that if you need state (user sessions, shopping carts), you must explicitly carry it in every request — via cookies, tokens, or session IDs. This is a deliberate design choice, not a limitation.`,
      code: `# Request 1 — login
POST /auth/login
Body: {"email": "alice@example.com", "password": "secret"}
Response: {"token": "eyJhbGci..."}

# Request 2 — get profile
# The server has NO memory of Request 1.
# You must prove who you are again by sending the token.
GET /api/me
Authorization: Bearer eyJhbGci...
Response: {"id": 1, "name": "Alice"}

# Without the Authorization header, the server returns 401.
# It didn't "forget" you — it never knew you to begin with.`,
    },
  ],
};
