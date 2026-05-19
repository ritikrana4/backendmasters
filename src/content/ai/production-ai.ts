export const content = {
  title: "Production AI",
  sections: [
    {
      heading: "Production AI Checklist",
      body: `Shipping an AI feature to production requires the same engineering rigour as any other service — plus AI-specific concerns around cost, latency, and non-determinism. Use this as a pre-ship checklist.`,
      items: [
        "**Cost controls** — set max_tokens, log token usage per request, alert on cost anomalies",
        "**Latency budget** — decide upfront: is this blocking (user waits) or async? Stream if blocking.",
        "**Error handling** — handle rate limits, timeouts, and provider outages. Have a graceful fallback.",
        "**Input validation** — sanitise and length-limit user inputs before sending to the LLM",
        "**Output validation** — parse and validate LLM output before acting on it or displaying it",
        "**Observability** — log every LLM call: prompt, model, tokens, latency, cost, output hash",
        "**Eval suite** — run automated evals on every prompt change before deploying",
        "**Feature flag** — ship behind a flag so you can roll back without a deploy",
      ],
    },
    {
      heading: "Caching LLM Responses",
      body: `LLM calls are expensive and slow. Caching identical or near-identical requests dramatically reduces cost and latency. There are two levels: **exact caching** (same prompt → same response) and **semantic caching** (similar prompt → reuse existing response).`,
      code: `import hashlib, json
import redis

cache = redis.Redis()
TTL   = 3600   # cache for 1 hour

def cache_key(model: str, messages: list[dict]) -> str:
    payload = json.dumps({"model": model, "messages": messages}, sort_keys=True)
    return "llm:" + hashlib.sha256(payload.encode()).hexdigest()

def cached_complete(model: str, messages: list[dict], client) -> str:
    key    = cache_key(model, messages)
    cached = cache.get(key)

    if cached:
        return cached.decode()   # cache hit — no LLM call

    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=messages,
    ).content[0].text

    cache.set(key, response, ex=TTL)
    return response

# Anthropic also has server-side prompt caching
# Prefix your stable system prompt with cache_control
system_with_cache = [
    {
        "type": "text",
        "text": "You are a helpful assistant with expertise in databases...",
        "cache_control": {"type": "ephemeral"},   # cache this prefix
    }
]`,
    },
    {
      heading: "Rate Limiting and Quotas",
      body: `LLM provider rate limits come in two flavours: **requests per minute (RPM)** and **tokens per minute (TPM)**. When you hit them, the provider returns HTTP 429. Implement queuing and back-off rather than letting requests fail.`,
      code: `import asyncio, time
from collections import deque

class TokenBucketLimiter:
    """Simple token bucket for rate limiting outgoing LLM calls."""

    def __init__(self, rate: int, per: float = 60.0):
        self.rate      = rate         # tokens per period
        self.per       = per          # period in seconds
        self.allowance = float(rate)
        self.last      = time.monotonic()

    async def acquire(self, cost: int = 1):
        now     = time.monotonic()
        elapsed = now - self.last
        self.last = now
        self.allowance += elapsed * (self.rate / self.per)
        self.allowance  = min(self.allowance, float(self.rate))

        if self.allowance < cost:
            wait = (cost - self.allowance) * (self.per / self.rate)
            await asyncio.sleep(wait)
            self.allowance = 0
        else:
            self.allowance -= cost

# Usage
limiter = TokenBucketLimiter(rate=60)   # 60 RPM

async def safe_call(client, messages):
    await limiter.acquire()
    return await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        messages=messages,
    )`,
    },
    {
      heading: "Observability for AI",
      body: `Standard APM tools don't capture AI-specific signals. You need custom instrumentation. Key things to track per LLM call: model, input tokens, output tokens, cost (estimated), latency, prompt hash, and a sample of outputs.`,
      code: `import time, hashlib
import anthropic

client = anthropic.Anthropic()

# Simple structured logging for LLM calls
def tracked_complete(messages: list[dict], model="claude-haiku-4-5-20251001") -> str:
    start = time.monotonic()

    response = client.messages.create(
        model=model, max_tokens=1024, messages=messages,
    )

    latency      = time.monotonic() - start
    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens

    # Rough cost estimate (adjust per current pricing)
    COST_PER_1K = {"claude-haiku-4-5-20251001": (0.00025, 0.00125), "claude-sonnet-4-6": (0.003, 0.015)}
    in_price, out_price = COST_PER_1K.get(model, (0, 0))
    cost_usd = (input_tokens / 1000 * in_price) + (output_tokens / 1000 * out_price)

    # Log to your observability system
    import logging
    logging.info("llm_call", extra={
        "model":         model,
        "input_tokens":  input_tokens,
        "output_tokens": output_tokens,
        "latency_ms":    round(latency * 1000),
        "cost_usd":      round(cost_usd, 6),
        "prompt_hash":   hashlib.md5(str(messages).encode()).hexdigest()[:8],
    })

    return response.content[0].text`,
    },
    {
      heading: "Fallback Strategies",
      body: `Provider outages happen. Design multi-provider fallback before you need it.`,
      code: `import anthropic
from openai import OpenAI

anthropic_client = anthropic.Anthropic()
openai_client    = OpenAI()

def complete_with_fallback(prompt: str) -> str:
    # Try primary provider first
    try:
        return anthropic_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        ).content[0].text

    except (anthropic.APIStatusError, anthropic.APITimeoutError) as e:
        # Fall back to secondary provider
        print(f"Anthropic failed ({e}), falling back to OpenAI")
        return openai_client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        ).choices[0].message.content`,
    },
  ],
};
