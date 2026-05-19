export const content = {
  title: "URLs & URIs",
  sections: [
    {
      heading: "URI vs URL vs URN",
      body: `These three terms are often confused. A **URI** (Uniform Resource Identifier) is the umbrella term — it uniquely identifies a resource. A **URL** (Uniform Resource Locator) is a URI that also tells you *how to find* the resource (its location and protocol). A **URN** (Uniform Resource Name) identifies a resource by name without specifying how to access it. In practice, almost everything you deal with on the web is a URL.`,
      items: [
        "**URI** — identifies a resource. All URLs and URNs are URIs.",
        "**URL** — identifies AND locates. `https://example.com/api/users` is a URL.",
        "**URN** — identifies by name, not location. `urn:isbn:978-0-596-51774-8` is a book's URN.",
        "In everyday usage, \"URL\" is almost always what people mean — even when they say \"URI\".",
      ],
    },
    {
      heading: "Anatomy of a URL",
      body: `Every URL is made of up to seven parts. Understanding each one helps you build and debug APIs correctly.`,
      code: `  https://api.example.com:8443/v1/users/42?include=posts&limit=10#profile
  ─────   ───────────────── ──── ──────────── ───────────────────── ───────
    │           │              │       │                │               │
 scheme       host           port    path            query          fragment

scheme   = https          (protocol: http, https, ftp, ws, wss...)
host     = api.example.com (domain name or IP address)
port     = 8443            (optional; defaults to 80 for http, 443 for https)
path     = /v1/users/42    (hierarchical location of the resource)
query    = include=posts&limit=10  (key=value pairs after ?)
fragment = profile         (client-side anchor; NOT sent to the server)`,
    },
    {
      heading: "Path Parameters vs Query Parameters",
      body: `Both carry data to the server, but they serve different semantic purposes. Choosing the wrong one is a common API design mistake.`,
      items: [
        "**Path parameters** — part of the resource identity. Used for IDs and hierarchical relationships: `/users/42`, `/posts/slug-title/comments`",
        "**Query parameters** — optional modifiers. Used for filtering, sorting, pagination, search: `?status=active&sort=created_at&page=2`",
        "Rule of thumb: if removing the parameter makes the URL point to a *different* resource, it's a path param. If it just *changes how* the resource is returned, it's a query param.",
      ],
      code: `# Path params — identify the resource
GET /api/users/42          →  user with ID 42
GET /api/posts/hello-world →  post with slug "hello-world"
GET /api/orders/99/items   →  items belonging to order 99

# Query params — filter, sort, paginate
GET /api/users?role=admin          →  all admin users
GET /api/products?min_price=10&max_price=100&sort=price
GET /api/posts?page=2&limit=20
GET /api/search?q=python+tutorial

# Combined
GET /api/users/42/orders?status=pending&sort=created_at`,
    },
    {
      heading: "URL Encoding (Percent Encoding)",
      body: `URLs can only contain a limited set of ASCII characters. Special characters (spaces, slashes, non-ASCII) must be **percent-encoded**: replaced with \`%\` followed by the character's hex code. Your HTTP library handles this automatically — but understanding it helps when reading raw requests and logs.`,
      code: `# Unsafe characters must be encoded
space  →  %20  (or + in query strings)
/      →  %2F  (when in a value, not a path separator)
?      →  %3F
#      →  %23
&      →  %26
=      →  %3D
@      →  %40

# Examples
GET /api/search?q=hello%20world       # "hello world"
GET /api/search?q=hello+world         # also "hello world" (query string only)
GET /api/files/path%2Fto%2Ffile.txt   # "path/to/file.txt" as a single segment

# Non-ASCII (UTF-8 encoded first, then percent-encoded)
"café"  →  caf%C3%A9
"日本語"  →  %E6%97%A5%E6%9C%AC%E8%AA%9E`,
    },
    {
      heading: "Absolute vs Relative URLs",
      body: `A **absolute URL** contains the full address including scheme and host. A **relative URL** is resolved against a base URL. Relative URLs are common in HTML documents but rare in API responses (prefer absolute URLs in APIs so clients don't need to know the base).`,
      code: `# Absolute URL — self-contained
https://api.example.com/v1/users/42

# Relative URL — depends on context
/v1/users/42           # relative to the origin (same host/port)
users/42               # relative to the current path
../orders              # parent path
//api.example.com/v1   # protocol-relative (inherits scheme)

# In API responses, always return absolute URLs for links:
{
  "id": 42,
  "name": "Alice",
  "links": {
    "self":   "https://api.example.com/v1/users/42",
    "orders": "https://api.example.com/v1/users/42/orders"
  }
}`,
    },
  ],
};
