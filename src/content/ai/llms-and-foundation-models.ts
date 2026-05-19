export const content = {
  title: "LLMs & Foundation Models",
  sections: [
    {
      heading: "What is a Large Language Model?",
      body: `A **large language model (LLM)** is a neural network trained to predict the next token in a sequence of text. By doing this at massive scale — billions of parameters, trillions of tokens — these models learn grammar, facts, reasoning patterns, and code. The key insight: next-token prediction, done at scale, produces surprisingly general intelligence.`,
    },
    {
      heading: "Tokens, Not Words",
      body: `LLMs operate on **tokens**, not characters or words. A token is roughly 3–4 characters of English text. "Hello world" is 2 tokens; a Python function might be 50–200 tokens. Token count determines **cost** (pricing is per 1 000 tokens) and **context window** (the maximum tokens in one conversation).`,
      code: `# Rough token estimation
def estimate_tokens(text: str) -> int:
    return len(text) // 4   # very rough: ~4 chars per token

# Examples (actual tokenisation varies by model)
# "Hello, world!"          → ~4 tokens
# A 1-page document        → ~500 tokens
# A 10k-line Python file   → ~50,000 tokens

# Context windows (as of 2025)
# GPT-4o:            128 000 tokens (~300 pages)
# Claude 3.5 Sonnet: 200 000 tokens (~460 pages)
# Gemini 1.5 Pro:    1 000 000 tokens (~2 300 pages)

# Cost example (approximate)
# GPT-4o: $2.50 per 1M input tokens, $10 per 1M output tokens
# Claude Haiku: $0.25 per 1M input, $1.25 per 1M output`,
    },
    {
      heading: "The Transformer Architecture (Conceptually)",
      body: `All modern LLMs use the **transformer** architecture. You don't need to understand the math to use LLMs effectively, but three concepts help: **attention** (tokens can look at all other tokens in context), **layers** (stacked attention + feed-forward blocks deepen understanding), and **parameters** (weights learned during training — more parameters generally means more capability).`,
      items: [
        "**Attention** — each token attends to all others; long-range dependencies captured naturally",
        "**Scale** — GPT-3 had 175B parameters; modern frontier models may exceed 1T",
        "**Temperature** — a sampling parameter: 0 = deterministic, 1 = creative, 2 = chaotic. Most production uses: 0–0.3",
        "**Context is everything** — the model only knows what's in the current context window; it has no memory across calls",
      ],
    },
    {
      heading: "Foundation Models vs Fine-tuned Models",
      body: `A **foundation model** (also called a base model) is pre-trained on broad internet text. You typically don't use it directly — it just predicts the next token. **Instruction-tuned** models (like ChatGPT, Claude, Gemini) are foundation models further trained with RLHF to follow instructions and be helpful. Most API access is to instruction-tuned models.`,
      code: `# The hierarchy of models you'll encounter
#
# Base model    →  raw next-token predictor  (rarely exposed via API)
# Instruction   →  follows instructions, chat-format  (what you call daily)
# Fine-tuned    →  instruction model + your domain data  (optional)
#
# Naming convention
# "claude-opus-4-7"         →  largest / best quality / most expensive
# "claude-sonnet-4-6"       →  balanced quality / cost
# "claude-haiku-4-5-20251001" →  fastest / cheapest / smaller capability
#
# Rule of thumb: always start with the cheapest model that meets quality bar`,
    },
    {
      heading: "Closed vs Open-Weight Models",
      body: `**Closed** models (GPT-4, Claude, Gemini) run on the provider's infrastructure — you call an API. **Open-weight** models (Llama 3, Mistral, Qwen) release the model weights so you can run them yourself. Open-weight means you control the infrastructure, have no per-token cost after setup, and can fine-tune freely — but you pay for GPUs and operational overhead.`,
      items: [
        "**Closed API pros**: no infra, easiest to start, frontier quality, provider handles scaling",
        "**Closed API cons**: data leaves your servers, per-token cost, rate limits, vendor lock-in",
        "**Open-weight pros**: full data control, no per-token cost at scale, fine-tune freely",
        "**Open-weight cons**: need GPU infra, smaller quality gap closing but still real, you operate it",
        "**Hybrid**: start with closed API, migrate hot paths to self-hosted open-weight as scale justifies",
      ],
    },
    {
      heading: "Multimodal Models",
      body: `Modern LLMs are increasingly **multimodal** — they accept images, audio, video, and documents in addition to text. GPT-4o, Claude 3.5, and Gemini 1.5 all accept image inputs. This enables use cases like extracting data from screenshots, understanding charts, or processing scanned documents — all via the same chat API.`,
      code: `import anthropic, base64, httpx

client = anthropic.Anthropic()

# Send an image to Claude
image_bytes = httpx.get("https://example.com/chart.png").content
image_b64   = base64.standard_b64encode(image_bytes).decode("utf-8")

msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": "image/png", "data": image_b64},
                },
                {"type": "text", "text": "What does this chart show? Extract the key numbers."},
            ],
        }
    ],
)
print(msg.content[0].text)`,
    },
  ],
};
