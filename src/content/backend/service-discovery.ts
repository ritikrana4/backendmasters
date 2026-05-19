export const content = {
  title: "Service Discovery & Load Balancing",
  sections: [
    {
      heading: "The Problem: Dynamic Environments",
      body: `In a microservices architecture, service instances come and go — containers restart, scale up, and scale down. You can't hardcode IP addresses. **Service discovery** is the mechanism by which services find each other's current network location automatically.

There are two models: **client-side discovery** (the caller queries a registry and picks an instance) and **server-side discovery** (a load balancer or proxy handles routing, and the caller just talks to a stable address).`,
      items: [
        "**Client-side**: caller queries the registry (e.g. Consul), gets a list of healthy instances, picks one (round-robin, random, least-connections), and calls it directly",
        "**Server-side**: caller sends to a fixed address (VIP or DNS name); a load balancer resolves it to a live instance — caller knows nothing about individual instances",
        "**Kubernetes uses server-side**: a Service object gets a stable ClusterIP; kube-proxy routes to healthy Pods behind it",
        "**Service mesh (Istio, Linkerd)**: client-side discovery done transparently by a sidecar proxy — the app doesn't know it's happening",
      ],
    },
    {
      heading: "Service Registries",
      body: `A **service registry** is a database of running service instances and their health status. Services register on startup, deregister on shutdown (or are removed when health checks fail).`,
      code: `# Consul: register a service via its HTTP API
import requests

def register_service(name: str, host: str, port: int, service_id: str):
    payload = {
        "ID":      service_id,          # unique instance ID
        "Name":    name,                # logical service name
        "Address": host,
        "Port":    port,
        "Check": {                      # health check
            "HTTP":     f"http://{host}:{port}/health",
            "Interval": "10s",
            "Timeout":  "2s",
            "DeregisterCriticalServiceAfter": "30s",
        },
    }
    resp = requests.put("http://consul:8500/v1/agent/service/register", json=payload)
    resp.raise_for_status()

def discover_service(name: str) -> list[dict]:
    """Return list of healthy instances for a service name."""
    resp = requests.get(
        f"http://consul:8500/v1/health/service/{name}",
        params={"passing": "true"},   # only healthy instances
    )
    return [
        {
            "address": s["Service"]["Address"],
            "port":    s["Service"]["Port"],
        }
        for s in resp.json()
    ]

# Usage
instances = discover_service("order-service")
# [{"address": "10.0.1.5", "port": 8002}, {"address": "10.0.1.6", "port": 8002}]`,
    },
    {
      heading: "Load Balancing Algorithms",
      body: `Once you have a list of healthy instances, the client (or proxy) must pick one. The algorithm affects distribution, latency, and how well the system handles uneven load.`,
      code: `import itertools
import random

class RoundRobinBalancer:
    """Distributes requests evenly in order."""
    def __init__(self, instances: list[str]):
        self._cycle = itertools.cycle(instances)

    def pick(self) -> str:
        return next(self._cycle)

class RandomBalancer:
    """Picks a random instance — good for stateless services."""
    def __init__(self, instances: list[str]):
        self._instances = instances

    def pick(self) -> str:
        return random.choice(self._instances)

class LeastConnectionsBalancer:
    """Routes to the instance with fewest active requests."""
    def __init__(self, instances: list[str]):
        self._conns = {i: 0 for i in instances}

    def pick(self) -> str:
        return min(self._conns, key=self._conns.get)

    def request_started(self, instance: str): self._conns[instance] += 1
    def request_finished(self, instance: str): self._conns[instance] -= 1

# Demo
instances = ["10.0.1.5:8002", "10.0.1.6:8002", "10.0.1.7:8002"]
rr = RoundRobinBalancer(instances)
print("Round-robin:", [rr.pick() for _ in range(6)])

lc = LeastConnectionsBalancer(instances)
lc.request_started("10.0.1.5:8002")  # simulate 1 active request on first
lc.request_started("10.0.1.5:8002")  # simulate 2 active requests on first
print("Least-conn pick:", lc.pick())  # should pick .6 or .7`,
    },
    {
      heading: "Health Checks",
      body: `A load balancer is only useful if it routes to **healthy** instances. Health checks are periodic probes that determine whether an instance should receive traffic.`,
      code: `# FastAPI health check endpoint — expose this on every service
from fastapi import FastAPI
import time

app = FastAPI()
start_time = time.time()

@app.get("/health")
async def health_check():
    """
    Load balancers and service registries call this endpoint.
    Return 200 if ready to serve traffic, 503 if not.
    """
    checks = {}

    # Check database connectivity
    try:
        await db.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Check Redis connectivity
    try:
        await redis.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "error"

    healthy = all(v == "ok" for v in checks.values())
    return {
        "status":   "healthy" if healthy else "degraded",
        "checks":   checks,
        "uptime_s": int(time.time() - start_time),
    }
# HTTP 200 → load balancer sends traffic
# HTTP 503 → load balancer removes instance from rotation`,
    },
    {
      heading: "Kubernetes Service Discovery",
      body: `Kubernetes has service discovery built in. A **Service** object gives a stable DNS name and ClusterIP to a set of Pods. Kubernetes automatically routes traffic to healthy Pods and removes unhealthy ones.`,
      code: `# Kubernetes Service — gives stable DNS to order-service Pods
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service        # matches Pods with this label
  ports:
    - port: 80
      targetPort: 8002
  type: ClusterIP             # only reachable inside the cluster

# Any Pod in the cluster can now call:
#   http://order-service/orders/42
# Kubernetes DNS resolves "order-service" → ClusterIP
# kube-proxy forwards to a healthy Pod

# External traffic → LoadBalancer Service or Ingress
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  type: LoadBalancer          # provisions a cloud load balancer
  selector:
    app: api-gateway
  ports:
    - port: 443
      targetPort: 8080

# Readiness probe — Pod only receives traffic when ready
readinessProbe:
  httpGet:
    path: /health
    port: 8002
  initialDelaySeconds: 5
  periodSeconds: 10`,
    },
  ],
  starterCode: `# Service discovery + load balancing simulation

import random

class ServiceRegistry:
    """Simulates a service registry like Consul."""
    def __init__(self):
        self._services: dict[str, list[dict]] = {}

    def register(self, name: str, address: str, port: int):
        self._services.setdefault(name, [])
        self._services[name].append({"address": address, "port": port, "healthy": True})
        print(f"REGISTERED  {name} @ {address}:{port}")

    def deregister(self, name: str, address: str):
        self._services[name] = [
            s for s in self._services.get(name, [])
            if s["address"] != address
        ]
        print(f"DEREGISTERED {name} @ {address}")

    def healthy_instances(self, name: str) -> list[dict]:
        return [s for s in self._services.get(name, []) if s["healthy"]]


class LoadBalancer:
    def __init__(self, registry: ServiceRegistry):
        self.registry = registry

    def call(self, service: str, path: str) -> str:
        instances = self.registry.healthy_instances(service)
        if not instances:
            return f"503 No healthy instances for {service}"
        chosen = random.choice(instances)
        return f"200 {chosen['address']}:{chosen['port']}{path}"


registry = ServiceRegistry()
registry.register("order-service", "10.0.1.5", 8002)
registry.register("order-service", "10.0.1.6", 8002)
registry.register("order-service", "10.0.1.7", 8002)

lb = LoadBalancer(registry)
for _ in range(5):
    print(lb.call("order-service", "/orders/42"))

# Simulate a node going down
registry.deregister("order-service", "10.0.1.5")
print("\\nAfter deregistering 10.0.1.5:")
for _ in range(3):
    print(lb.call("order-service", "/orders/42"))
`,
};
