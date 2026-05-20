export interface SubTopic {
  slug: string;
  title: string;
  description: string;
}

export interface Topic {
  slug: string;
  title: string;
  description: string;
  subtopics?: SubTopic[];
}

export interface Course {
  slug: string;
  name: string;
  icon: string;
  description: string;
  disabled: boolean;
  topics: Topic[];
}

// Order reflects a progressive backend learning path:
// Python → HTTP → SQL → Backend Engineering → AI Engineering
export const courses: Course[] = [
  {
    slug: "python",
    name: "Python",
    icon: "🐍",
    description:
      "Learn Python from scratch. Variables, data types, control flow, functions, and beyond.",
    disabled: false,
    topics: [
      {
        slug: "about-python",
        title: "About Python",
        description:
          "What Python is, why it became one of the world's most popular languages, and what makes it a great first and professional language.",
      },
      {
        slug: "interpreted-vs-compiled",
        title: "Interpreted vs Compiled",
        description:
          "How Python code goes from text to running instructions — the interpreter, bytecode, CPython, and how this differs from compiled languages.",
      },
      {
        slug: "input-output",
        title: "Input & Output",
        description:
          "Reading input from the user with input(), writing output with print(), type-converting input, and formatting values with f-strings.",
      },
      {
        slug: "variables",
        title: "Variables & Data Types",
        description:
          "Understand how Python stores data with variables, and explore the core data types: strings, integers, floats, and booleans.",
      },
      {
        slug: "control-flow",
        title: "Control Flow",
        description:
          "Direct your program's logic using if/elif/else statements, for and while loops, and break/continue.",
      },
      {
        slug: "functions",
        title: "Functions",
        description:
          "Define reusable blocks of code with def, parameters, return values, default arguments, *args, **kwargs, and lambdas.",
      },
      {
        slug: "lists-and-tuples",
        title: "Lists & Tuples",
        description:
          "Store ordered collections of data. Master indexing, slicing, list methods, tuple immutability, and unpacking.",
      },
      {
        slug: "dictionaries-and-sets",
        title: "Dictionaries & Sets",
        description:
          "Work with key-value pairs using dicts and unique unordered collections with sets and their operations.",
      },
      {
        slug: "strings",
        title: "Strings",
        description:
          "Go deep on Python strings: f-strings, formatting, slicing, and the full range of built-in string methods.",
      },
      {
        slug: "list-comprehensions",
        title: "List Comprehensions",
        description:
          "Write concise, readable one-liners to build lists, dicts, and sets using comprehension syntax.",
      },
      {
        slug: "error-handling",
        title: "Error Handling",
        description:
          "Handle failures gracefully with try/except/else/finally, raise custom exceptions, and write resilient code.",
      },
      {
        slug: "classes-and-objects",
        title: "Classes & Objects",
        description:
          "Model real-world concepts using classes, __init__, instance methods, self, inheritance, and dunder methods.",
      },
      {
        slug: "modules-and-packages",
        title: "Modules & Packages",
        description:
          "Organise and reuse code across files. Explore the standard library: math, random, datetime, os, and more.",
      },
      {
        slug: "functional-tools",
        title: "Functional Tools",
        description:
          "Use map, filter, zip, enumerate, and sorted with key functions to write expressive, concise data transformations.",
      },
      {
        slug: "file-io",
        title: "File I/O",
        description:
          "Read and write files using open(), the with statement, and work with text and CSV data reliably.",
      },
      {
        slug: "iterators-and-generators",
        title: "Iterators & Generators",
        description:
          "Understand Python's iteration protocol, write generators with yield, and process data lazily with generator expressions.",
      },
      {
        slug: "decorators",
        title: "Decorators",
        description:
          "Extend and modify functions without changing their source using the decorator pattern and functools.wraps.",
      },
      {
        slug: "type-hints",
        title: "Type Hints",
        description:
          "Annotate functions and variables with types to improve readability, catch bugs early, and enable editor tooling.",
      },
      {
        slug: "dataclasses",
        title: "Dataclasses",
        description:
          "Use @dataclass to auto-generate __init__, __repr__, and __eq__ — less boilerplate, more readable data models.",
      },
      {
        slug: "regular-expressions",
        title: "Regular Expressions",
        description:
          "Match, search, extract, and replace text patterns using Python's re module and regex syntax.",
      },
      {
        slug: "context-managers",
        title: "Context Managers",
        description:
          "Manage resources safely with the with statement, __enter__/__exit__, and contextlib.contextmanager.",
      },
      {
        slug: "virtual-environments",
        title: "Virtual Environments & pip",
        description:
          "Isolate project dependencies with venv and install third-party packages with pip — essential for real-world Python.",
      },
      {
        slug: "async-await",
        title: "Async / Await",
        description:
          "Write concurrent I/O-bound code with async def, await, asyncio.gather(), and create_task() without threads.",
      },
      {
        slug: "testing",
        title: "Testing with unittest & pytest",
        description:
          "Write reliable code with unit tests, assertions, fixtures, and test-driven development using unittest and pytest.",
      },
      {
        slug: "logging",
        title: "Logging",
        description:
          "Replace print() with Python's logging module: levels, handlers, formatters, and structured log output for production code.",
      },
      {
        slug: "pathlib",
        title: "pathlib",
        description:
          "Navigate and manipulate file system paths the modern way using pathlib.Path — cleaner than os.path.",
      },
      {
        slug: "concurrency",
        title: "Concurrency & Parallelism",
        description:
          "Understand the GIL, run I/O tasks with threading, CPU tasks with multiprocessing, and use concurrent.futures for both.",
      },
      {
        slug: "abstract-base-classes",
        title: "Abstract Base Classes",
        description:
          "Define and enforce interfaces using abc.ABC, @abstractmethod, and Python's built-in abstract collection types.",
      },
      {
        slug: "walrus-operator",
        title: "Walrus Operator",
        description:
          "Use the := assignment expression to assign and test a value in one step — in loops, comprehensions, and conditionals.",
      },
      {
        slug: "slots-and-memory",
        title: "Slots & Memory",
        description:
          "Optimise memory-heavy classes with __slots__, measure object sizes with sys.getsizeof, and understand Python's attribute storage.",
      },
    ],
  },
  {
    slug: "http",
    name: "HTTP & Protocols",
    icon: "🌐",
    description:
      "Understand how the web works. HTTP, REST, authentication, WebSockets, GraphQL, and gRPC — language-agnostic fundamentals every developer needs.",
    disabled: false,
    topics: [
      {
        slug: "how-the-web-works",
        title: "How the Web Works",
        description:
          "DNS, IP addresses, TCP/IP, and the full journey of a browser request from URL to rendered page.",
      },
      {
        slug: "http-fundamentals",
        title: "HTTP Fundamentals",
        description:
          "The request/response cycle, HTTP methods, status codes, and the evolution from HTTP/1.1 to HTTP/3.",
      },
      {
        slug: "urls-and-uris",
        title: "URLs & URIs",
        description:
          "Anatomy of a URL, URI vs URL vs URN, URL encoding, and path vs query parameters.",
      },
      {
        slug: "headers-and-body",
        title: "Headers & Request Body",
        description:
          "Common request and response headers, content types, JSON vs form data, and content negotiation.",
      },
      {
        slug: "rest-principles",
        title: "REST Principles",
        description:
          "The six REST constraints, statelessness, resources and representations, and how REST differs from SOAP.",
      },
      {
        slug: "rest-api-design",
        title: "REST API Design",
        description:
          "Naming resources, versioning, pagination, filtering, error responses, and API design best practices.",
      },
      {
        slug: "authentication",
        title: "Authentication & Authorization",
        description:
          "API keys, Basic Auth, session cookies, JWTs, and OAuth 2.0 flows — when to use each.",
      },
      {
        slug: "https-and-security",
        title: "HTTPS & Security",
        description:
          "TLS handshake, certificates, HSTS, CORS, CSRF, and the security headers every API should set.",
      },
      {
        slug: "websockets",
        title: "WebSockets",
        description:
          "Full-duplex real-time communication: WS handshake, events, vs HTTP polling, and Server-Sent Events.",
      },
      {
        slug: "graphql",
        title: "GraphQL",
        description:
          "Schema-first API design with queries, mutations, subscriptions, and how GraphQL compares to REST.",
      },
      {
        slug: "grpc",
        title: "gRPC & Protocol Buffers",
        description:
          "High-performance RPC with .proto schemas, streaming, and when to choose gRPC over REST or GraphQL.",
      },
      {
        slug: "load-balancers",
        title: "Load Balancers & Reverse Proxies",
        description: "Route traffic across servers with Nginx and HAProxy: round-robin, least-connections, IP hash, health checks, SSL termination, and upstream failover.",
      },
      {
        slug: "dns-deep-dive",
        title: "DNS Deep Dive",
        description: "How DNS resolution works end-to-end: record types (A, CNAME, MX, TXT, SRV), TTL, authoritative vs recursive resolvers, and DNS in production (failover, geo-routing, split-horizon).",
      },
    ],
  },
  {
    slug: "sql",
    name: "SQL & Databases",
    icon: "🗄️",
    description:
      "Master SQL from first principles to production patterns. Queries, joins, indexes, transactions, schema design, and the database knowledge every backend engineer needs.",
    disabled: false,
    topics: [
      {
        slug: "relational-fundamentals",
        title: "Relational Database Fundamentals",
        description: "What relational databases are, how tables relate, and why SQL has dominated data storage for 50 years.",
      },
      {
        slug: "select-basics",
        title: "SELECT — Querying Data",
        description: "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, NULL handling, and LIKE — the foundation of every SQL query.",
      },
      {
        slug: "insert-update-delete",
        title: "INSERT, UPDATE & DELETE",
        description: "Modifying data safely: inserting rows, updating with conditions, deleting, TRUNCATE, and upsert with ON CONFLICT.",
      },
      {
        slug: "joins",
        title: "Joins",
        description: "Combine data from multiple tables with INNER, LEFT, RIGHT, FULL OUTER, CROSS, and SELF joins.",
      },
      {
        slug: "aggregations",
        title: "Aggregations & GROUP BY",
        description: "COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING, and the difference between filtering rows vs groups.",
      },
      {
        slug: "subqueries-and-ctes",
        title: "Subqueries & CTEs",
        description: "Write complex queries with subqueries, correlated subqueries, EXISTS, and WITH (Common Table Expressions).",
      },
      {
        slug: "window-functions",
        title: "Window Functions",
        description: "ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, and running totals with OVER and PARTITION BY.",
      },
      {
        slug: "indexes",
        title: "Indexes & Query Optimization",
        description: "How indexes work, when to add them, composite indexes, EXPLAIN ANALYZE, and avoiding the N+1 problem.",
      },
      {
        slug: "transactions",
        title: "Transactions & ACID",
        description: "ACID properties, BEGIN/COMMIT/ROLLBACK, isolation levels, dirty reads, phantom reads, and deadlocks.",
      },
      {
        slug: "constraints",
        title: "Constraints & Keys",
        description: "PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT, and how constraints enforce data integrity.",
      },
      {
        slug: "schema-design",
        title: "Schema Design & Normalization",
        description: "1NF, 2NF, 3NF — normalizing data to eliminate redundancy, and when to intentionally denormalize.",
      },
      {
        slug: "relationships",
        title: "Relationships & Junction Tables",
        description: "Model one-to-one, one-to-many, and many-to-many relationships correctly with foreign keys and junction tables.",
      },
      {
        slug: "postgresql-features",
        title: "PostgreSQL Features",
        description: "JSONB, arrays, full-text search, UPSERT, RETURNING, UUIDs, and extensions that make Postgres the default for production.",
      },
      {
        slug: "nosql",
        title: "NoSQL Databases",
        description: "Document, key-value, column-family, and graph stores — what each excels at and how to choose between SQL and NoSQL.",
      },
      {
        slug: "migrations",
        title: "Database Migrations",
        description: "Schema versioning, zero-downtime migrations, adding indexes safely, and migration tools like Alembic and Flyway.",
      },
      {
        slug: "connection-pooling",
        title: "Connection Pooling & Performance",
        description: "Why connection pools matter, PgBouncer, pool sizing, slow query analysis, and production database tuning.",
      },
      {
        slug: "query-planning",
        title: "Query Planning & EXPLAIN",
        description: "Read and interpret PostgreSQL query plans: seq scan vs index scan, nested loops vs hash joins, EXPLAIN ANALYZE output, and how the planner chooses execution strategies.",
      },
      {
        slug: "replication",
        title: "Replication & Read Replicas",
        description: "Scale read-heavy workloads with streaming replication: primary/replica setup, replication lag, read replica routing, and synchronous vs asynchronous replication trade-offs.",
      },
      {
        slug: "partitioning",
        title: "Partitioning & Sharding",
        description: "Split large tables with PostgreSQL table partitioning (range, list, hash) and scale beyond a single node with application-level and horizontal sharding strategies.",
      },
    ],
  },
  {
    slug: "backend",
    name: "Backend Engineering",
    icon: "⚙️",
    description:
      "Everything you need to build production-grade backend systems: APIs, auth, caching, queues, observability, Docker, CI/CD, and security — from first principles to interview-ready.",
    disabled: false,
    topics: [
      {
        slug: "backend-architecture",
        title: "Backend Architecture Overview",
        description: "How backend systems are structured: servers, databases, caches, queues, and how they fit together in a production stack.",
      },
      {
        slug: "api-design",
        title: "API Design Patterns",
        description: "REST, RPC, and event-driven patterns. Versioning, pagination, idempotency, and designing APIs that don't break clients.",
      },
      {
        slug: "authentication",
        title: "Authentication — Sessions & Tokens",
        description: "Cookie-based sessions vs JWT tokens, secure storage, refresh token rotation, and how to implement stateless auth.",
      },
      {
        slug: "authorization",
        title: "Authorization & RBAC",
        description: "Role-based access control, permissions models, policy-based auth, and protecting resources at the handler and data layer.",
      },
      {
        slug: "caching",
        title: "Caching",
        description: "Cache strategies (cache-aside, write-through, write-behind), Redis, TTL, cache invalidation, and the dangers of stale data.",
      },
      {
        slug: "message-queues",
        title: "Message Queues & Event Streaming",
        description: "Async communication with RabbitMQ and Kafka. Pub/sub, fan-out, consumer groups, ordering guarantees, and dead-letter queues.",
      },
      {
        slug: "background-jobs",
        title: "Background Jobs & Task Queues",
        description: "Offloading work from the request cycle: task queues, Celery, cron jobs, idempotency, retry logic, and job monitoring.",
      },
      {
        slug: "rate-limiting",
        title: "Rate Limiting & Throttling",
        description: "Protect APIs from abuse with token bucket, sliding window, and fixed window algorithms. Per-user and global limits with Redis.",
      },
      {
        slug: "file-storage",
        title: "File Storage & CDN",
        description: "Store and serve files with S3-compatible object storage. Presigned URLs, direct uploads, CDN integration, and media processing.",
      },
      {
        slug: "config-and-secrets",
        title: "Environment & Secrets Management",
        description: "The 12-factor app config model, .env files, secrets managers (AWS Secrets Manager, Vault), and avoiding credential leaks.",
      },
      {
        slug: "logging-observability",
        title: "Logging & Observability",
        description: "Structured logging, log levels, distributed tracing, metrics, health checks, and the three pillars of observability.",
      },
      {
        slug: "resilience",
        title: "Resilience & Error Handling",
        description: "Build systems that survive failures: retries with backoff, circuit breakers, timeouts, bulkheads, and graceful degradation.",
      },
      {
        slug: "docker",
        title: "Containerization with Docker",
        description: "Build, run, and ship applications in containers. Dockerfile best practices, multi-stage builds, Docker Compose, and container networking.",
      },
      {
        slug: "ci-cd",
        title: "CI/CD & Deployment",
        description: "Automate testing and deployment with CI/CD pipelines. Environments, rolling deploys, blue-green, canary releases, and rollbacks.",
      },
      {
        slug: "security",
        title: "Security & OWASP Top 10",
        description: "Defend against the most common backend vulnerabilities: SQL injection, XSS, CSRF, broken auth, insecure deserialization, and more.",
      },
      {
        slug: "testing",
        title: "Testing Backend Systems",
        description: "Unit tests, integration tests, contract tests, API tests, test doubles, and how to structure a test suite for confidence without flakiness.",
      },
      {
        slug: "api-documentation",
        title: "API Documentation & OpenAPI",
        description: "Design-first APIs with OpenAPI/Swagger. Generate docs, validate requests, and keep specs in sync with your implementation.",
      },
      {
        slug: "webhooks",
        title: "Webhooks & Async APIs",
        description: "Send and receive webhooks reliably: delivery guarantees, signature verification, retries, idempotency, and async API patterns.",
      },
      {
        slug: "microservices",
        title: "Microservices Architecture",
        description: "Design, decompose, and operate microservices: bounded contexts, inter-service communication, data isolation, the strangler fig pattern, and the real cost of distributed systems.",
      },
      {
        slug: "api-gateway",
        title: "API Gateway Patterns",
        description: "Route, authenticate, rate-limit, and transform requests at the edge with an API gateway. Kong, AWS API Gateway, and building your own with Nginx.",
      },
      {
        slug: "service-discovery",
        title: "Service Discovery & Load Balancing",
        description: "How services find each other in dynamic environments: client-side vs server-side discovery, Consul, Kubernetes DNS, health checks, and load-balancing strategies.",
      },
    ],
  },
  {
    slug: "system-design",
    name: "System Design",
    icon: "🏗️",
    description:
      "Design scalable, reliable distributed systems. Load balancing, caching, CAP theorem, consistent hashing, database scaling, message queues, CDN, and the system design interview framework.",
    disabled: false,
    topics: [
      {
        slug: "scalability",
        title: "Scalability Fundamentals",
        description: "Vertical vs horizontal scaling, stateless services, the shared-nothing architecture, and how large systems handle millions of requests.",
      },
      {
        slug: "load-balancing",
        title: "Load Balancing at Scale",
        description: "L4 vs L7 load balancing, routing algorithms, health checks, sticky sessions, and how load balancers fit into a distributed architecture.",
      },
      {
        slug: "caching",
        title: "Caching Strategies",
        description: "Cache-aside, write-through, write-behind, and read-through patterns. Cache eviction, TTL, thundering herd, and when caching hurts more than it helps.",
      },
      {
        slug: "cap-theorem",
        title: "CAP Theorem",
        description: "Consistency, availability, and partition tolerance — why you can only pick two, and how real systems (Cassandra, DynamoDB, Zookeeper) navigate the trade-off.",
      },
      {
        slug: "consistent-hashing",
        title: "Consistent Hashing",
        description: "How consistent hashing minimises data movement when adding or removing nodes. Virtual nodes, hash rings, and where this is used in real distributed systems.",
      },
      {
        slug: "database-scaling",
        title: "Database Scaling Patterns",
        description: "Read replicas, write sharding, federation, and denormalisation. Choosing between SQL and NoSQL at scale, and the spectrum from OLTP to OLAP.",
      },
      {
        slug: "message-queues",
        title: "Message Queue Architecture",
        description: "Producer-consumer patterns, at-least-once vs exactly-once delivery, consumer groups, topic partitioning, and Kafka's architecture for high-throughput streaming.",
      },
      {
        slug: "cdn",
        title: "CDN & Edge Delivery",
        description: "How CDNs reduce latency and origin load. PoPs, edge caching, cache-control headers, origin shield, TTL, and dynamic vs static content strategies.",
      },
      {
        slug: "rate-limiting",
        title: "Distributed Rate Limiting",
        description: "Token bucket, leaky bucket, sliding window, and fixed window algorithms. Distributed rate limiting with Redis and the challenges of enforcing limits across multiple nodes.",
      },
      {
        slug: "system-design-framework",
        title: "System Design Interview Framework",
        description: "A repeatable framework for system design interviews: requirements, capacity estimation, high-level design, deep dives, and trade-off discussion.",
      },
    ],
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    icon: "☁️",
    description:
      "Containers, orchestration, CI/CD, and cloud infrastructure. Docker, Kubernetes, Terraform, AWS, and the observability stack every backend engineer needs to ship reliably.",
    disabled: false,
    topics: [
      {
        slug: "containers-and-docker",
        title: "Containers & Docker",
        description: "What containers are, how they differ from VMs, Docker architecture, writing Dockerfiles, and the key commands to build, run, and inspect containers.",
      },
      {
        slug: "docker-compose",
        title: "Docker Compose",
        description: "Orchestrate multi-service development environments with docker-compose.yml: service networking, volumes, environment variables, and common workflow commands.",
      },
      {
        slug: "docker",
        title: "Docker — Deep Dive",
        description: "Complete Docker mastery: architecture internals, Dockerfile best practices, networking, volumes, multi-stage builds, registry management, and container security.",
        subtopics: [
          {
            slug: "architecture",
            title: "Docker Architecture",
            description: "Daemon, CLI, containerd, image layers, and how Docker's client-server model works under the hood.",
          },
          {
            slug: "dockerfile",
            title: "Writing Dockerfiles",
            description: "Every Dockerfile instruction, layer caching, .dockerignore, and best practices for small, reproducible images.",
          },
          {
            slug: "networking",
            title: "Docker Networking",
            description: "Bridge, host, overlay, and custom networks. Port mapping, container DNS, and inter-container communication.",
          },
          {
            slug: "volumes",
            title: "Volumes & Persistent Storage",
            description: "Named volumes, bind mounts, tmpfs, and strategies for managing stateful data in containers.",
          },
          {
            slug: "multi-stage",
            title: "Multi-stage Builds",
            description: "Use multiple FROM stages to compile in one image and produce a minimal production image with COPY --from.",
          },
          {
            slug: "registry",
            title: "Registry & Image Management",
            description: "Docker Hub, private registries (ECR, GCR), tagging strategies, and the full push/pull workflow.",
          },
          {
            slug: "security",
            title: "Container Security",
            description: "Non-root users, read-only filesystems, image scanning, secrets management, and Linux capabilities.",
          },
        ],
      },
      {
        slug: "kubernetes",
        title: "Kubernetes Fundamentals",
        description: "Container orchestration at scale: Pods, Deployments, Services, and Ingress. How Kubernetes schedules workloads, handles failures, and exposes applications.",
      },
      {
        slug: "ci-cd-pipelines",
        title: "CI/CD Pipelines",
        description: "Automate build, test, and deploy with CI/CD. GitHub Actions workflow syntax, pipeline stages, artifact registries, and deployment strategies: rolling, blue-green, canary.",
      },
      {
        slug: "infrastructure-as-code",
        title: "Infrastructure as Code",
        description: "Define and provision cloud infrastructure declaratively with Terraform: providers, resources, state management, and remote backends for team collaboration.",
      },
      {
        slug: "cloud-providers",
        title: "Cloud Providers & Core Services",
        description: "AWS/GCP/Azure service landscape: compute, storage, networking, and managed databases. Shared responsibility model and when to use managed services vs self-hosted.",
      },
      {
        slug: "aws",
        title: "AWS — Amazon Web Services",
        description: "Master the core AWS services every backend engineer uses: IAM, EC2, S3, VPC, RDS, Lambda, ECS, CloudWatch, SQS/SNS, and CloudFront.",
        subtopics: [
          {
            slug: "iam",
            title: "IAM & Identity Management",
            description: "Users, groups, roles, and policies. Principle of least privilege, STS temporary credentials, and IAM for EC2 and Lambda.",
          },
          {
            slug: "ec2",
            title: "EC2 & Compute",
            description: "Instance types, AMIs, security groups, key pairs, EBS volumes, Auto Scaling Groups, and pricing models (On-Demand, Reserved, Spot).",
          },
          {
            slug: "s3",
            title: "S3 & Object Storage",
            description: "Buckets, objects, IAM and bucket policies, versioning, lifecycle rules, static hosting, and pre-signed URLs.",
          },
          {
            slug: "vpc",
            title: "VPC & Networking",
            description: "Subnets (public/private), route tables, Internet Gateway, NAT Gateway, Security Groups vs NACLs, and VPC peering.",
          },
          {
            slug: "rds",
            title: "RDS & Managed Databases",
            description: "Managed relational databases, instance classes, Multi-AZ high availability, read replicas, automated backups, and connection pooling.",
          },
          {
            slug: "lambda",
            title: "Lambda & Serverless",
            description: "Execution model, cold starts, triggers (API Gateway, S3, SQS), layers, concurrency limits, and environment variables.",
          },
          {
            slug: "ecs",
            title: "ECS, Fargate & EKS",
            description: "Task definitions, services, Fargate vs EC2 launch type, ECR container registry, and when to use ECS vs EKS.",
          },
          {
            slug: "cloudwatch",
            title: "CloudWatch & Observability",
            description: "Metrics, log groups, alarms, dashboards, CloudWatch Insights, and how to wire services to a central observability stack.",
          },
          {
            slug: "sqs-sns",
            title: "SQS, SNS & Messaging",
            description: "SQS queues, visibility timeout, dead-letter queues, SNS topics and subscriptions, fan-out pattern, and FIFO queues.",
          },
          {
            slug: "cloudfront",
            title: "CloudFront & CDN",
            description: "Distributions, origins, cache behaviors, edge locations, Origin Access Identity for S3, and cache invalidation.",
          },
        ],
      },
      {
        slug: "monitoring-logging",
        title: "Monitoring & Observability",
        description: "The three pillars — metrics, logs, and traces. Prometheus + Grafana for metrics, structured logging pipelines, and distributed tracing with OpenTelemetry.",
      },
    ],
  },
  {
    slug: "dsa",
    name: "Data Structures & Algorithms",
    icon: "🧮",
    description:
      "Master DSA for technical interviews — one question at a time, with step-by-step call stack animations and mental model breakdowns.",
    disabled: false,
    topics: [
      {
        slug: "recursion",
        title: "Recursion",
        description: "Build recursion intuition through the most-asked interview questions — each with step-by-step call stack animations.",
        subtopics: [
          {
            slug: "factorial",
            title: "Factorial",
            description: "Compute n! recursively. Understand base cases, call stack depth, and how values unwind back up.",
          },
          {
            slug: "fibonacci",
            title: "Fibonacci",
            description: "Compute the nth Fibonacci number. See how binary recursion branches and why naive recursion is exponential.",
          },
          {
            slug: "atoi",
            title: "Recursive atoi()",
            description: "Convert a string of digits to an integer recursively. Build the number digit by digit using place value and the call stack.",
          },
        ],
      },
    ],
  },
  {
    slug: "frontend",
    name: "Frontend",
    icon: "⚡",
    description:
      "Master frontend interview questions — JavaScript internals, React patterns, and machine coding challenges, each with step-by-step visual walkthroughs.",
    disabled: false,
    topics: [
      {
        slug: "javascript",
        title: "JavaScript",
        description: "Core JavaScript concepts asked in every frontend interview — the event loop, closures, this, promises, and more.",
        subtopics: [
          { slug: "event-loop", title: "The Event Loop", description: "How JavaScript's single-threaded event loop works with the call stack, microtask queue, and callback queue." },
          { slug: "closures", title: "Closures", description: "What closures are, how they capture scope, and common interview patterns like IIFE and function factories." },
          { slug: "var-let-const", title: "var vs let vs const", description: "Scoping rules, hoisting behaviour, temporal dead zone, and when to use each declaration." },
          { slug: "hoisting", title: "Hoisting", description: "How function declarations, var, and let/const are hoisted differently and the temporal dead zone." },
          { slug: "this-keyword", title: "The this Keyword", description: "How this is bound in global, function, method, arrow function, and class contexts." },
          { slug: "promises", title: "Promises & Async/Await", description: "Promise states, chaining, error handling, and how async/await desugars to promise chains." },
          { slug: "prototypes", title: "Prototypes & Inheritance", description: "The prototype chain, Object.create, class syntax sugar, and how property lookup works." },
          { slug: "currying", title: "Currying", description: "Transform multi-argument functions into chains of single-argument functions with practical patterns." },
        ],
      },
      {
        slug: "react",
        title: "React",
        description: "React internals and hooks asked in every senior frontend interview — reconciliation, state, effects, and performance.",
        subtopics: [
          { slug: "virtual-dom", title: "Virtual DOM & Reconciliation", description: "How React's virtual DOM diffing algorithm decides what to update in the real DOM." },
          { slug: "use-state", title: "useState Hook", description: "State initialisation, batching, functional updates, and how React schedules re-renders." },
          { slug: "use-effect", title: "useEffect Hook", description: "The dependency array, cleanup functions, and how useEffect maps to component lifecycle." },
          { slug: "use-memo-callback", title: "useMemo & useCallback", description: "Memoising expensive computations and stable function references to prevent unnecessary re-renders." },
          { slug: "keys", title: "Keys in Lists", description: "Why React needs keys, what makes a good key, and what goes wrong when keys are wrong." },
          { slug: "context-api", title: "Context API", description: "createContext, Provider, useContext, and when Context beats prop drilling (and when it doesn't)." },
          { slug: "custom-hooks", title: "Custom Hooks", description: "Extract and reuse stateful logic by composing built-in hooks into your own useXxx functions." },
          { slug: "controlled-components", title: "Controlled vs Uncontrolled", description: "Form inputs driven by React state vs DOM state — when each pattern is appropriate." },
        ],
      },
      {
        slug: "machine-coding",
        title: "Machine Coding",
        description: "Implement JavaScript utilities from scratch — the classic machine coding round problems with step-by-step walkthroughs.",
        subtopics: [
          { slug: "debounce", title: "Implement Debounce", description: "Delay execution until after a quiet period — used in search inputs and resize handlers." },
          { slug: "throttle", title: "Implement Throttle", description: "Limit a function to fire at most once per interval — used in scroll and mouse-move handlers." },
          { slug: "promise-all", title: "Implement Promise.all", description: "Run promises concurrently and collect all results, rejecting fast on any failure." },
          { slug: "event-emitter", title: "Implement Event Emitter", description: "A pub/sub class with on, off, and emit — the pattern behind Node.js EventEmitter and browser events." },
          { slug: "flatten", title: "Flatten Nested Array", description: "Recursively flatten an arbitrarily nested array to a given depth." },
          { slug: "curry", title: "Implement Curry", description: "Write a curry function that collects arguments across calls until the full arity is reached." },
        ],
      },
    ],
  },
  {
    slug: "ai",
    name: "AI Engineering",
    icon: "🤖",
    description:
      "Build AI-powered backend systems: LLMs, embeddings, RAG pipelines, agents, vector databases, and production AI — from first principles to interview-ready.",
    disabled: false,
    topics: [
      {
        slug: "ai-in-backend",
        title: "AI in Backend Systems",
        description: "Where AI fits in modern backend architecture, common use cases, and how LLM-powered features get built into production systems.",
      },
      {
        slug: "llms-and-foundation-models",
        title: "LLMs & Foundation Models",
        description: "How large language models work, what tokens are, context windows, temperature, and the landscape of available models.",
      },
      {
        slug: "prompt-engineering",
        title: "Prompt Engineering",
        description: "System prompts, few-shot examples, chain-of-thought, structured output, and techniques for reliable LLM behaviour.",
      },
      {
        slug: "calling-llm-apis",
        title: "Calling LLM APIs",
        description: "Using the OpenAI and Anthropic APIs: chat completions, parameters, streaming responses, error handling, and cost control.",
      },
      {
        slug: "embeddings",
        title: "Embeddings & Semantic Search",
        description: "What embeddings are, how they encode meaning as vectors, cosine similarity, and building semantic search from scratch.",
      },
      {
        slug: "vector-databases",
        title: "Vector Databases",
        description: "Storing and querying embeddings at scale with pgvector, Pinecone, and Qdrant. Indexing strategies, metadata filtering, and ANN search.",
      },
      {
        slug: "rag",
        title: "RAG — Retrieval-Augmented Generation",
        description: "Build a RAG pipeline: chunking documents, embedding and indexing, retrieving relevant context, and grounding LLM responses in your data.",
      },
      {
        slug: "ai-agents",
        title: "AI Agents & Tool Use",
        description: "What agents are, how tool use and function calling work, the ReAct loop, and building agents that take actions in the real world.",
      },
      {
        slug: "ai-orchestration",
        title: "AI Orchestration",
        description: "Chaining LLM calls into workflows with LangChain and LlamaIndex — chains, pipelines, memory, and multi-step reasoning.",
      },
      {
        slug: "streaming-responses",
        title: "Streaming AI Responses",
        description: "Stream LLM tokens to the client in real time using Server-Sent Events. Why streaming matters for UX and how to implement it end-to-end.",
      },
      {
        slug: "evaluating-llm-apps",
        title: "Evaluating LLM Applications",
        description: "How to measure LLM output quality: evals, benchmarks, LLM-as-judge, hallucination detection, and building a regression test suite.",
      },
      {
        slug: "production-ai",
        title: "Production AI",
        description: "Running AI features at scale: latency optimisation, prompt caching, cost management, fallbacks, observability, and rate limiting.",
      },
      {
        slug: "finetuning-vs-rag",
        title: "Fine-tuning vs RAG",
        description: "When to fine-tune a model vs use RAG. LoRA, PEFT, instruction tuning, and the trade-offs between training cost and retrieval complexity.",
      },
      {
        slug: "multimodal-ai",
        title: "Multimodal AI",
        description: "Vision models, image understanding, speech-to-text, text-to-speech, and building backends that handle images and audio alongside text.",
      },
      {
        slug: "ai-safety",
        title: "AI Safety & Guardrails",
        description: "Content moderation, prompt injection, jailbreaks, output validation, PII detection, and building AI systems that stay within guardrails.",
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getTopic(courseSlug: string, topicSlug: string): Topic | undefined {
  const course = getCourse(courseSlug);
  return course?.topics.find((t) => t.slug === topicSlug);
}

export function getSubtopic(courseSlug: string, topicSlug: string, subtopicSlug: string): SubTopic | undefined {
  const topic = getTopic(courseSlug, topicSlug);
  return topic?.subtopics?.find((s) => s.slug === subtopicSlug);
}
