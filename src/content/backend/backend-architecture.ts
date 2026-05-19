export const content = {
  title: "Backend Architecture Overview",
  sections: [
    {
      heading: "What is a Backend?",
      body: `The **backend** is everything that runs on the server — the code that handles requests, executes business logic, reads and writes data, and returns responses. Users never interact with it directly; they go through a client (browser, mobile app, CLI) that talks to the backend over HTTP or another protocol.`,
      items: [
        "**Web server / application server** — the process that listens for requests and runs your code (Gunicorn, Uvicorn, Node.js, Go's net/http)",
        "**Database** — durable storage for your data (PostgreSQL, Redis, MongoDB)",
        "**Cache** — fast temporary storage to avoid repeated expensive operations (Redis, Memcached)",
        "**Message queue** — async communication between services (Kafka, RabbitMQ, SQS)",
        "**Object storage** — files, images, videos (S3, GCS, Cloudflare R2)",
        "**Background workers** — processes that handle work outside the request/response cycle (Celery, Sidekiq)",
      ],
    },
    {
      heading: "The Request Lifecycle",
      body: `Understanding what happens from a client request to a database query and back is fundamental to debugging, optimization, and system design.`,
      code: `Client Request
     │
     ▼
[DNS → IP]               # DNS resolves domain to server IP
     │
     ▼
[Load Balancer]          # distributes traffic across multiple server instances
     │
     ▼
[Reverse Proxy]          # Nginx/Caddy: TLS termination, static files, routing
     │
     ▼
[Application Server]     # your code (FastAPI, Express, Django, Go)
     │  │
     │  ├──→ [Cache]     # Redis: check cache first, skip DB if hit
     │  │
     │  ├──→ [Database]  # PostgreSQL: read/write persistent data
     │  │
     │  └──→ [Queue]     # RabbitMQ/Kafka: enqueue async work
     │
     ▼
[Response]               # JSON, HTML, or binary — back to the client`,
    },
    {
      heading: "Monolith vs Microservices",
      body: `A **monolith** packages all functionality into one deployable unit. **Microservices** split functionality into separate services that communicate over the network. Neither is universally better — the right choice depends on your team size, scale, and operational maturity.`,
      items: [
        "**Monolith advantages**: simple to develop, test, deploy, and debug. One codebase, one database, one deployment.",
        "**Monolith disadvantages**: as it grows, deployments get risky, teams step on each other, scaling requires scaling everything.",
        "**Microservices advantages**: independent deployments, technology choice per service, fault isolation, scales each service independently.",
        "**Microservices disadvantages**: distributed systems complexity — network failures, data consistency, tracing across services, much higher operational overhead.",
        "**The rule**: start with a monolith. Extract services when you have a clear team boundary, a specific scaling bottleneck, or a genuinely independent lifecycle.",
        "**Modular monolith**: best of both worlds — one deployment, but with enforced module boundaries that make extraction easy later.",
      ],
    },
    {
      heading: "Three-Tier Architecture",
      body: `Most web backends follow a **three-tier** (or layered) architecture: presentation, application, and data. This separation of concerns makes code testable, maintainable, and independently scalable.`,
      code: `# Three-tier architecture in a FastAPI app

# Tier 1 — Presentation (API layer)
# Handles HTTP: routing, request parsing, response formatting, auth
# app/routes/users.py
@router.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(404)
    return UserResponse.from_orm(user)

# Tier 2 — Application (service/business logic layer)
# Business rules, orchestration, no HTTP concerns
# app/services/user_service.py
def get_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def deactivate_user(db: Session, user_id: int) -> None:
    user = get_by_id(db, user_id)
    user.is_active = False
    db.commit()

# Tier 3 — Data (repository/model layer)
# Database models and queries, no business logic
# app/models/user.py
class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True)
    email      = Column(String, unique=True, nullable=False)
    is_active  = Column(Boolean, default=True)`,
    },
    {
      heading: "Stateless vs Stateful Servers",
      body: `A **stateless** server doesn't store any session data between requests. Each request is fully self-contained. Stateless servers are easy to scale horizontally — add more instances behind a load balancer, any server can handle any request.`,
      items: [
        "**Stateless** (preferred): session data lives in the database or cache (Redis), not in server memory. Any instance handles any request. Horizontal scaling is trivial.",
        "**Stateful**: server stores session data in memory. Requires sticky sessions — the load balancer must route the same client to the same server. Painful to scale, single point of failure.",
        "**Horizontal scaling**: add more server instances (stateless requirement). Cheap, elastic, fault-tolerant.",
        "**Vertical scaling**: add more CPU/RAM to one server. Has a ceiling, expensive, not fault-tolerant.",
        "Design your backend to be stateless from day one. Store state in Redis or the database, not in process memory.",
      ],
    },
  ],
};
