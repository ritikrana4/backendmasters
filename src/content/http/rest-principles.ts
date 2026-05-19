export const content = {
  title: "REST Principles",
  sections: [
    {
      heading: "What is REST?",
      body: `**REST** (Representational State Transfer) is an architectural style for distributed hypermedia systems, defined by Roy Fielding in his 2000 PhD dissertation. It's not a protocol or a standard — it's a set of six constraints. An API that follows them is called **RESTful**. Most "REST APIs" on the internet are actually REST-ish — they use HTTP methods and JSON but skip some constraints like HATEOAS.`,
    },
    {
      heading: "The Six Constraints",
      body: `Fielding defined six architectural constraints. Together they give REST systems their characteristic properties: scalability, simplicity, and evolvability.`,
      items: [
        "**1. Client–Server** — strict separation of concerns. UI (client) and data storage (server) evolve independently. Client doesn't know about the database; server doesn't know about rendering.",
        "**2. Stateless** — every request contains all information needed to fulfil it. No session stored on the server between requests. Makes servers easy to scale horizontally.",
        "**3. Cacheable** — responses must declare whether they're cacheable. Caching reduces latency and server load. (`Cache-Control`, `ETag`, `Last-Modified` headers implement this.)",
        "**4. Uniform Interface** — a consistent, standardised way to interact with any resource. Four sub-constraints: resource identification in requests, resource manipulation through representations, self-descriptive messages, and HATEOAS.",
        "**5. Layered System** — the client can't tell if it's talking directly to the server or through a load balancer, CDN, or proxy. Each layer only knows about the layer directly adjacent.",
        "**6. Code on Demand** (optional) — servers can send executable code to clients (JavaScript). The only optional constraint.",
      ],
    },
    {
      heading: "Resources and Representations",
      body: `The central concept in REST is the **resource** — any named concept: a user, an order, a collection of articles. A resource is identified by its URI. A **representation** is a snapshot of the resource's state at a point in time — typically JSON, but could be XML, HTML, or any format. You never transfer the resource itself; you transfer representations of it.`,
      code: `# The RESOURCE is "User 42" — an abstract concept
# The URI identifies it:
https://api.example.com/users/42

# A JSON REPRESENTATION of that resource:
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}

# An XML REPRESENTATION of the same resource:
<user>
  <id>42</id>
  <name>Alice</name>
  <email>alice@example.com</email>
</user>

# Same resource, different representations.
# The client requests its preferred format via Accept header.`,
    },
    {
      heading: "HATEOAS",
      body: `**HATEOAS** (Hypermedia As The Engine Of Application State) is the most misunderstood and most frequently skipped REST constraint. It means responses include links to related actions and resources — the client discovers what it can do next from the response itself, rather than having the actions hardcoded. In practice, few APIs implement this fully, but partial implementations are increasingly common.`,
      code: `# Without HATEOAS — client must know the URL structure
GET /api/orders/99
{
  "id": 99,
  "status": "pending",
  "total": 149.99
}
# Client has to know: "I should call DELETE /api/orders/99 to cancel"

# With HATEOAS — client follows links from the response
GET /api/orders/99
{
  "id": 99,
  "status": "pending",
  "total": 149.99,
  "_links": {
    "self":    { "href": "/api/orders/99" },
    "cancel":  { "href": "/api/orders/99/cancel", "method": "POST" },
    "payment": { "href": "/api/orders/99/payment" },
    "items":   { "href": "/api/orders/99/items" }
  }
}
# Client follows "cancel" link — no URL hardcoding`,
    },
    {
      heading: "REST vs SOAP",
      body: `Before REST became dominant, **SOAP** (Simple Object Access Protocol) was the standard for web services. Understanding the contrast clarifies why REST won.`,
      items: [
        "**SOAP** uses XML envelopes, WSDL schemas, and always POST — heavy, verbose, but formally specified",
        "**REST** uses HTTP methods semantically, any format (usually JSON) — lightweight and flexible",
        "SOAP has built-in standards for security (WS-Security), transactions, and reliability — valuable in enterprise/financial systems",
        "REST is simpler to implement, cache, and consume from browsers and mobile apps",
        "SOAP is still dominant in banking, healthcare (HL7), and legacy enterprise integrations",
        "gRPC has largely replaced SOAP for new high-performance service-to-service communication",
      ],
    },
  ],
};
