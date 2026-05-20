export const content = {
  title: "Docker Networking",
  sections: [
    {
      heading: "Docker Network Drivers",
      body: "Docker provides several **network drivers** that control how containers communicate with each other and the outside world. Each container gets its own network namespace — a completely isolated network stack with its own interfaces, routing table, and iptables rules.\n\nDocker creates three default networks on install: `bridge` (the default for standalone containers), `host` (shares the host network stack), and `none` (no networking). For multi-container applications, always create **custom bridge networks** instead of using the default bridge.",
      items: [
        "`bridge` — default. Creates a virtual switch (`docker0`). Containers on the same bridge can communicate by IP; use custom bridges for DNS resolution by name.",
        "`host` — container shares the host's network stack. No isolation. Useful for high-performance networking or when binding to a specific host port without mapping.",
        "`overlay` — multi-host networking for Docker Swarm and Kubernetes. Creates a virtual network spanning multiple Docker hosts.",
        "`macvlan` — assigns a real MAC address to the container, making it appear as a physical device on the network. Used for legacy apps that expect direct network access.",
        "`none` — no networking at all. Container has only a loopback interface.",
      ],
    },
    {
      heading: "Custom Bridge Networks",
      body: "The default `bridge` network has a critical limitation: containers can only communicate by IP address, not by name. **Custom bridge networks** provide automatic DNS resolution — containers can reach each other by container name or service name.\n\nCustom networks also provide better isolation: containers on different custom networks cannot communicate by default, even on the same host. This is the foundation of Docker Compose's networking model.",
      code: `# Create a custom network
docker network create --driver bridge my-app-network

# Run containers on the network — they resolve by name
docker run -d --name postgres --network my-app-network postgres:16
docker run -d --name api --network my-app-network \\
  -e DB_HOST=postgres \\       # 'postgres' resolves to the container's IP
  my-api:latest

# In docker-compose.yml — networks are created automatically
services:
  api:
    image: my-api:latest
    networks:
      - backend
    environment:
      DB_HOST: db  # resolves by service name

  db:
    image: postgres:16
    networks:
      - backend

networks:
  backend:
    driver: bridge`,
    },
    {
      heading: "Port Mapping & Exposing Services",
      body: "Containers are isolated from the host network by default. To accept traffic from outside the container, you **publish ports** with `-p host_port:container_port`. Docker adds iptables rules that redirect traffic from the host port to the container.\n\n`EXPOSE` in a Dockerfile is documentation only — it doesn't publish the port. You still need `-p` at runtime (or `ports:` in Compose).",
      code: `# Map host port 8080 to container port 3000
docker run -p 8080:3000 my-app

# Map on a specific interface (localhost only — don't expose to external network)
docker run -p 127.0.0.1:5432:5432 postgres

# Map a random host port (useful for multiple instances)
docker run -p 3000 my-app   # Docker picks a random host port
docker port <container_id>  # find out which port was assigned

# Multiple port mappings
docker run -p 80:80 -p 443:443 nginx`,
      items: [
        "`-p 0.0.0.0:8080:3000` (default) — binds on all host interfaces. Accessible from outside the machine.",
        "`-p 127.0.0.1:8080:3000` — binds on localhost only. Use for dev databases you don't want exposed.",
        "`--network host` — no port mapping needed; the container uses the host's ports directly. Linux only.",
      ],
    },
    {
      heading: "Container DNS & Service Discovery",
      body: "On a custom bridge network, Docker runs an embedded DNS server (at `127.0.0.11`). Each container's `/etc/resolv.conf` points to this DNS server, which resolves container names and service names to their IP addresses. This works even when containers are stopped and restarted with new IPs.\n\nIn Docker Compose, every service is reachable by its **service name** from any container in the same Compose project. This removes the need to hard-code IPs — just use the service name as the hostname.",
      code: `# Diagnose container networking
# What networks is a container on?
docker inspect my-container | grep -A 20 '"Networks"'

# Container's IP on a specific network
docker network inspect my-app-network

# Test DNS resolution from inside a container
docker exec -it api sh -c "nslookup db"
docker exec -it api sh -c "curl http://db:5432"

# List all networks
docker network ls

# Remove unused networks
docker network prune`,
      items: [
        "Containers on the same Compose project (same `docker-compose.yml`) are on the same default network automatically.",
        "Containers on **different** Compose projects are isolated — connect them by creating a shared external network.",
        "`--link` is legacy and deprecated. Use custom networks for container-to-container communication.",
        "`extra_hosts` in Compose adds entries to `/etc/hosts` — useful for resolving a host machine IP inside containers.",
      ],
    },
  ],
};
