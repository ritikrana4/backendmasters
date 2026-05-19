export const content = {
  title: "gRPC & Protocol Buffers",
  sections: [
    {
      heading: "What is gRPC?",
      body: `**gRPC** (gRPC Remote Procedure Call) is a high-performance, open-source RPC framework developed by Google. Instead of exchanging JSON over HTTP/1.1, gRPC uses **Protocol Buffers** (a binary serialisation format) over **HTTP/2**. It's designed for service-to-service communication where performance, type safety, and bi-directional streaming matter.`,
      items: [
        "**Binary protocol** — Protocol Buffers are 5–10× smaller and faster to parse than JSON",
        "**HTTP/2 transport** — multiplexing, header compression, server push built-in",
        "**Strongly typed contracts** — `.proto` files define the schema; code is generated for any language",
        "**Bi-directional streaming** — client, server, or both can stream data simultaneously",
        "**Code generation** — gRPC generates client and server stubs in Go, Python, Java, Node.js, and more",
      ],
    },
    {
      heading: "Protocol Buffers",
      body: `**Protocol Buffers** (protobuf) is a language-neutral, platform-neutral mechanism for serialising structured data. You define your data structures in a \`.proto\` file, then the \`protoc\` compiler generates strongly-typed code in your target language.`,
      code: `// users.proto — define messages and services

syntax = "proto3";

package users;

// Message definitions (like types/schemas)
message User {
  string id    = 1;   // field number (used for encoding, never change)
  string name  = 2;
  string email = 3;
  int32  age   = 4;
}

message GetUserRequest {
  string id = 1;
}

message CreateUserRequest {
  string name  = 1;
  string email = 2;
  int32  age   = 3;
}

message ListUsersResponse {
  repeated User users = 1;   // repeated = array
}

// Service definition (like an API interface)
service UserService {
  rpc GetUser    (GetUserRequest)    returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc ListUsers  (google.protobuf.Empty) returns (ListUsersResponse);

  // Server streaming — server sends a stream of Users
  rpc WatchUsers (google.protobuf.Empty) returns (stream User);
}`,
    },
    {
      heading: "The Four Communication Patterns",
      body: `gRPC supports four streaming patterns, all over the same HTTP/2 connection:`,
      items: [
        "**Unary** — one request, one response. Equivalent to a standard HTTP request: `rpc GetUser(Request) returns (Response)`",
        "**Server streaming** — one request, stream of responses. Great for large dataset downloads, live updates: `rpc ListUsers(Request) returns (stream Response)`",
        "**Client streaming** — stream of requests, one response. Great for uploading large files in chunks: `rpc UploadData(stream Request) returns (Response)`",
        "**Bidirectional streaming** — stream of requests and stream of responses simultaneously. Great for chat, real-time collaboration: `rpc Chat(stream Message) returns (stream Message)`",
      ],
      code: `// Four streaming patterns in proto3

service DataService {
  // Unary — request/response
  rpc GetItem (GetItemRequest) returns (Item);

  // Server streaming — client gets a stream of items
  rpc ListItems (ListRequest) returns (stream Item);

  // Client streaming — client uploads chunks, gets summary
  rpc UploadItems (stream Item) returns (UploadSummary);

  // Bidirectional streaming — chat-like
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}`,
    },
    {
      heading: "gRPC vs REST vs GraphQL",
      body: `Choosing the right protocol depends on who your clients are and what your performance requirements are:`,
      items: [
        "**REST** — human-readable, cacheable, browser-friendly. Best for public APIs and teams starting out.",
        "**GraphQL** — flexible querying, great for multiple clients needing different shapes. Best for complex data graphs.",
        "**gRPC** — binary, fast, streaming, strongly typed. Best for internal microservice communication.",
        "gRPC is not browser-native — browsers can't call gRPC directly without gRPC-Web or a translation layer",
        "gRPC is dominant inside cloud-native systems: Kubernetes, Envoy, most large-scale microservice meshes use it",
        "gRPC errors use numeric codes (0=OK, 5=NOT_FOUND, 7=PERMISSION_DENIED) instead of HTTP status codes",
      ],
      code: `# Same operation in REST, GraphQL, and gRPC

# REST
GET /api/users/42
→ { "id": "42", "name": "Alice", "email": "alice@example.com" }

# GraphQL
POST /graphql
query { user(id: "42") { name email } }
→ { "data": { "user": { "name": "Alice", "email": "..." } } }

# gRPC (conceptual — actually binary over HTTP/2)
UserService.GetUser({ id: "42" })
→ User { id: "42", name: "Alice", email: "alice@example.com" }

# Performance comparison (approximate)
Payload size:
  REST/JSON   ~150 bytes
  GraphQL/JSON ~120 bytes (no unused fields)
  gRPC/Protobuf ~20 bytes

Parse time:
  JSON   ~1ms
  Protobuf ~0.1ms`,
    },
    {
      heading: "When to Use gRPC",
      body: `gRPC shines in specific scenarios. Don't use it just because it's fast — the tooling complexity has a real cost.`,
      items: [
        "✅ Internal microservice-to-microservice calls where performance matters",
        "✅ You need bi-directional streaming (real-time data pipelines, live collaboration)",
        "✅ Polyglot teams — generated clients ensure type safety across Go, Python, Java, etc.",
        "✅ Large-scale systems where bandwidth and serialization costs are measurable",
        "❌ Public APIs consumed by third-party developers — JSON/REST is far more accessible",
        "❌ Browser-based clients — requires gRPC-Web proxy layer (extra complexity)",
        "❌ Simple CRUD with infrequent calls — REST is fine and far simpler to debug",
      ],
    },
  ],
};
