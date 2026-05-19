export const content = {
  title: "WebSockets",
  sections: [
    {
      heading: "The Problem with HTTP for Real-Time",
      body: `HTTP is a request–response protocol: the client asks, the server answers, connection closes (or idles). For real-time features — chat, live scores, collaborative editing, stock tickers — you need the server to **push** data to the client as soon as it's available. Three approaches evolved to solve this:`,
      items: [
        "**Polling** — client asks the server every N seconds: `GET /messages`. Simple but wasteful (most responses are empty).",
        "**Long polling** — client asks, server holds the connection open until it has data to send. Better, but still lots of overhead per message.",
        "**WebSockets** — client and server upgrade to a persistent, full-duplex channel. Either side can send at any time with minimal overhead.",
      ],
    },
    {
      heading: "The WebSocket Handshake",
      body: `WebSockets start as an HTTP request and then **upgrade** to the WebSocket protocol. This is why WebSockets work through existing proxies and firewalls — they look like HTTP on port 80/443.`,
      code: `# Step 1: Client sends an HTTP Upgrade request
GET /chat HTTP/1.1
Host: ws.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

# Step 2: Server agrees to upgrade
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

# After this, the HTTP connection is replaced by a WebSocket connection.
# No more HTTP headers. Messages are sent as lightweight "frames".
# Either side can send a frame at any time.
# Connection stays open until one side sends a Close frame.`,
    },
    {
      heading: "WebSocket vs HTTP",
      body: `Understanding the difference helps you choose the right tool:`,
      items: [
        "**HTTP**: request–response, stateless, works with standard caches and CDNs, easy to load balance",
        "**WebSocket**: persistent connection, stateful, full-duplex, both sides push freely",
        "WebSocket frames have only 2–10 bytes of overhead vs 200+ bytes of HTTP headers per message — critical for high-frequency updates",
        "WebSocket connections are long-lived — a load balancer must route all frames from one client to the same server (sticky sessions)",
        "HTTP APIs are simpler to debug (curl, browser devtools), easier to cache, and better for standard CRUD",
        "Use WebSockets for: chat, notifications, live collaboration, game state, real-time dashboards",
      ],
      code: `# HTTP polling (wasteful)
Client → GET /new-messages  →  Server: [] (empty, nothing new)
Client → GET /new-messages  →  Server: [] (empty, nothing new)
Client → GET /new-messages  →  Server: [{"text": "Hi!"}]
# Hundreds of empty round trips for one message

# WebSocket (efficient)
Client ──────── WS CONNECT ────────→ Server
Client ←───── "User joined" ────────
Client ←───── "Alice: Hi!" ─────────
Client ──── "Bob: Hello!" ─────────→
Client ←───── "Alice: How are you?" ─
# One connection, zero wasted round trips`,
    },
    {
      heading: "Server-Sent Events (SSE)",
      body: `**Server-Sent Events** are a simpler alternative when you only need the server to push to the client (not bidirectional). SSE is just HTTP — no upgrade needed. The server holds the connection open and streams \`text/event-stream\` data. Built into browsers, automatic reconnection, and works through HTTP/2 multiplexing.`,
      code: `# SSE response — server streams events over a normal HTTP connection
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type": "price", "symbol": "AAPL", "price": 182.50}

data: {"type": "price", "symbol": "GOOG", "price": 141.20}

event: alert
data: {"message": "Market closes in 5 minutes"}

# Each "data:" line is one event.
# Blank line separates events.
# "id:" field enables automatic reconnection from last received event.
# "retry:" sets reconnection timeout in milliseconds.

# When to use SSE vs WebSockets:
# SSE  → server → client only (news feeds, notifications, progress bars)
# WS   → bidirectional (chat, games, collaborative editing)`,
    },
    {
      heading: "WebSocket Subprotocols and Libraries",
      body: `Raw WebSockets send unstructured bytes or text. In practice, teams define a message protocol on top. Libraries like **Socket.IO** add rooms, namespaces, automatic reconnection, and fallbacks to polling when WebSockets aren't available.`,
      items: [
        "**STOMP** — simple text-oriented protocol, used with message brokers (RabbitMQ, ActiveMQ)",
        "**Socket.IO** — popular JS library; adds rooms, namespaces, events, and fallbacks",
        "**GraphQL subscriptions** — often implemented over WebSockets",
        "Most production WebSocket servers run behind a proxy (Nginx, AWS ALB) that handles TLS termination",
        "WebSocket URIs use `ws://` (unencrypted) or `wss://` (encrypted, equivalent to HTTPS)",
      ],
    },
  ],
};
