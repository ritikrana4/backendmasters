export const content = {
  title: "Microservices Architecture",
  sections: [
    {
      heading: "Monolith vs Microservices",
      body: `A **monolith** is a single deployable unit where all features share a process, database, and codebase. A **microservices architecture** splits the system into small, independently deployable services — each owning its own data and communicating over the network.

Neither is universally better. Microservices solve real scaling and team-autonomy problems, but they introduce significant distributed-systems complexity. Start with a monolith; migrate when the pain is real.`,
      items: [
        "**Monolith pros**: simple to develop, test, and deploy; easy transactions; no network latency between modules",
        "**Monolith cons**: hard to scale individual components; one bad deploy affects everything; slows down as the team grows",
        "**Microservices pros**: independent deployments, independent scaling, fault isolation, team autonomy",
        "**Microservices cons**: network calls replace function calls (latency + failures); distributed transactions are hard; operational overhead multiplies",
        "**Rule of thumb**: don't split until a single team can no longer own the monolith, or until one component has dramatically different scaling needs",
      ],
    },
    {
      heading: "Bounded Contexts & Service Boundaries",
      body: `The hardest part of microservices is deciding where to cut. **Domain-Driven Design (DDD)** gives us the concept of a **bounded context** — a logical boundary within which a domain model is consistent and self-contained.

Each microservice should map to one bounded context. Services should be **loosely coupled** (minimal dependencies between them) and **highly cohesive** (related logic lives together).`,
      code: `# Bad split — services that must always call each other are too granular
UserService        → manages user accounts
ProfileService     → manages user profiles
PreferenceService  → manages user preferences
# Result: every user operation requires 3 network calls

# Better split — cohesive ownership
UserService        → accounts, profiles, preferences (one bounded context)
OrderService       → cart, checkout, order history
NotificationService → email, SMS, push

# Each service owns its data — no shared database
# UserService  → users_db
# OrderService → orders_db
# They communicate via API or events, not direct DB joins`,
    },
    {
      heading: "Inter-Service Communication",
      body: `Services need to talk to each other. There are two patterns: **synchronous** (caller waits for a response) and **asynchronous** (caller fires and continues).`,
      code: `# Synchronous: REST or gRPC (request/response)
# Use when: caller needs the result immediately
# Risk: if OrderService is down, UserService call fails

GET /users/42           # UserService asks OrderService
→ { "order_count": 7 }

# Asynchronous: message queue (fire-and-forget)
# Use when: caller doesn't need an immediate response
# Benefit: OrderService being down doesn't break the flow

# UserService publishes an event
{ "event": "user.deleted", "user_id": 42, "ts": "2025-01-01T00:00:00Z" }

# OrderService, NotificationService subscribe and react
# They process the event when they're ready

# gRPC — strongly typed, high-performance
# Define in orders.proto:
service OrderService {
  rpc GetOrderCount (UserRequest) returns (OrderCountResponse);
}
message UserRequest  { int64 user_id = 1; }
message OrderCountResponse { int64 count = 1; }`,
    },
    {
      heading: "Data Isolation — No Shared Database",
      body: `The most important rule: **each service owns its own database**. Sharing a database couples services at the storage layer — a schema change in one service can break another, and you lose independent deployability.

When you need data from another service, you have three options: call its API, subscribe to its events, or maintain a local read-model (CQRS).`,
      code: `# Wrong — shared database (tight coupling)
# Both services query the same users table directly
OrderService: SELECT * FROM users WHERE id = 42;   # reads UserService's table
# Now OrderService breaks if UserService renames a column

# Right — API call
# OrderService calls UserService's API to get user data
response = requests.get(f"http://user-service/users/{user_id}")
user = response.json()

# Right — event-driven read model
# OrderService subscribes to user.updated events and stores
# a local copy of the fields it needs
CREATE TABLE local_users (
  id         BIGINT PRIMARY KEY,
  email      TEXT,
  plan       TEXT,
  updated_at TIMESTAMPTZ
);
# Updated when a user.updated event arrives — eventual consistency`,
    },
    {
      heading: "The Strangler Fig Pattern",
      body: `The **strangler fig** is the safest way to migrate from a monolith to microservices. You don't rewrite the monolith — you incrementally extract services one capability at a time, routing traffic to the new service while the monolith still handles everything else.`,
      items: [
        "**Step 1**: put an API gateway or reverse proxy in front of the monolith",
        "**Step 2**: extract one bounded context (e.g. notifications) into a new service",
        "**Step 3**: route that traffic to the new service; monolith still handles the rest",
        "**Step 4**: repeat — extract the next service, test, route",
        "**Step 5**: over time the monolith shrinks and services grow until the monolith is gone",
        "**Key advantage**: the system is always running — no big-bang rewrite, no downtime",
      ],
    },
    {
      heading: "When NOT to Use Microservices",
      body: `Microservices are often adopted too early. The added complexity is only worth it under specific conditions.`,
      items: [
        "**Don't split** if a single team can comfortably own and deploy the entire codebase",
        "**Don't split** if you don't yet understand your domain boundaries — wrong cuts are worse than no cuts",
        "**Don't split** to improve performance — network calls are slower than function calls; start by profiling the monolith",
        "**Do split** when different parts need to scale independently (e.g. image processing vs API serving)",
        "**Do split** when multiple teams need to deploy independently without stepping on each other",
        "**Do split** when a component has a fundamentally different tech requirement (e.g. ML model serving in Python alongside a Go API)",
      ],
    },
  ],
  starterCode: `# Microservices communication demo
# Simulating two services talking via HTTP

import json

# --- Fake "UserService" response ---
def user_service_get_user(user_id: int) -> dict:
    # In reality: requests.get(f"http://user-service/users/{user_id}")
    users = {
        1: {"id": 1, "name": "Alice", "plan": "pro"},
        2: {"id": 2, "name": "Bob",   "plan": "free"},
    }
    return users.get(user_id) or {}

# --- "OrderService" uses UserService via API ---
def get_order_summary(order: dict) -> str:
    user = user_service_get_user(order["user_id"])
    if not user:
        return "Unknown user"
    discount = 0.1 if user["plan"] == "pro" else 0
    total = order["amount"] * (1 - discount)
    return f"{user['name']} — $\{total:.2f} (plan: {user['plan']})"

orders = [
    {"id": 101, "user_id": 1, "amount": 100.0},
    {"id": 102, "user_id": 2, "amount": 50.0},
]

for order in orders:
    print(get_order_summary(order))
`,
};
