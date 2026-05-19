export const content = {
  title: "How the Web Works",
  sections: [
    {
      heading: "The Big Picture",
      body: `When you type a URL in a browser and press Enter, a remarkably coordinated sequence of events unfolds — across your computer, your router, multiple servers worldwide, and back — in under 500 milliseconds. Understanding this sequence is the foundation for everything else in networking, APIs, and web development.`,
      items: [
        "**DNS resolution** — translate the hostname to an IP address",
        "**TCP connection** — establish a reliable channel to that IP",
        "**TLS handshake** — negotiate encryption (for HTTPS)",
        "**HTTP request** — send the request to the server",
        "**HTTP response** — receive the server's answer",
        "**Rendering** — browser parses HTML/CSS/JS and paints the page",
      ],
    },
    {
      heading: "DNS — The Internet's Phone Book",
      body: `A **Domain Name System (DNS)** server translates human-readable hostnames like \`api.example.com\` into IP addresses like \`93.184.216.34\` that computers use to route packets. Your OS caches DNS results to avoid repeating this every request.`,
      code: `# What happens when you resolve api.example.com:

1. Browser cache  →  Is it cached? Use it.
2. OS cache       →  Is it in /etc/hosts or OS cache? Use it.
3. Recursive resolver (your ISP or 8.8.8.8)
4. Root nameserver  →  "Ask .com TLD server"
5. TLD nameserver   →  "Ask example.com's nameserver"
6. Authoritative nameserver  →  "93.184.216.34"

# Full round trip typically 20–120ms on first lookup
# Subsequent lookups: 0ms (cached)

# TTL (Time To Live) controls how long DNS is cached
# A record: api.example.com  →  93.184.216.34  TTL=300s`,
    },
    {
      heading: "IP Addresses and Ports",
      body: `An **IP address** identifies a machine on the network. A **port** identifies a specific service on that machine. Together they form a socket address: \`ip:port\`. Some ports are standardised by convention — your browser knows to use port 443 for HTTPS without you telling it.`,
      items: [
        "`80` — HTTP (unencrypted web traffic)",
        "`443` — HTTPS (encrypted web traffic)",
        "`22` — SSH",
        "`5432` — PostgreSQL",
        "`3306` — MySQL",
        "`6379` — Redis",
        "`0–1023` — well-known ports, require root/admin to bind",
        "`1024–49151` — registered ports, common for user services",
        "`49152–65535` — ephemeral ports, assigned dynamically to clients",
      ],
    },
    {
      heading: "TCP — Reliable Delivery",
      body: `**TCP (Transmission Control Protocol)** guarantees that data arrives in order and without corruption. Before any HTTP request is sent, a **three-way handshake** establishes the connection. This adds one round-trip of latency — a key reason HTTP/2 and HTTP/3 were designed to reduce connections.`,
      code: `# TCP Three-Way Handshake

Client                          Server
  |                               |
  |──── SYN ──────────────────>   |  "I want to connect"
  |                               |
  |   <──── SYN-ACK ─────────────|  "OK, ready"
  |                               |
  |──── ACK ──────────────────>   |  "Great, let's go"
  |                               |
  |   [connection established]    |
  |                               |
  |──── HTTP GET /... ─────────>  |  Now we can send data`,
    },
    {
      heading: "The Full Request Journey",
      body: `Putting it all together — the complete lifecycle of \`https://api.example.com/users\`:`,
      code: `Time 0ms    You press Enter

Time 1ms    Browser checks cache: no cached response

Time 5ms    DNS lookup: api.example.com → 93.184.216.34

Time 25ms   TCP SYN sent to 93.184.216.34:443

Time 50ms   TCP SYN-ACK received — connection open

Time 52ms   TLS ClientHello sent (negotiating encryption)

Time 80ms   TLS handshake complete — secure channel ready

Time 82ms   HTTP GET /users sent over the encrypted channel

Time 200ms  Server processes request, queries database

Time 230ms  HTTP 200 OK + JSON body received

Time 235ms  Browser parses and renders the response`,
    },
    {
      heading: "Client, Server, Proxy",
      body: `Web communication always follows a **client–server model**: the client initiates requests, the server responds. In practice, there are often intermediaries between them.`,
      items: [
        "**Client** — the requester: browser, mobile app, CLI tool, another server",
        "**Server** — the responder: web server, API server, static file host",
        "**Load balancer** — distributes requests across multiple server instances",
        "**Reverse proxy** — sits in front of servers (Nginx, Caddy) — handles TLS, caching, compression",
        "**CDN** — Content Delivery Network — caches static assets at edge servers close to users",
        "**Forward proxy** — sits in front of clients — used for caching, filtering, anonymity (VPNs)",
      ],
    },
  ],
};
