export const content = {
  title: "REST API Design",
  sections: [
    {
      heading: "Resources: Nouns, Not Verbs",
      body: `The most fundamental REST API design rule: URLs identify **resources** (nouns), and HTTP methods express the **action** (verb). Never put actions in the URL — that's what the HTTP method is for.`,
      code: `# ❌ Bad — verbs in URLs, ignores HTTP methods
GET  /getUser?id=42
POST /createUser
POST /deleteUser?id=42
POST /updateUserEmail

# ✅ Good — nouns in URLs, HTTP method carries the action
GET    /users/42           → retrieve user 42
POST   /users              → create a new user
PUT    /users/42           → replace user 42
PATCH  /users/42           → partial update of user 42
DELETE /users/42           → delete user 42

# Collections vs single resources
GET /users                 → list all users
GET /users/42              → get user 42
GET /users/42/orders       → orders belonging to user 42
GET /users/42/orders/99    → order 99 of user 42`,
    },
    {
      heading: "Naming Conventions",
      body: `Consistency in naming makes an API predictable and easy to learn. Pick a convention and stick to it across the entire API.`,
      items: [
        "Use **plural nouns** for collections: `/users`, `/products`, `/orders` — not `/user` or `/getProducts`",
        "Use **lowercase** and **hyphens** for multi-word paths: `/blog-posts`, `/user-profiles` — not camelCase or underscores",
        "Nest resources to express **ownership**: `/users/42/orders` — but avoid nesting deeper than 2 levels",
        "For actions that don't map cleanly to CRUD, use a sub-resource noun: `POST /orders/99/cancel` not `POST /cancelOrder?id=99`",
        "Keep names **stable** — changing a URL breaks clients. Versioning handles breaking changes.",
      ],
      code: `# Sub-resource for actions
POST /orders/99/cancel     ← cancel an order
POST /users/42/activate    ← activate an account
POST /emails/send          ← trigger an email send

# Filtering via query params (not nested paths)
GET /products?category=electronics&min_price=50
GET /users?role=admin&status=active
GET /orders?user_id=42&status=pending

# Consistent collection envelope
{
  "data": [...],
  "meta": { "total": 150, "page": 2, "per_page": 20 },
  "links": { "next": "/users?page=3", "prev": "/users?page=1" }
}`,
    },
    {
      heading: "Versioning",
      body: `APIs change. When a change breaks existing clients, you need a versioning strategy. The three common approaches each have trade-offs:`,
      items: [
        "**URL path** (`/v1/users`) — most visible and cacheable. Easy to route. The most widely adopted approach.",
        "**Accept header** (`Accept: application/vnd.myapi.v2+json`) — RESTfully correct, but hard to test in a browser and easy to get wrong.",
        "**Query parameter** (`/users?version=2`) — easy but pollutes the URL and is rarely cached well.",
        "When to break a version: removing a field, renaming a field, changing a field's type, or changing auth requirements.",
        "Additive changes (new optional fields, new endpoints) are **non-breaking** — no new version needed.",
      ],
      code: `# URL versioning (most common)
https://api.example.com/v1/users
https://api.example.com/v2/users

# Support old versions with a sunset header
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Link: <https://api.example.com/v2/users>; rel="successor-version"

# What changes require a new version:
# ❌ Breaking — remove "email" field from response
# ❌ Breaking — rename "user_id" to "id"
# ❌ Breaking — change auth from API key to OAuth
# ✅ Non-breaking — add new optional "phone" field
# ✅ Non-breaking — add new endpoint POST /users/bulk`,
    },
    {
      heading: "Pagination",
      body: `Never return unbounded collections. Large datasets must be paginated. Two main strategies:`,
      items: [
        "**Offset pagination** (`?page=2&limit=20` or `?offset=40&limit=20`) — simple to implement, intuitive for users. Problem: if items are inserted/deleted between pages, you can see duplicates or skip items.",
        "**Cursor pagination** (`?after=cursor_xyz&limit=20`) — uses an opaque pointer into the dataset. Consistent even with insertions/deletions. Used by most large-scale APIs (Twitter, Stripe, GitHub).",
        "Always include metadata in the response: total count, current page, next/prev links.",
        "Set a maximum page size and enforce it — `limit=1000000` should silently cap at your max.",
      ],
      code: `# Offset pagination
GET /api/posts?page=3&per_page=20
{
  "data": [...],
  "meta": {
    "total": 243,
    "page": 3,
    "per_page": 20,
    "total_pages": 13
  },
  "links": {
    "first": "/api/posts?page=1&per_page=20",
    "prev":  "/api/posts?page=2&per_page=20",
    "next":  "/api/posts?page=4&per_page=20",
    "last":  "/api/posts?page=13&per_page=20"
  }
}

# Cursor pagination (Stripe-style)
GET /api/events?limit=20&starting_after=evt_abc123
{
  "data": [...],
  "has_more": true,
  "next_cursor": "evt_xyz789"
}`,
    },
    {
      heading: "Error Responses",
      body: `Good error responses are as important as good success responses. They should tell the client exactly what went wrong and, where possible, how to fix it.`,
      code: `# ❌ Bad error response — unhelpful, inconsistent
HTTP/1.1 400 Bad Request
{"error": "invalid"}

# ✅ Good error response — structured, actionable
HTTP/1.1 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address"
      },
      {
        "field": "age",
        "code": "OUT_OF_RANGE",
        "message": "Must be between 0 and 150"
      }
    ],
    "request_id": "req_abc123",
    "docs": "https://docs.example.com/errors/VALIDATION_FAILED"
  }
}`,
    },
  ],
};
