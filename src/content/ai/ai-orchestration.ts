export const content = {
  title: "AI Orchestration",
  sections: [
    {
      heading: "What is AI Orchestration?",
      body: `**AI orchestration** is coordinating multiple LLM calls, tools, and data sources to complete a complex task. A single LLM call rarely solves hard problems — you need chains (one output feeds the next), branches (choose path based on output), and parallel execution (run steps concurrently). Orchestration is software engineering, not prompt engineering.`,
    },
    {
      heading: "Chains: Sequential LLM Calls",
      body: `The simplest pattern: the output of one LLM call becomes the input of the next. Useful when a task naturally breaks into stages — extract first, then analyse, then format. Each step can use a different model or prompt, optimised for that specific subtask.`,
      code: `import anthropic

client = anthropic.Anthropic()

def llm(system: str, user: str, model="claude-haiku-4-5-20251001", max_tokens=512) -> str:
    return client.messages.create(
        model=model, max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    ).content[0].text.strip()

# Chain: extract → analyse → report
def analyse_review(raw_review: str) -> str:
    # Step 1: Extract key facts
    facts = llm(
        "Extract: product name, rating (1-5), key positive and negative points. JSON only.",
        raw_review,
    )

    # Step 2: Classify sentiment and urgency
    classification = llm(
        "Given this review summary, classify: urgent_response (true/false), recommended_action. JSON.",
        facts,
    )

    # Step 3: Draft response
    response = llm(
        "Draft a professional 2-sentence customer response to this review.",
        f"Review facts: {facts}\\nClassification: {classification}",
        model="claude-sonnet-4-6",  # better model for final output
        max_tokens=256,
    )
    return response`,
    },
    {
      heading: "Parallel Execution",
      body: `When steps are independent, run them concurrently. If you have 5 documents to summarise, running them in parallel cuts total time from 5× to 1× latency. Use Python's **asyncio.gather** for async LLM calls.`,
      code: `import asyncio
import anthropic

client = anthropic.AsyncAnthropic()

async def summarise(doc: str) -> str:
    msg = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        messages=[{"role": "user", "content": f"Summarise in 2 sentences:\\n{doc}"}],
    )
    return msg.content[0].text

async def summarise_all(docs: list[str]) -> list[str]:
    # All docs summarised concurrently — total time ≈ slowest single call
    return await asyncio.gather(*[summarise(doc) for doc in docs])

# Sequential: 5 × 3s = 15s
# Parallel:   max(3s, 3s, 3s, 3s, 3s) ≈ 3s

# Limit concurrency to avoid rate limits
from asyncio import Semaphore

sem = Semaphore(10)   # max 10 concurrent calls

async def summarise_throttled(doc: str) -> str:
    async with sem:
        return await summarise(doc)`,
    },
    {
      heading: "Router Pattern",
      body: `Use a cheap, fast model to **classify** the request, then route it to the appropriate handler. This avoids sending every request to an expensive model. The classifier only needs to output a category label — cheap and reliable.`,
      code: `import anthropic

client = anthropic.Anthropic()

def route(question: str) -> str:
    """Returns: 'sql', 'python', 'general'"""
    label = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=16,
        system="Classify the question as: sql, python, or general. One word only.",
        messages=[{"role": "user", "content": question}],
    ).content[0].text.strip().lower()

    if label not in ("sql", "python", "general"):
        return "general"
    return label

SQL_SYSTEM    = "You are a PostgreSQL expert. Answer with SQL examples."
PYTHON_SYSTEM = "You are a Python expert. Answer with runnable code examples."
GENERAL_SYSTEM = "You are a helpful software engineering assistant."

SYSTEMS = {"sql": SQL_SYSTEM, "python": PYTHON_SYSTEM, "general": GENERAL_SYSTEM}

def answer(question: str) -> str:
    category = route(question)
    return client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEMS[category],
        messages=[{"role": "user", "content": question}],
    ).content[0].text`,
    },
    {
      heading: "Orchestration Frameworks",
      body: `Libraries like **LangChain**, **LlamaIndex**, and **CrewAI** provide higher-level abstractions for orchestration. They handle plumbing — connecting retrievers, memory, tools — but add complexity. Useful when building quickly; consider going lower-level as you optimise.`,
      items: [
        "**LangChain** — broad ecosystem, chains, agents, memory, document loaders. Most popular.",
        "**LlamaIndex** — focused on RAG and document Q&A. Excellent retrieval utilities.",
        "**CrewAI** — multi-agent collaboration with role-based agents and task assignment.",
        "**LangGraph** — graph-based agent workflows from the LangChain team. Good for complex state machines.",
        "**Direct SDK** — often cleaner for custom systems. Start here, adopt a framework if needed.",
      ],
    },
    {
      heading: "State Management in Multi-Step Pipelines",
      body: `Long-running agent workflows need explicit state management. Pass state explicitly between steps rather than relying on the LLM to remember. For durable workflows that survive server restarts, persist state in a database.`,
      code: `from dataclasses import dataclass, field
from typing import Any
import json

@dataclass
class AgentState:
    session_id:  str
    user_query:  str
    step:        int = 0
    context:     dict = field(default_factory=dict)
    tool_calls:  list = field(default_factory=list)
    final_answer: str | None = None

    def to_json(self) -> str:
        return json.dumps(self.__dict__)

    @classmethod
    def from_json(cls, s: str) -> "AgentState":
        return cls(**json.loads(s))

# Persist between steps (e.g. in Redis or a DB row)
def save_state(state: AgentState, redis_client):
    redis_client.set(f"agent:{state.session_id}", state.to_json(), ex=3600)

def load_state(session_id: str, redis_client) -> AgentState | None:
    raw = redis_client.get(f"agent:{session_id}")
    return AgentState.from_json(raw) if raw else None`,
    },
  ],
};
