export const content = {
  title: "AI Agents & Tool Use",
  sections: [
    {
      heading: "What is an AI Agent?",
      body: `An **AI agent** is a system where an LLM drives a loop: observe → decide → act → observe. Rather than a single prompt → response, the LLM can call **tools** (functions you expose), inspect the results, and continue reasoning until it completes a task. This allows agents to browse the web, query databases, run code, and interact with external APIs.`,
    },
    {
      heading: "Tool Use (Function Calling)",
      body: `Tool use (also called function calling) lets you describe functions to the model. The model decides when and how to call them — returning a structured request that your code executes. This keeps the LLM in charge of reasoning while your code handles execution. All major providers support this natively.`,
      code: `import anthropic, json

client = anthropic.Anthropic()

# Define tools the model can call
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city":    {"type": "string", "description": "City name, e.g. 'London'"},
                "country": {"type": "string", "description": "ISO country code, e.g. 'GB'"},
            },
            "required": ["city"],
        },
    }
]

# The model may request a tool call
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather like in Tokyo?"}],
)

# Check if model wants to call a tool
if response.stop_reason == "tool_use":
    for block in response.content:
        if block.type == "tool_use":
            print(f"Calling tool: {block.name}")
            print(f"With input: {json.dumps(block.input, indent=2)}")
            # → {"city": "Tokyo"}`,
    },
    {
      heading: "The Agent Loop",
      body: `A complete agent executes in a loop: send message → receive tool call → execute tool → send result back → receive tool call or final answer. The loop continues until the model returns a text response with no tool calls.`,
      code: `import anthropic, json

client = anthropic.Anthropic()

# Actual tool implementations
def get_weather(city: str, country: str = "") -> dict:
    # In production, call a real weather API
    return {"city": city, "temp_c": 22, "condition": "sunny"}

def search_web(query: str) -> list[str]:
    # In production, call a search API
    return [f"Result for '{query}': example snippet..."]

TOOLS = [
    {
        "name": "get_weather",
        "description": "Get current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city":    {"type": "string"},
                "country": {"type": "string"},
            },
            "required": ["city"],
        },
    },
    {
        "name": "search_web",
        "description": "Search the web for up-to-date information.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
]

TOOL_FNS = {"get_weather": get_weather, "search_web": search_web}

def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=TOOLS,
            messages=messages,
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Extract final text answer
            return next(b.text for b in response.content if hasattr(b, "text"))

        # Execute each tool call
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                fn     = TOOL_FNS[block.name]
                result = fn(**block.input)
                tool_results.append({
                    "type":        "tool_result",
                    "tool_use_id": block.id,
                    "content":     json.dumps(result),
                })

        messages.append({"role": "user", "content": tool_results})

answer = run_agent("Is it a good day for a picnic in London?")
print(answer)`,
    },
    {
      heading: "Designing Good Tools",
      body: `The quality of your tools determines agent quality. Poorly described or unreliable tools lead to confused agents.`,
      items: [
        "**One responsibility per tool** — a 'search_and_summarise' tool does too much; split it",
        "**Rich descriptions** — describe when to use the tool and what its parameters mean. The model reads this.",
        "**Return structured data** — return JSON dicts, not prose. The model needs to read the result.",
        "**Include units and constraints** — 'temperature in Celsius', 'max 10 results'",
        "**Fail gracefully** — return `{\"error\": \"not found\"}` rather than throwing. Agents need to handle failures.",
        "**Idempotent where possible** — agents may call the same tool twice. Make mutations safe to retry.",
      ],
    },
    {
      heading: "Agent Safety & Guardrails",
      body: `Agents with tool access can take real actions — send emails, write to databases, call APIs. You need guardrails to prevent runaway or malicious use.`,
      items: [
        "**Minimal permissions** — give the agent only the tools it needs. Don't expose a 'delete_all' function.",
        "**Human-in-the-loop** — for irreversible actions (send email, publish post), require human confirmation.",
        "**Max iterations** — cap the agent loop to prevent infinite tool calls. 10–20 iterations is usually enough.",
        "**Budget limits** — track cost per session and abort if a threshold is exceeded.",
        "**Audit log** — log every tool call with inputs and outputs. Essential for debugging and compliance.",
      ],
      code: `MAX_ITERATIONS = 15

def run_agent_safe(user_message: str) -> str:
    messages  = [{"role": "user", "content": user_message}]
    iteration = 0

    while iteration < MAX_ITERATIONS:
        iteration += 1
        response  = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=TOOLS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if hasattr(b, "text"))

        # ... tool execution ...

    return "Agent reached maximum iterations without completing the task."`,
    },
  ],
};
