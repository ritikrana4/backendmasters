export const content = {
  title: "Vector Databases",
  sections: [
    {
      heading: "Why Vector Databases?",
      body: `A regular database like PostgreSQL is optimised for exact matches and range queries on structured data. **Vector databases** are optimised for **approximate nearest neighbour (ANN) search** — finding the K most similar vectors to a query vector across millions of stored vectors in milliseconds. They are the storage layer behind semantic search and RAG systems.`,
    },
    {
      heading: "How ANN Search Works",
      body: `Brute-force nearest-neighbour search (compare query to every vector) is O(n·d) — too slow at scale. Vector databases use specialised indexing algorithms that trade a small amount of accuracy for dramatic speed improvements.`,
      items: [
        "**HNSW (Hierarchical Navigable Small World)** — graph-based, best recall/speed tradeoff, default in most databases",
        "**IVF (Inverted File Index)** — clusters vectors, only searches nearby clusters. Fast but lower recall",
        "**PQ (Product Quantisation)** — compresses vectors to save memory, used alongside HNSW/IVF",
        "**Flat index** — exact brute force, used only for small datasets or as a ground-truth benchmark",
      ],
    },
    {
      heading: "Popular Vector Databases",
      body: `Choose based on your scale, existing infrastructure, and whether you need a managed service or self-hosted.`,
      items: [
        "**pgvector** — PostgreSQL extension. Zero new infra if you already use Postgres. Great for <10M vectors.",
        "**Pinecone** — fully managed, serverless option, simple API. Good default for getting started.",
        "**Weaviate** — open-source, self-hostable, built-in embedding generation, GraphQL API.",
        "**Qdrant** — open-source, Rust-based, excellent performance, payload filtering.",
        "**Chroma** — embedded (in-process), perfect for local dev and prototyping.",
        "**Milvus** — open-source, massive scale (billions of vectors), complex to operate.",
      ],
    },
    {
      heading: "pgvector — Adding Vectors to PostgreSQL",
      body: `**pgvector** is the simplest starting point if you're already on PostgreSQL. It adds a \`vector\` column type and ANN index operators. No new service to manage — your vectors live alongside your relational data.`,
      code: `-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table with a vector column
CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT,
    embedding   vector(1536),     -- match your embedding model's dimension
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Create an HNSW index for fast approximate search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Insert a document
INSERT INTO documents (content, embedding, metadata)
VALUES (
    'PostgreSQL is a relational database.',
    '[0.12, -0.34, 0.89, ...]'::vector,   -- actual 1536-dim vector
    '{"source": "docs", "topic": "databases"}'
);

-- Semantic search — find the 5 most similar documents
SELECT content, 1 - (embedding <=> '[0.11, -0.36, 0.88, ...]'::vector) AS similarity
FROM documents
ORDER BY embedding <=> '[0.11, -0.36, 0.88, ...]'::vector
LIMIT 5;

-- Cosine distance operators:
-- <=>  cosine distance (most common)
-- <->  L2 (Euclidean) distance
-- <#>  negative inner product`,
    },
    {
      heading: "Using pgvector from Python",
      body: `With **psycopg3** and **pgvector-python**, inserting and querying vectors from Python is straightforward. The library handles serialising/deserialising the vector type.`,
      code: `# pip install pgvector psycopg[binary]
import psycopg
from pgvector.psycopg import register_vector
from openai import OpenAI

oai = OpenAI()

def get_embedding(text: str) -> list[float]:
    return oai.embeddings.create(model="text-embedding-3-small", input=text).data[0].embedding

with psycopg.connect("postgresql://user:pass@localhost/mydb") as conn:
    register_vector(conn)   # teach psycopg3 about the vector type

    # Insert
    vec = get_embedding("PostgreSQL is a relational database.")
    conn.execute(
        "INSERT INTO documents (content, embedding) VALUES (%s, %s)",
        ("PostgreSQL is a relational database.", vec),
    )

    # Search
    query_vec = get_embedding("How do I query a SQL database?")
    rows = conn.execute(
        """
        SELECT content, 1 - (embedding <=> %s) AS similarity
        FROM documents
        ORDER BY embedding <=> %s
        LIMIT 5
        """,
        (query_vec, query_vec),
    ).fetchall()

    for content, similarity in rows:
        print(f"{similarity:.3f}  {content}")`,
    },
    {
      heading: "Metadata Filtering",
      body: `In production you almost always combine vector search with **metadata filters** — only search documents from a specific user, date range, category, or tenant. All major vector databases support this as a pre-filter (filter before ANN) or post-filter (filter after ANN). Pre-filtering is faster but may miss results; post-filtering is more accurate.`,
      code: `-- pgvector: combine ANN search with SQL WHERE clause
SELECT content, 1 - (embedding <=> %s) AS similarity
FROM documents
WHERE metadata->>'source' = 'docs'        -- metadata filter
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY embedding <=> %s
LIMIT 5;

# Qdrant: filter syntax
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

client = QdrantClient(":memory:")   # in-memory for dev

results = client.search(
    collection_name="documents",
    query_vector=query_vec,
    query_filter=Filter(
        must=[FieldCondition(key="source", match=MatchValue(value="docs"))]
    ),
    limit=5,
)`,
    },
  ],
};
