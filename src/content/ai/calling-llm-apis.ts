export const content = {
  title: "Calling LLM APIs",
  sections: [
    {
      heading: "API Structure Overview",
      body: `Every major LLM provider exposes a **chat completions** endpoint that accepts a list of messages and returns a completion. The request shape is nearly identical across providers: a model name, a messages array, and generation parameters. The SDKs are thin wrappers — understanding the raw API lets you work with any provider.`,
      code: `# OpenAI-compatible API shape (also used by many open-source providers)
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user",   "content": "Explain JWT in one paragraph."}
  ],
  "max_tokens": 512,
  "temperature": 0.3,
  "stream": false
}

# Response shape
{
  "id": "chatcmpl-...",
  "choices": [
    {
      "message": {"role": "assistant", "content": "JWT (JSON Web Token) is..."},
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 32,
    "completion_tokens": 87,
    "total_tokens": 119
  }
}`,
    },
    {
      heading: "Using the Anthropic SDK",
      body: `The Anthropic SDK is the official Python client for Claude. It handles auth, retries, and response parsing. Install with **pip install anthropic**. Set your API key via the **ANTHROPIC_API_KEY** environment variable — never hardcode keys in source.`,
      code: `# pip install anthropic
import anthropic

client = anthropic.Anthropic()   # reads ANTHROPIC_API_KEY from env

# Basic message
msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What is the difference between TCP and UDP?"},
    ],
)
print(msg.content[0].text)

# With system prompt
msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    system="You are a database expert. Answer concisely in plain language.",
    messages=[
        {"role": "user", "content": "When should I use a partial index?"},
    ],
)
print(msg.content[0].text)

# Access usage for cost tracking
print(f"Input tokens: {msg.usage.input_tokens}")
print(f"Output tokens: {msg.usage.output_tokens}")`,
    },
    {
      heading: "Multi-turn Conversations",
      body: `LLMs are **stateless** — each API call is independent. To build a multi-turn conversation you must send the **entire conversation history** with every request. You maintain the history in your application and append new messages to it. This is simple to implement but means cost and latency grow with history length.`,
      code: `import anthropic

client = anthropic.Anthropic()

def chat_session():
    history: list[dict] = []

    while True:
        user_input = input("You: ")
        if user_input.lower() in ("quit", "exit"):
            break

        history.append({"role": "user", "content": user_input})

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system="You are a helpful coding assistant.",
            messages=history,
        )
        assistant_text = response.content[0].text
        history.append({"role": "assistant", "content": assistant_text})

        print(f"\\nAssistant: {assistant_text}\\n")

# Manage history length to control cost
MAX_TURNS = 20
def trim_history(history: list[dict]) -> list[dict]:
    # Keep system context + last N turns
    return history[-MAX_TURNS * 2:]`,
    },
    {
      heading: "Error Handling & Retries",
      body: `LLM APIs fail. Common errors: **rate limits (429)**, **server errors (500/529)**, **context length exceeded**, and **timeouts**. Always handle these. The SDK has built-in retry logic for transient errors, but you should also implement your own timeout and fallback strategy.`,
      code: `import anthropic, time
from anthropic import RateLimitError, APIStatusError, APITimeoutError

client = anthropic.Anthropic(
    timeout=30.0,          # 30s per request
    max_retries=3,         # auto-retry on 429/5xx
)

def safe_complete(prompt: str, model="claude-haiku-4-5-20251001") -> str | None:
    try:
        msg = client.messages.create(
            model=model,
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text

    except RateLimitError:
        # Exponential back-off if SDK retries exhausted
        time.sleep(60)
        return safe_complete(prompt, model)

    except APIStatusError as e:
        if e.status_code == 529:   # overloaded
            time.sleep(10)
            return safe_complete(prompt, "claude-haiku-4-5-20251001")  # fall back to smaller
        raise

    except APITimeoutError:
        return None   # caller decides what to do`,
    },
    {
      heading: "Async Calls",
      body: `For web servers handling many concurrent requests, use the **async client** so LLM calls don't block the event loop. The interface is identical to the sync client — just add \`await\` and use \`AsyncAnthropic\`.`,
      code: `import asyncio
import anthropic

client = anthropic.AsyncAnthropic()

async def classify(text: str) -> str:
    msg = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=64,
        system="Classify sentiment: positive, negative, or neutral. One word only.",
        messages=[{"role": "user", "content": text}],
    )
    return msg.content[0].text.strip().lower()

# Process multiple texts concurrently
async def classify_batch(texts: list[str]) -> list[str]:
    tasks = [classify(t) for t in texts]
    return await asyncio.gather(*tasks)

# In FastAPI
from fastapi import FastAPI
app = FastAPI()

@app.post("/classify")
async def classify_endpoint(text: str) -> dict:
    label = await classify(text)
    return {"label": label}`,
    },
    {
      heading: "Structured Output (JSON Mode)",
      body: `Parsing freeform LLM text is fragile. Most production systems need the LLM to return **structured JSON**. Three approaches: instruct the model in the prompt, use the provider's native JSON mode, or use a schema-validated library like **Instructor**. The most robust approach is to validate the JSON against a schema and retry on failure.`,
      code: `# Approach 1: prompt-based (simple, works everywhere)
import json, anthropic

client = anthropic.Anthropic()

def extract_person(text: str) -> dict:
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        system='Extract name and age. Respond with JSON only: {"name": str, "age": int|null}',
        messages=[{"role": "user", "content": text}],
    )
    return json.loads(msg.content[0].text)

# Approach 2: Instructor library (schema-validated, auto-retry)
# pip install instructor
import instructor
from pydantic import BaseModel

client_i = instructor.from_anthropic(anthropic.Anthropic())

class Person(BaseModel):
    name: str
    age: int | None

def extract_person_typed(text: str) -> Person:
    return client_i.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        messages=[{"role": "user", "content": text}],
        response_model=Person,
    )

person = extract_person_typed("Alice is a 32-year-old engineer from London.")
print(person.name, person.age)  # Alice 32`,
    },
  ],
};
