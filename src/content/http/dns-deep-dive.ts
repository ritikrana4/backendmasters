export const content = {
  title: "DNS Deep Dive",
  sections: [
    {
      heading: "How DNS Resolution Works",
      body: `**DNS (Domain Name System)** translates human-readable hostnames into IP addresses. When your browser visits \`api.example.com\`, it doesn't know the IP — DNS resolution finds it.

The resolution chain involves four actors: the **stub resolver** (your OS), the **recursive resolver** (your ISP or a public DNS like 8.8.8.8), **root nameservers**, and **authoritative nameservers**.`,
      code: `# Full DNS resolution for "api.example.com"

# 1. Browser checks its own cache → miss
# 2. OS checks /etc/hosts → miss
# 3. OS stub resolver asks the recursive resolver (e.g. 8.8.8.8)

# 4. Recursive resolver checks its cache → miss → starts recursive lookup:

#    a. Ask a root nameserver (.):
#       "Who handles .com?"
#       → "Try the .com TLD nameservers at a.gtld-servers.net"

#    b. Ask the .com TLD nameserver:
#       "Who handles example.com?"
#       → "Try ns1.example.com (the authoritative nameserver)"

#    c. Ask ns1.example.com (the authoritative nameserver):
#       "What is the IP of api.example.com?"
#       → "93.184.216.34, TTL=300"

# 5. Recursive resolver caches the answer (for TTL=300 seconds = 5 minutes)
#    Returns it to the stub resolver

# 6. OS caches it; browser connects to 93.184.216.34

# Total time: ~50–100ms first lookup; near-zero on cache hit

# Inspect DNS resolution from your terminal:
# dig api.example.com
# dig +trace api.example.com   # shows every step of the chain`,
    },
    {
      heading: "DNS Record Types",
      body: `Each DNS record type serves a specific purpose. Knowing them is essential for configuring domains, email, and services.`,
      code: `# A record — hostname → IPv4 address (most common)
api.example.com.     300  IN  A     93.184.216.34

# AAAA record — hostname → IPv6 address
api.example.com.     300  IN  AAAA  2606:2800:220:1:248:1893:25c8:1946

# CNAME — hostname → another hostname (canonical name alias)
# www.example.com is an alias for example.com
www.example.com.     300  IN  CNAME example.com.
# ⚠ CNAME cannot coexist with other records at the same name
# ⚠ Never CNAME the zone apex (example.com) — use ALIAS/ANAME or A record

# MX — mail exchange, with priority
example.com.         300  IN  MX  10  mail1.example.com.
example.com.         300  IN  MX  20  mail2.example.com.  # fallback

# TXT — arbitrary text, used for:
#   - SPF (email anti-spoofing)
#   - DKIM public key
#   - Domain ownership verification
example.com.  300  IN  TXT  "v=spf1 include:_spf.google.com ~all"

# SRV — service location (host + port + priority)
# _service._proto.name  TTL class SRV priority weight port target
_https._tcp.example.com. 300 IN SRV 10 5 443 api.example.com.

# NS — nameserver records (who is authoritative for this zone)
example.com.  86400 IN  NS  ns1.example.com.
example.com.  86400 IN  NS  ns2.example.com.`,
    },
    {
      heading: "TTL & Caching",
      body: `**TTL (Time to Live)** is set by the zone owner and tells resolvers how long to cache a record before re-querying. It controls the propagation delay when you change a record — if your TTL is 86400 (24h), it can take 24h for the new IP to be seen globally.`,
      items: [
        "**Low TTL (60–300s)**: changes propagate quickly — good for records you might need to update (failover, migrations). Increases load on your nameservers.",
        "**High TTL (3600–86400s)**: cached globally for hours/days — reduces nameserver load. Slow to propagate changes.",
        "**Best practice before a migration**: lower TTL to 60s a day before. Do the cutover. Raise TTL back to 3600s after confirming the new IP is correct.",
        "**Negative TTL (SOA NXTTL)**: how long to cache a 'this name doesn't exist' response — prevents hammering your nameserver for missing names.",
        "**Stub resolver caches separately**: your OS also caches DNS. `sudo systemd-resolve --flush-caches` (Linux) or `sudo dscacheutil -flushcache` (macOS) clears it.",
      ],
    },
    {
      heading: "DNS in Production",
      body: `DNS is used for more than just hostname resolution — it's a building block for traffic management, failover, and multi-region routing.`,
      code: `# Geo-routing with Route 53 (AWS)
# US users → us-east-1 servers
# EU users → eu-west-1 servers

# Latency-based routing record:
api.example.com  A  54.0.0.1   # us-east-1 — served to US clients
api.example.com  A  54.1.0.1   # eu-west-1 — served to EU clients
# Route 53 picks the record with lowest latency to the client

# Health-check failover
api.example.com  A  54.0.0.1  PRIMARY   # Route 53 monitors /health
api.example.com  A  54.2.0.1  SECONDARY # activated if PRIMARY is unhealthy

# Split-horizon DNS
# Internal network returns internal IP (for latency + security)
# External clients get public IP

# Internal nameserver returns:
api.example.com  A  10.0.1.100   # private IP

# Public nameserver returns:
api.example.com  A  54.0.0.1     # public IP

# Python: DNS lookup
import socket
ip = socket.gethostbyname("api.example.com")
print(f"api.example.com → {ip}")

# Using dnspython for full record inspection
# pip install dnspython
import dns.resolver
answers = dns.resolver.resolve("example.com", "MX")
for rdata in answers:
    print(f"MX: priority={rdata.preference} exchange={rdata.exchange}")`,
    },
    {
      heading: "Common DNS Gotchas",
      body: `DNS problems are subtle and often slow to manifest. These are the issues you'll actually hit in production.`,
      items: [
        "**CNAME at the zone apex**: `example.com` cannot be a CNAME — only subdomains can. Use an ALIAS/ANAME record (Cloudflare, Route 53) or an A record pointing to the IP.",
        "**Propagation delay**: when you change a record, resolvers holding a cached copy won't see the change until TTL expires. Lower TTL before making changes.",
        "**Container DNS caching**: JVM and some languages cache DNS lookups forever by default. Explicitly set `networkaddress.cache.ttl=30` in JVM; check your language's resolver.",
        "**DNS-based service discovery**: services in Docker/Kubernetes use DNS to find each other. If your app caches the IP from DNS at startup, it won't notice when Pods are replaced.",
        "**DNSSEC**: cryptographically signs DNS records to prevent cache poisoning. Required by some compliance frameworks; adds complexity. Managed by your DNS provider.",
        "**Negative caching**: if a name doesn't exist, that 'NXDOMAIN' is also cached. A misconfigured record that you fix quickly may still return NXDOMAIN to resolvers for the full negative TTL.",
      ],
    },
  ],
  starterCode: `# DNS record types demonstration (simulated)
# In real code you'd use: import socket or pip install dnspython

# Simulated DNS zone for "example.com"
dns_zone = {
    "example.com": {
        "A":   ["93.184.216.34"],
        "MX":  [(10, "mail1.example.com"), (20, "mail2.example.com")],
        "NS":  ["ns1.example.com", "ns2.example.com"],
        "TXT": ["v=spf1 include:_spf.google.com ~all"],
    },
    "www.example.com": {
        "CNAME": "example.com",
    },
    "api.example.com": {
        "A": ["93.184.216.100"],
    },
}

def dns_lookup(name: str, record_type: str):
    zone = dns_zone.get(name)
    if not zone:
        return f"NXDOMAIN: {name} does not exist"

    # Follow CNAME chain
    if "CNAME" in zone and record_type != "CNAME":
        target = zone["CNAME"]
        print(f"  {name} CNAME → {target}")
        return dns_lookup(target, record_type)

    records = zone.get(record_type)
    if not records:
        return f"NODATA: {name} has no {record_type} record"
    return records

# Try some lookups
queries = [
    ("example.com",     "A"),
    ("example.com",     "MX"),
    ("www.example.com", "A"),    # will follow CNAME
    ("api.example.com", "A"),
    ("missing.example.com", "A"),
]

for name, rtype in queries:
    result = dns_lookup(name, rtype)
    print(f"{rtype:6} {name:25} → {result}")
`,
};
