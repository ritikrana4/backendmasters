export const content = {
  title: "AI in Backend Systems",
  sections: [
    {
      heading: "What is AI Engineering?",
      body: `AI engineering is the discipline of integrating machine-learning models — especially large language models (LLMs) — into production backend systems. Unlike ML research (which focuses on training new models), AI engineering focuses on **calling**, **orchestrating**, and **deploying** models reliably in real products. The skills are mostly software engineering: APIs, reliability patterns, latency, cost, and observability.`,
    },
    {
      heading: "Where AI Lives in a Backend",
      body: `AI capabilities are typically a **thin layer** on top of your existing backend. A request arrives at your API, flows through normal auth/validation, then hits an AI service call (usually an HTTP request to an LLM provider), and the result flows back through your normal response pipeline. The AI call is just another I/O operation — treat it that way.`,
      code: `# Typical flow
# 1. Client sends request  →  your API
# 2. Your API validates, enriches context
# 3. Your API calls LLM provider (OpenAI, Anthropic, etc.)
# 4. LLM returns completion
# 5. Your API post-processes, stores, returns to client

# Simplified Python example
import httpx

def answer_question(user_question: str, context_docs: list[str]) -> str:
    system_prompt = "You are a helpful assistant. Use only the provided context."
    context = "\\n".join(context_docs)

    response = httpx.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": f"Context:\\n{context}\\n\\nQuestion: {user_question}"},
            ],
        },
        timeout=30.0,
    )
    return response.json()["choices"][0]["message"]["content"]`,
    },
    {
      heading: "Key AI Use Cases in Backend",
      body: `The most common production use cases for AI in backends fall into a few categories. Understanding the pattern helps you pick the right architecture.`,
      items: [
        "**Text generation** — summaries, drafts, report generation, personalised content",
        "**Classification & routing** — categorise incoming requests, triage support tickets, intent detection",
        "**Semantic search** — find similar content by meaning rather than keyword (requires embeddings)",
        "**Extraction** — pull structured data (JSON) from unstructured text (receipts, emails, documents)",
        "**Conversational agents** — multi-turn chat with tool use (search, APIs, databases)",
        "**Code generation** — autocomplete, code review bots, test generation",
      ],
    },
    {
      heading: "The LLM Call is Just an HTTP Request",
      body: `At the wire level, calling an LLM is a plain HTTPS POST request with a JSON body. Most providers offer official SDKs that wrap this, but understanding the raw API removes the magic. Every AI SDK is just a convenience layer on top of REST.`,
      code: `# Without SDK — raw HTTP
import httpx, os

client = httpx.Client()

def chat(messages: list[dict]) -> str:
    resp = client.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": os.environ["ANTHROPIC_API_KEY"],
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-opus-4-7",
            "max_tokens": 1024,
            "messages": messages,
        },
        timeout=60.0,
    )
    resp.raise_for_status()
    return resp.json()["content"][0]["text"]

# With SDK — same thing, less boilerplate
import anthropic
client = anthropic.Anthropic()   # reads ANTHROPIC_API_KEY from env

def chat_sdk(messages: list[dict]) -> str:
    msg = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=messages,
    )
    return msg.content[0].text`,
    },
    {
      heading: "Cost, Latency, and Reliability",
      body: `The three constraints you'll manage constantly in production AI systems. LLM calls are **10–100x more expensive** than a database query, **100–1000x slower**, and dependent on a third-party service you don't control. Design for all three from day one.`,
      items: [
        "**Cost** — charge tokens consumed, not time. Cache results aggressively. Use smaller/cheaper models where quality allows.",
        "**Latency** — typical LLM response is 1–15 seconds. Stream responses to the client so the UI feels responsive.",
        "**Reliability** — LLM providers have outages and rate limits. Implement retries, fallbacks (try GPT-4o, fall back to GPT-4o-mini), and circuit breakers.",
        "**Rate limits** — providers throttle by tokens-per-minute and requests-per-minute. Queue requests and respect 429 responses.",
      ],
    },
    {
      heading: "Where to Start",
      body: `If you're adding AI to an existing backend: start with the simplest possible integration, measure cost and latency, then optimise. Don't over-engineer the first version. Pick one high-value use case, wire up a direct LLM call, put it behind a feature flag, measure results in production, then iterate.`,
      code: `# Minimal production-ready AI endpoint
from fastapi import FastAPI, HTTPException
import anthropic, os

app  = FastAPI()
llm  = anthropic.Anthropic()   # ANTHROPIC_API_KEY from env

@app.post("/summarise")
async def summarise(text: str):
    if len(text) > 50_000:
        raise HTTPException(400, "Text too long")

    msg = llm.messages.create(
        model="claude-haiku-4-5-20251001",   # cheapest model for simple tasks
        max_tokens=512,
        messages=[
            {"role": "user", "content": f"Summarise in 3 bullet points:\\n\\n{text}"},
        ],
    )
    return {"summary": msg.content[0].text}`,
    },
  ],
};
