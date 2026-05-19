export const content = {
  title: "Embeddings & Semantic Search",
  sections: [
    {
      heading: "What Are Embeddings?",
      body: `An **embedding** is a fixed-length list of numbers (a vector) that represents the meaning of a piece of text. Two texts with similar meaning produce vectors that are close together in vector space — regardless of whether they share the same words. This enables **semantic search**: find documents by what they mean, not just which keywords they contain.`,
      code: `# Conceptually
# "dog"      → [0.12, -0.34, 0.89, ...]   # 1536-dimensional vector
# "puppy"    → [0.11, -0.36, 0.88, ...]   # very close to "dog"
# "database" → [-0.72, 0.15, -0.44, ...]  # far from "dog"

# Cosine similarity: 1.0 = identical, 0.0 = unrelated, -1.0 = opposite
import numpy as np

def cosine_similarity(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a), np.array(b)
    return float(np.dot(va, vb) / (np.linalg.norm(va) * np.linalg.norm(vb)))

# "dog" vs "puppy"    → ~0.93 (very similar)
# "dog" vs "database" → ~0.15 (unrelated)`,
    },
    {
      heading: "Generating Embeddings",
      body: `To get an embedding you call an embeddings API. OpenAI's **text-embedding-3-small** and Anthropic's (via Voyage AI) are popular choices. The result is a list of floats you store alongside your document. Embedding calls are much cheaper than chat completions — typically 10–100x cheaper per token.`,
      code: `# OpenAI embeddings
# pip install openai
from openai import OpenAI

client = OpenAI()   # reads OPENAI_API_KEY from env

def embed(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",   # 1536 dimensions
        input=text,
    )
    return response.data[0].embedding

# Batch embed (more efficient)
def embed_batch(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts,        # up to 2048 items per request
    )
    return [item.embedding for item in response.data]

vec = embed("What is a database index?")
print(f"Dimensions: {len(vec)}")   # 1536`,
    },
    {
      heading: "Building a Semantic Search Index",
      body: `The basic pattern: embed your documents at index time, store the vectors, then at query time embed the query and find the most similar stored vectors. For small datasets (< 100k docs) you can do this in memory with numpy. For large datasets you need a vector database.`,
      code: `import numpy as np
from openai import OpenAI

client = OpenAI()

class SimpleSemanticSearch:
    def __init__(self):
        self.documents: list[str] = []
        self.vectors:   np.ndarray | None = None

    def add(self, docs: list[str]):
        self.documents = docs
        resp = client.embeddings.create(model="text-embedding-3-small", input=docs)
        vecs = [item.embedding for item in resp.data]
        self.vectors = np.array(vecs)

    def search(self, query: str, top_k: int = 3) -> list[tuple[float, str]]:
        resp = client.embeddings.create(model="text-embedding-3-small", input=[query])
        qvec = np.array(resp.data[0].embedding)

        # Cosine similarity via normalised dot product
        norms  = np.linalg.norm(self.vectors, axis=1, keepdims=True)
        normed = self.vectors / norms
        scores = normed @ (qvec / np.linalg.norm(qvec))

        top_idx = np.argsort(scores)[::-1][:top_k]
        return [(float(scores[i]), self.documents[i]) for i in top_idx]

# Usage
index = SimpleSemanticSearch()
index.add([
    "PostgreSQL is an open-source relational database.",
    "Redis is an in-memory key-value store.",
    "Docker containers package apps and their dependencies.",
    "Kubernetes orchestrates container deployments.",
])

results = index.search("How do I containerise my app?")
for score, doc in results:
    print(f"{score:.3f}  {doc}")`,
    },
    {
      heading: "Chunking Strategies",
      body: `Embedding models have a **maximum input length** (typically 512–8192 tokens). Long documents must be split into chunks. The chunking strategy affects search quality significantly — bad chunks hurt recall.`,
      items: [
        "**Fixed size** — split every N tokens. Simple, but can cut sentences mid-thought.",
        "**Sentence / paragraph** — split on natural boundaries. Better semantic coherence.",
        "**Recursive** — try paragraph → sentence → word splits until under limit. Good default.",
        "**Overlap** — include 50–200 tokens of context from the previous chunk. Prevents information loss at boundaries.",
        "**Semantic chunking** — embed sentences, split where similarity drops. Best quality, most complex.",
      ],
      code: `def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> list[str]:
    words   = text.split()
    chunks  = []
    start   = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap   # slide with overlap

    return chunks

# Better: use a proper tokeniser
# pip install tiktoken
import tiktoken

def chunk_by_tokens(text: str, model="text-embedding-3-small",
                    max_tokens=512, overlap=64) -> list[str]:
    enc    = tiktoken.encoding_for_model(model)
    tokens = enc.encode(text)
    chunks = []
    start  = 0

    while start < len(tokens):
        end   = min(start + max_tokens, len(tokens))
        chunk = enc.decode(tokens[start:end])
        chunks.append(chunk)
        start += max_tokens - overlap

    return chunks`,
    },
    {
      heading: "Embedding Use Cases Beyond Search",
      body: `Embeddings are useful for more than search. Anywhere you need to measure or group by meaning, embeddings help.`,
      items: [
        "**Semantic deduplication** — find near-duplicate support tickets or articles",
        "**Clustering** — group documents by topic without predefined categories",
        "**Recommendation** — recommend similar items based on description similarity",
        "**Classification** — embed text and use the vector as features for a classifier",
        "**Anomaly detection** — flag documents that are far from any cluster",
        "**Cross-language search** — multilingual embedding models embed text from different languages into the same space",
      ],
    },
  ],
};
