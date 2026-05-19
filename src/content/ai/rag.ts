export const content = {
  title: "RAG — Retrieval-Augmented Generation",
  sections: [
    {
      heading: "The Problem RAG Solves",
      body: `LLMs know what was in their training data — they can't access your private documents, recent events, or real-time data. **RAG (Retrieval-Augmented Generation)** solves this by fetching relevant information at query time and injecting it into the prompt, so the model can answer using your data without retraining.`,
    },
    {
      heading: "The RAG Pipeline",
      body: `RAG has two phases: **indexing** (done offline) and **retrieval + generation** (done at query time). Understanding both is key to building reliable systems.`,
      items: [
        "**Indexing**: load documents → chunk → embed each chunk → store chunks + vectors in a vector DB",
        "**Query time**: embed user query → vector search → retrieve top-K chunks → inject into LLM prompt → return answer",
      ],
      code: `# High-level RAG flow
def rag_answer(user_question: str) -> str:
    # 1. Embed the question
    query_vec = embed(user_question)

    # 2. Retrieve relevant chunks from vector DB
    chunks = vector_db.search(query_vec, top_k=4)

    # 3. Build context from chunks
    context = "\\n\\n".join(chunk.text for chunk in chunks)

    # 4. Call LLM with question + context
    prompt = f"""Answer the question using ONLY the provided context.
If the answer isn't in the context, say "I don't know."

Context:
{context}

Question: {user_question}"""

    return llm.complete(prompt)`,
    },
    {
      heading: "Building a Simple RAG System",
      body: `A complete end-to-end RAG system using OpenAI embeddings, pgvector for storage, and Claude for generation.`,
      code: `import anthropic, psycopg
from openai import OpenAI
from pgvector.psycopg import register_vector

oai = OpenAI()
claude = anthropic.Anthropic()

# ── Indexing Phase ─────────────────────────────────────────────
def index_documents(docs: list[dict], conn):
    register_vector(conn)
    texts = [d["text"] for d in docs]
    resp  = oai.embeddings.create(model="text-embedding-3-small", input=texts)
    vecs  = [item.embedding for item in resp.data]

    with conn.cursor() as cur:
        for doc, vec in zip(docs, vecs):
            cur.execute(
                "INSERT INTO documents (content, embedding, source) VALUES (%s, %s, %s)",
                (doc["text"], vec, doc.get("source", "")),
            )
    conn.commit()

# ── Query Phase ────────────────────────────────────────────────
def rag(question: str, conn) -> str:
    register_vector(conn)

    # Embed the question
    qvec = oai.embeddings.create(
        model="text-embedding-3-small", input=question
    ).data[0].embedding

    # Retrieve top-4 chunks
    rows = conn.execute(
        """
        SELECT content, 1 - (embedding <=> %s) AS sim
        FROM documents
        ORDER BY embedding <=> %s
        LIMIT 4
        """,
        (qvec, qvec),
    ).fetchall()

    context = "\\n\\n".join(row[0] for row in rows)

    # Generate answer
    msg = claude.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system="Answer using only the provided context. If unsure, say so.",
        messages=[
            {
                "role": "user",
                "content": f"Context:\\n{context}\\n\\nQuestion: {question}",
            }
        ],
    )
    return msg.content[0].text`,
    },
    {
      heading: "RAG Quality: The Big Levers",
      body: `RAG quality depends on two things: **retrieval recall** (did we fetch the right chunks?) and **generation quality** (did the LLM answer correctly from the context?). Most failures are retrieval failures.`,
      items: [
        "**Chunk size** — too large: retrieved chunks are noisy; too small: missing context. 256–512 tokens with 64-token overlap is a good starting point.",
        "**Top-K** — retrieving more chunks (K=6–8) gives the model more context but increases cost and may dilute signal.",
        "**Reranking** — use a cross-encoder model (e.g. Cohere Rerank) to re-score the top-K results. Significantly improves precision.",
        "**Hybrid search** — combine vector search (semantic) with BM25 (keyword). Catches exact matches that semantic search misses.",
        "**Query expansion** — generate multiple phrasings of the query before searching. Improves recall for ambiguous questions.",
        "**Contextual retrieval** — prepend chunk-level context (document title, section heading) before embedding. Anthropic technique that improves recall.",
      ],
    },
    {
      heading: "Handling Failure Modes",
      body: `RAG systems fail in predictable ways. Design explicit handling for each.`,
      items: [
        "**No relevant chunk found** — instruct the model to say 'I don't know' rather than hallucinate. Add a similarity threshold: if max similarity < 0.7, skip generation.",
        "**Context window overflow** — if top-K chunks exceed the model's context limit, summarise or truncate. Use `max_tokens_in_context` as a budget.",
        "**Stale documents** — re-embed documents when they change. Store a content hash to detect changes.",
        "**Hallucination** — the model invents facts not in context. Use citation-based prompting: ask the model to quote the relevant sentence from context.",
      ],
      code: `SIMILARITY_THRESHOLD = 0.70

def rag_with_fallback(question: str, conn) -> str:
    rows = retrieve(question, conn, top_k=4)

    # Check confidence
    if not rows or rows[0][1] < SIMILARITY_THRESHOLD:
        return "I don't have enough information to answer that question."

    context = "\\n\\n".join(row[0] for row in rows)
    return generate(question, context)`,
    },
    {
      heading: "When NOT to Use RAG",
      body: `RAG is not always the right tool. Use it when the answer lives in a large, frequently-updated document corpus. Skip it when the model already knows the answer well (general knowledge), when you need perfect recall of every document (use traditional search), or when documents are too structured (use a database query instead).`,
    },
  ],
};
