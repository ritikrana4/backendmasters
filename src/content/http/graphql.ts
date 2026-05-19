export const content = {
  title: "GraphQL",
  sections: [
    {
      heading: "What is GraphQL?",
      body: `**GraphQL** is a query language for APIs and a runtime for executing those queries, developed by Facebook in 2012 and open-sourced in 2015. Instead of multiple fixed endpoints that return predetermined shapes, GraphQL exposes a **single endpoint** where clients specify exactly the data they need — no more, no less.`,
      items: [
        "**Single endpoint** — typically `POST /graphql`. No `/users`, `/products`, `/orders` — just one URL.",
        "**Client-specified shape** — the client declares exactly which fields it wants in the response",
        "**Strongly typed schema** — every piece of data has a declared type; the schema is the contract",
        "**Introspection** — clients can query the API to discover its own schema",
        "**No over-fetching** — get exactly the fields you need, nothing extra",
        "**No under-fetching** — get data from multiple resources in a single request",
      ],
    },
    {
      heading: "Schema Definition Language",
      body: `The **Schema Definition Language (SDL)** describes the types and operations available. The schema is the source of truth between frontend and backend teams.`,
      code: `# A GraphQL schema
type User {
  id: ID!             # ID type, ! means non-nullable (required)
  name: String!
  email: String!
  age: Int
  posts: [Post!]!     # List of Posts, list itself non-null, items non-null
  role: Role!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  published: Boolean!
  createdAt: String!
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

# The root types — entry points into the API
type Query {
  user(id: ID!): User
  users(role: Role): [User!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(name: String!, email: String!): User!
  deleteUser(id: ID!): Boolean!
}

type Subscription {
  postPublished: Post!
}`,
    },
    {
      heading: "Queries",
      body: `A GraphQL **query** reads data. The client specifies fields in a tree structure that mirrors the shape of the desired response. No extra fields are returned.`,
      code: `# Fetch a user and their posts — one request, no over/under fetching
query {
  user(id: "42") {
    name
    email
    posts {
      title
      published
    }
  }
}

# Response — exactly the shape requested
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "posts": [
        { "title": "Hello GraphQL", "published": true },
        { "title": "REST vs GraphQL", "published": false }
      ]
    }
  }
}

# Variables — parameterise queries
query GetUser($userId: ID!) {
  user(id: $userId) { name email }
}
# Variables: { "userId": "42" }`,
    },
    {
      heading: "Mutations and Subscriptions",
      body: `**Mutations** modify data (create, update, delete). **Subscriptions** are long-lived requests that push real-time updates when data changes — typically implemented over WebSockets.`,
      code: `# Mutation — create a user and get back the created data
mutation {
  createUser(name: "Bob", email: "bob@example.com") {
    id
    name
    email
  }
}

# Response
{
  "data": {
    "createUser": { "id": "99", "name": "Bob", "email": "bob@example.com" }
  }
}

# Subscription — receive live updates
subscription {
  postPublished {
    id
    title
    author { name }
  }
}
# Server pushes this message whenever a post is published:
{
  "data": {
    "postPublished": { "id": "15", "title": "New Post!", "author": {"name": "Alice"} }
  }
}`,
    },
    {
      heading: "GraphQL vs REST",
      body: `Neither is universally better — they solve different problems:`,
      items: [
        "**REST wins for**: simple CRUD APIs, caching (HTTP cache works natively), public APIs, teams that know REST well",
        "**GraphQL wins for**: complex data graphs, mobile apps (bandwidth sensitive), teams with many different clients needing different shapes, rapid iteration",
        "**N+1 problem** — naive GraphQL resolvers can make N+1 database queries. Solved with DataLoader (batching).",
        "**Caching** — REST caches at the HTTP layer for free. GraphQL POST requests aren't cached by default — requires persisted queries or CDN workarounds.",
        "**File uploads** — awkward in GraphQL (requires multipart spec). REST handles it naturally.",
        "**Error handling** — GraphQL always returns 200 OK even for errors; errors are in the response body.",
      ],
    },
  ],
};
