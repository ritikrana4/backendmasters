export const content = {
  title: "API Design Patterns",
  sections: [
    {
      heading: "REST vs RPC vs Event-Driven",
      body: `There are three primary patterns for how services and clients communicate. Choosing the right one depends on your use case, not trends.`,
      items: [
        "**REST** — resources as URLs, HTTP methods as verbs. Stateless, cacheable, human-readable. Best for public APIs and CRUD-heavy services.",
        "**RPC (gRPC)** — call remote functions directly. Binary protocol, strongly typed, efficient. Best for internal service-to-service communication.",
        "**GraphQL** — client specifies exactly what data it needs. One endpoint, flexible queries. Best for complex data graphs with multiple client types.",
        "**Event-driven** — services publish and subscribe to events. Decoupled, async, scalable. Best for workflows where multiple systems react to the same thing.",
        "Most production systems use REST for external APIs and a mix of gRPC + events for internal services.",
      ],
    },
    {
      heading: "REST API Design Rules",
      body: `Well-designed REST APIs are intuitive, consistent, and don't break existing clients when you add features. These rules prevent the most common mistakes.`,
      code: `# ✅ Nouns for resources, not verbs
GET    /users             # list users
POST   /users             # create user
GET    /users/42          # get user 42
PUT    /users/42          # replace user 42
PATCH  /users/42          # partially update user 42
DELETE /users/42          # delete user 42

# ✅ Nest related resources (but only one level deep)
GET /users/42/orders      # orders belonging to user 42
GET /orders/99/items      # items in order 99

# ❌ Verbs in URLs (RPC-style, not REST)
POST /createUser
POST /getUser
POST /deleteUser/42

# ✅ Consistent casing: kebab-case for URLs
GET /user-profiles        # not /userProfiles or /UserProfiles

# ✅ Plural resource names
GET /users                # not /user
GET /products             # not /product

# ✅ HTTP methods convey intent
GET    → read only, safe, idempotent
POST   → create, NOT idempotent
PUT    → full replace, idempotent
PATCH  → partial update, idempotent
DELETE → delete, idempotent`,
    },
    {
      heading: "Versioning",
      body: `APIs change. Versioning lets you evolve the API without breaking existing clients. There's no perfect strategy — pick one and be consistent.`,
      code: `# Strategy 1: URL path versioning (most common, most visible)
GET /v1/users
GET /v2/users     # v2 might return different fields

# Strategy 2: Header versioning (cleaner URLs, harder to test in browser)
GET /users
Accept: application/vnd.myapi.v2+json

# Strategy 3: Query parameter (simple, but pollutes URLs)
GET /users?version=2

# Best practices:
# - Never remove fields from a response (clients might depend on them)
# - Adding new optional fields is backward-compatible
# - Changing field types or removing fields requires a new version
# - Deprecate old versions with headers before removing
Deprecation: true
Sunset: Sat, 01 Jan 2026 00:00:00 GMT
Link: <https://api.example.com/v2/users>; rel="successor-version"`,
    },
    {
      heading: "Pagination",
      body: `Never return unbounded lists. Pagination is mandatory for any collection endpoint that could grow. Two main patterns: offset-based and cursor-based.`,
      code: `# Offset pagination (simple, but slow at large offsets)
GET /users?page=3&per_page=20
# SQL: SELECT * FROM users LIMIT 20 OFFSET 40

# Response
{
  "data": [...],
  "pagination": {
    "page": 3,
    "per_page": 20,
    "total": 1500,
    "total_pages": 75
  }
}

# ⚠ Problem: OFFSET 10000 makes the DB scan and discard 10000 rows
# ⚠ Problem: if rows are inserted while paginating, items shift

# Cursor pagination (recommended for large datasets and real-time data)
GET /users?limit=20&after=eyJpZCI6NDB9   # cursor is opaque (base64 encoded)
# SQL: SELECT * FROM users WHERE id > 40 ORDER BY id LIMIT 20

{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6NjB9",
    "has_more": true
  }
}
# Cursor is stable — insertions don't cause duplicates or skips`,
    },
    {
      heading: "Idempotency",
      body: `An operation is **idempotent** if calling it multiple times produces the same result as calling it once. Critical for reliability — networks fail, clients retry, and you need to handle duplicate requests safely.`,
      code: `# Idempotency key: client sends a unique key per logical operation
# Server stores the result and returns it on duplicate requests

POST /payments
Idempotency-Key: a5b3c1d2-e4f5-6789-abcd-ef0123456789
{
  "amount": 100,
  "currency": "USD",
  "to_account": "acc_123"
}

# Server implementation (pseudocode):
def create_payment(request):
    key = request.headers["Idempotency-Key"]

    # Check if we've seen this key before
    cached = redis.get(f"idem:{key}")
    if cached:
        return cached_response  # return the original response

    # Process the payment
    result = process_payment(request.body)

    # Store the result with TTL (24 hours is common)
    redis.setex(f"idem:{key}", 86400, result)
    return result

# GET, PUT, DELETE are naturally idempotent in REST
# POST is NOT idempotent — use idempotency keys for important operations`,
    },
    {
      heading: "Error Responses",
      body: `Consistent, informative error responses make APIs debuggable. Always return structured errors with a machine-readable code and a human-readable message.`,
      code: `# Consistent error response shape
{
  "error": {
    "code": "VALIDATION_ERROR",        # machine-readable, stable
    "message": "Email is invalid",     # human-readable
    "details": [                       # optional: per-field errors
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ],
    "request_id": "req_abc123"        # for log correlation
  }
}

# HTTP status codes map to categories:
# 400 Bad Request       → invalid input (client error)
# 401 Unauthorized      → not authenticated
# 403 Forbidden         → authenticated but not authorized
# 404 Not Found         → resource doesn't exist
# 409 Conflict          → resource state conflict (duplicate, wrong status)
# 422 Unprocessable     → syntactically valid but semantically invalid
# 429 Too Many Requests → rate limited
# 500 Internal Server   → unexpected server error (never leak details)
# 503 Service Unavailable → temporarily down`,
    },
  ],
};
