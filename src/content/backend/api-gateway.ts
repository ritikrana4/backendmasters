export const content = {
  title: "API Gateway Patterns",
  sections: [
    {
      heading: "What Is an API Gateway?",
      body: `An **API gateway** is a single entry point that sits in front of your backend services. Clients talk to the gateway; the gateway routes requests to the appropriate upstream service. It handles cross-cutting concerns — authentication, rate limiting, logging, SSL termination — so individual services don't have to.

Think of it as a reverse proxy with business logic: it knows your services, enforces policies, and can transform requests and responses.`,
      items: [
        "**Single entry point**: clients use one hostname instead of knowing every service's address",
        "**Authentication & authorisation**: validate JWTs or API keys once at the gateway, not in every service",
        "**Rate limiting**: enforce per-client or per-route quotas before traffic reaches services",
        "**SSL termination**: handle TLS at the gateway; internal traffic runs on plain HTTP",
        "**Request/response transformation**: rewrite URLs, add headers, translate between formats",
        "**Observability**: centralised logging, tracing, and metrics for all inbound traffic",
      ],
    },
    {
      heading: "Routing & Request Transformation",
      body: `The core job of a gateway is **routing**: mapping an inbound request path to an upstream service. Modern gateways can also rewrite paths, strip prefixes, add headers, and aggregate responses from multiple services.`,
      code: `# Nginx as a simple API gateway (nginx.conf)

upstream user_service   { server user-svc:8001; }
upstream order_service  { server order-svc:8002; }
upstream product_service { server product-svc:8003; }

server {
    listen 443 ssl;
    server_name api.example.com;

    # Route /users/* → UserService (strip the prefix)
    location /users/ {
        proxy_pass http://user_service/;   # trailing slash strips /users
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Route /orders/* → OrderService
    location /orders/ {
        proxy_pass http://order_service/;
        proxy_set_header Authorization $http_authorization;
    }

    # Route /products/* → ProductService
    location /products/ {
        proxy_pass http://product_service/;
    }
}

# Clients call: GET https://api.example.com/users/42
# Gateway forwards: GET http://user-svc:8001/42`,
    },
    {
      heading: "Authentication at the Gateway",
      body: `Centralising authentication at the gateway means each upstream service can trust that requests are already authenticated — it doesn't need to validate tokens itself. The gateway validates the JWT, then passes user identity in a header.`,
      code: `# Gateway validates JWT and injects user identity
# (Nginx + Lua example, or Kong plugin equivalent)

# 1. Client sends: GET /orders/mine
#    Authorization: Bearer eyJhbGci...

# 2. Gateway validates the JWT:
import jwt

def gateway_auth_middleware(request):
    token = request.headers.get("Authorization", "").removeprefix("Bearer ")
    try:
        claims = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return 401, {"error": "token expired"}
    except jwt.InvalidTokenError:
        return 401, {"error": "invalid token"}

    # 3. Strip the JWT from the upstream request
    #    Inject verified identity as a trusted internal header
    request.headers["X-User-Id"]   = str(claims["sub"])
    request.headers["X-User-Role"] = claims.get("role", "user")
    del request.headers["Authorization"]   # don't forward the raw token
    return forward_to_upstream(request)

# 4. OrderService reads the trusted header — no JWT validation needed
user_id = request.headers["X-User-Id"]   # already verified by gateway`,
    },
    {
      heading: "Rate Limiting at the Gateway",
      body: `Rate limiting at the gateway enforces quotas before traffic reaches services — protecting them from abuse and overload. Common strategies: per-IP, per-API-key, or per-user-tier.`,
      code: `# Redis-backed sliding window rate limiter (gateway layer)
import redis
import time

r = redis.Redis()

def check_rate_limit(api_key: str, limit: int = 100, window: int = 60) -> bool:
    """Returns True if request is allowed, False if rate limited."""
    now = time.time()
    key = f"ratelimit:{api_key}"

    pipe = r.pipeline()
    # Remove entries older than the window
    pipe.zremrangebyscore(key, 0, now - window)
    # Count remaining entries
    pipe.zcard(key)
    # Add the current request
    pipe.zadd(key, {str(now): now})
    # Set TTL so key expires automatically
    pipe.expire(key, window)
    _, count, *_ = pipe.execute()

    return count < limit

# Gateway checks before forwarding:
if not check_rate_limit(api_key=request.headers["X-API-Key"]):
    return 429, {"error": "rate limit exceeded", "retry_after": 60}

# Nginx rate limiting (simpler, no Redis needed):
# limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
# location /api/ {
#     limit_req zone=api burst=20 nodelay;
# }`,
    },
    {
      heading: "Popular API Gateway Options",
      body: `You have three main choices: managed cloud gateways, open-source self-hosted, or a custom Nginx/Caddy configuration.`,
      items: [
        "**AWS API Gateway**: fully managed, tight AWS integration, pay-per-request — good for serverless (Lambda) backends",
        "**Kong**: open-source, plugin-based, runs on Nginx/OpenResty — rich ecosystem, self-hosted or cloud",
        "**Nginx**: not a gateway out of the box, but location blocks + Lua (or NJS) cover most needs cheaply",
        "**Caddy**: automatic HTTPS, simple config, good for smaller setups",
        "**Traefik**: auto-discovers Docker/Kubernetes services via labels — zero-config routing in container environments",
        "**When to roll your own**: rarely — if your existing framework (FastAPI, Express) handles auth and rate limiting, a plain Nginx reverse proxy may be all you need",
      ],
    },
  ],
  starterCode: `# API Gateway routing simulation
# Shows how a gateway maps paths to services and injects identity

routes = {
    "/users":    "http://user-service:8001",
    "/orders":   "http://order-service:8002",
    "/products": "http://product-service:8003",
}

def resolve_upstream(path: str) -> str | None:
    for prefix, upstream in routes.items():
        if path.startswith(prefix):
            # Strip the route prefix; append the rest to the upstream URL
            remainder = path[len(prefix):]
            return upstream + remainder
    return None

# Simulate incoming requests
requests_in = [
    "/users/42",
    "/orders/mine",
    "/products/search?q=coffee",
    "/unknown/path",
]

for req in requests_in:
    upstream = resolve_upstream(req)
    if upstream:
        print(f"ROUTE  {req:30s} → {upstream}")
    else:
        print(f"404    {req:30s} → no upstream matched")
`,
};
