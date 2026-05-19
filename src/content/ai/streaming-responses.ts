export const content = {
  title: "Streaming AI Responses",
  sections: [
    {
      heading: "Why Stream?",
      body: `LLMs generate text **token by token**. Without streaming, the user waits 5–15 seconds staring at a blank screen, then sees the full response appear instantly. With streaming, tokens appear as they're generated — making the experience feel 5–10× more responsive even though the total time is the same. Streaming is table stakes for any user-facing AI feature.`,
    },
    {
      heading: "Streaming with the Anthropic SDK",
      body: `The Anthropic SDK provides a streaming interface via \`stream()\`. It yields events as the model generates text. The \`text_stream\` helper gives you just the text tokens — ideal for most use cases.`,
      code: `import anthropic

client = anthropic.Anthropic()

# Stream to terminal
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain how a CPU works."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
    print()  # final newline

# Access the complete message after streaming
final = stream.get_final_message()
print(f"\\nTotal tokens: {final.usage.input_tokens + final.usage.output_tokens}")

# Async streaming
import asyncio

async def stream_async():
    async with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": "Count from 1 to 10 slowly."}],
    ) as stream:
        async for text in stream.text_stream:
            print(text, end="", flush=True)

asyncio.run(stream_async())`,
    },
    {
      heading: "Streaming in a Web API (Server-Sent Events)",
      body: `To stream to a browser, the most common approach is **Server-Sent Events (SSE)**. The server sends a stream of \`data:\` lines; the client reads them with EventSource or the Fetch API. FastAPI supports this natively with \`StreamingResponse\`.`,
      code: `from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import anthropic

app    = FastAPI()
client = anthropic.Anthropic()

async def llm_stream(prompt: str):
    """Yield SSE-formatted chunks from the LLM."""
    with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            # SSE format: "data: <text>\\n\\n"
            yield f"data: {text}\\n\\n"
    yield "data: [DONE]\\n\\n"

@app.get("/stream")
async def stream_endpoint(prompt: str):
    return StreamingResponse(
        llm_stream(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable nginx buffering
        },
    )`,
    },
    {
      heading: "Consuming SSE on the Client",
      body: `On the frontend, consume the SSE stream using the **Fetch API** with a reader. The EventSource API is simpler but doesn't support POST requests or custom headers.`,
      code: `// JavaScript — consuming SSE stream with fetch
async function streamLLM(prompt) {
  const response = await fetch(\`/stream?prompt=\${encodeURIComponent(prompt)}\`);
  const reader   = response.body.getReader();
  const decoder  = new TextDecoder();

  let output = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Parse SSE lines: "data: <content>"
    for (const line of chunk.split("\\n")) {
      if (line.startsWith("data: ")) {
        const text = line.slice(6);
        if (text === "[DONE]") return output;
        output += text;
        document.getElementById("output").textContent = output;
      }
    }
  }
  return output;
}`,
    },
    {
      heading: "Streaming Tool Use",
      body: `When an agent uses tools, you need to handle a mixed stream — text tokens, tool call events, and tool result events. The SDK exposes event types so you can handle each appropriately.`,
      code: `import anthropic, json

client = anthropic.Anthropic()
tools  = [
    {
        "name": "calculator",
        "description": "Evaluate a math expression.",
        "input_schema": {
            "type": "object",
            "properties": {"expression": {"type": "string"}},
            "required": ["expression"],
        },
    }
]

with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What is 1234 * 5678?"}],
) as stream:
    for event in stream:
        if hasattr(event, "type"):
            if event.type == "content_block_start":
                if hasattr(event.content_block, "type"):
                    if event.content_block.type == "tool_use":
                        print(f"\\nTool call: {event.content_block.name}")

            elif event.type == "content_block_delta":
                delta = event.delta
                if hasattr(delta, "text"):
                    print(delta.text, end="", flush=True)
                elif hasattr(delta, "partial_json"):
                    print(delta.partial_json, end="", flush=True)`,
    },
    {
      heading: "Handling Backpressure & Timeouts",
      body: `Streaming creates new failure modes: the client disconnects mid-stream, the server times out, or the model hangs generating a very long response. Handle these defensively.`,
      items: [
        "**Client disconnect** — wrap the stream loop in a try/finally and clean up the stream if the client disconnects",
        "**Max tokens guard** — always set `max_tokens` to prevent runaway responses eating budget",
        "**Stream timeout** — set a wall-clock timeout on the entire stream, not just the connection",
        "**Proxy buffering** — disable nginx/Cloudflare buffering (`X-Accel-Buffering: no`) or tokens won't reach the client until buffered",
        "**First-token latency** — the model thinks before outputting. Log time-to-first-token separately from total time.",
      ],
    },
  ],
};
