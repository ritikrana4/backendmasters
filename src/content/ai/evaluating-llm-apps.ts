export const content = {
  title: "Evaluating LLM Applications",
  sections: [
    {
      heading: "Why Evaluation is Hard",
      body: `Traditional software has deterministic outputs — you can write a unit test that checks if the answer is exactly right. LLM outputs are **probabilistic and open-ended** — there are many valid ways to answer "Explain indexing". Evaluation requires a different mindset: you define quality criteria, build a test set, and score against those criteria systematically.`,
    },
    {
      heading: "Building an Eval Dataset",
      body: `The foundation of good evaluation is a **golden dataset** — a set of inputs paired with expected outputs or quality criteria. Start small (20–50 examples), cover edge cases, and grow over time. Include cases from real production traffic.`,
      code: `# Eval dataset format
evals = [
    {
        "input": "What is a database index?",
        "expected_keywords": ["lookup", "performance", "B-tree", "slow"],
        "expected_format": "explanation",
        "max_tokens_expected": 200,
    },
    {
        "input": "Write a Python function to reverse a string.",
        "expected_code": True,
        "must_be_correct": True,
    },
    {
        "input": "Explain the French Revolution",
        "expected_keywords": ["1789", "Bastille", "monarchy"],
        "expected_format": "historical summary",
    },
]`,
    },
    {
      heading: "Types of Evaluators",
      body: `Different quality dimensions need different evaluators. Use the simplest evaluator that catches the failure you care about.`,
      items: [
        "**Exact match** — did the output equal the expected string exactly? Works for classification, label extraction.",
        "**Contains check** — does the output contain required keywords or phrases? Good for factual recall.",
        "**Code execution** — run the generated code and check output. Best for code generation tasks.",
        "**LLM-as-judge** — use a strong model (GPT-4, Claude Opus) to grade another model's output. Expensive but flexible.",
        "**Human eval** — the gold standard. Sample production outputs and rate them. Use to calibrate automated evals.",
        "**RAGAS** — RAG-specific metrics: faithfulness, answer relevance, context precision, context recall.",
      ],
    },
    {
      heading: "LLM-as-Judge",
      body: `Using a capable LLM to evaluate another LLM's output is powerful — you can grade things like helpfulness, tone, accuracy without manual review. Provide a detailed rubric and ask for a score + reasoning. Studies show GPT-4/Claude correlate well with human judges when given clear criteria.`,
      code: `import anthropic

judge = anthropic.Anthropic()

JUDGE_SYSTEM = """You are an evaluator scoring AI assistant responses.
Score the response on these criteria (1-5 each):
- accuracy: factually correct?
- completeness: does it answer all parts of the question?
- clarity: easy to understand?

Return JSON: {"accuracy": N, "completeness": N, "clarity": N, "reasoning": "..."}"""

def evaluate(question: str, response: str) -> dict:
    import json
    msg = judge.messages.create(
        model="claude-sonnet-4-6",   # use a strong judge
        max_tokens=512,
        system=JUDGE_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": f"Question: {question}\\n\\nResponse to evaluate:\\n{response}",
            }
        ],
    )
    return json.loads(msg.content[0].text)

# Run on eval set
def run_evals(system_under_test, evals: list[dict]) -> dict:
    scores = []
    for item in evals:
        response = system_under_test(item["input"])
        score    = evaluate(item["input"], response)
        scores.append(score)

    avg_accuracy    = sum(s["accuracy"]    for s in scores) / len(scores)
    avg_completeness = sum(s["completeness"] for s in scores) / len(scores)
    return {"accuracy": avg_accuracy, "completeness": avg_completeness, "n": len(scores)}`,
    },
    {
      heading: "Regression Testing",
      body: `Run evals on every code change that touches prompts or retrieval logic. A regression is when a new version scores worse than the previous version on the eval set. Treat prompt changes like code changes — test them before shipping.`,
      code: `# In CI/CD: run evals on PR and compare to baseline
# .github/workflows/eval.yml (pseudo-code)
#
# 1. Run eval suite on current branch → save scores.json
# 2. Compare to main branch scores.json
# 3. Fail CI if any key metric drops > threshold

THRESHOLDS = {
    "accuracy":     0.80,  # 80% minimum
    "completeness": 0.75,
}

def check_regression(current: dict, baseline: dict) -> list[str]:
    failures = []
    for metric, threshold in THRESHOLDS.items():
        if current.get(metric, 0) < threshold:
            failures.append(f"{metric} {current[metric]:.2f} below threshold {threshold}")
        elif current.get(metric, 0) < baseline.get(metric, 0) - 0.05:
            failures.append(f"{metric} regressed: {baseline[metric]:.2f} → {current[metric]:.2f}")
    return failures`,
    },
    {
      heading: "RAG-Specific Metrics (RAGAS)",
      body: `RAG systems have their own quality dimensions beyond answer quality. The **RAGAS** framework provides standardised metrics.`,
      items: [
        "**Faithfulness** — does the answer only contain information from the retrieved context? Measures hallucination.",
        "**Answer relevance** — does the answer address the question? High faithfulness but low relevance = off-topic.",
        "**Context precision** — are the retrieved chunks actually relevant to the question?",
        "**Context recall** — does the retrieved context contain all necessary information to answer the question?",
      ],
      code: `# pip install ragas
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from datasets import Dataset

data = {
    "question":  ["What is an index?"],
    "answer":    ["An index speeds up lookups by..."],
    "contexts":  [["An index in a database is a data structure..."]],
    "ground_truth": ["An index is a data structure that improves query performance..."],
}

dataset = Dataset.from_dict(data)
results = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_precision])
print(results)`,
    },
  ],
};
