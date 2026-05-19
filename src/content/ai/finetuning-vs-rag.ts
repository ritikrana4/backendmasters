export const content = {
  title: "Fine-tuning vs RAG",
  sections: [
    {
      heading: "The Core Trade-off",
      body: `When an LLM doesn't know enough about your domain, you have two options: **RAG** (give it relevant information at query time) or **fine-tuning** (bake domain knowledge into the model weights). They solve different problems and are often used together. Understanding the distinction saves significant time, money, and frustration.`,
    },
    {
      heading: "When RAG Wins",
      body: `RAG is the right choice in most production scenarios. It's faster to iterate, cheaper to operate, and works when data changes frequently.`,
      items: [
        "**Data changes often** — support docs updated weekly, inventory prices change daily. RAG picks up changes immediately; fine-tuning requires re-training.",
        "**You need attribution** — RAG can cite which document it used; fine-tuned models can't explain where they learned something.",
        "**Budget is limited** — RAG requires only an embedding model and a vector DB. Fine-tuning requires GPU time and ML expertise.",
        "**Corpus is large** — context windows are 200k+ tokens now. Most queries only need a small slice. Inject that slice.",
        "**Speed to production** — a RAG system can be live in a day; fine-tuning takes days to weeks.",
      ],
    },
    {
      heading: "When Fine-tuning Wins",
      body: `Fine-tuning shines when you need to change the model's **behaviour, tone, or format** — things that can't be fixed by adding more context.`,
      items: [
        "**Consistent output format** — you need every response in a specific JSON schema or XML structure. RAG with prompt instructions is inconsistent; fine-tuning learns the format reliably.",
        "**Domain-specific style** — legal writing, medical terminology, or brand voice that no prompt instruction fully captures.",
        "**Latency is critical** — fine-tuned models can be smaller and faster; they don't need retrieval at query time.",
        "**Static, verified knowledge** — medical drug interactions, legal codes, taxonomy that rarely changes and must be exact.",
        "**Capability improvement** — you want the model to be better at a specific task (function extraction, code generation in your DSL). RAG doesn't improve capability.",
      ],
    },
    {
      heading: "Fine-tuning in Practice",
      body: `Fine-tuning a model today usually means **supervised fine-tuning (SFT)** — providing input/output pairs that demonstrate the desired behaviour. Most developers use provider fine-tuning APIs (OpenAI, Anthropic) rather than training from scratch. The dataset needs to be high quality; 100 great examples often beats 10 000 mediocre ones.`,
      code: `# OpenAI fine-tuning example
# 1. Prepare training data as JSONL
# Each line: {"messages": [{"role": "system", "content": "..."}, ...]}

import json

training_examples = [
    {
        "messages": [
            {"role": "system", "content": "Extract fields as JSON from invoices."},
            {"role": "user",   "content": "Invoice #4521 dated 2024-01-15 from Acme Corp, total $1,234.56"},
            {"role": "assistant", "content": '{"invoice_no": "4521", "date": "2024-01-15", "vendor": "Acme Corp", "total_usd": 1234.56}'},
        ]
    },
    # ... more examples
]

with open("training.jsonl", "w") as f:
    for ex in training_examples:
        f.write(json.dumps(ex) + "\\n")

# 2. Upload and start fine-tune job
# from openai import OpenAI
# client = OpenAI()
# file = client.files.create(file=open("training.jsonl", "rb"), purpose="fine-tune")
# job  = client.fine_tuning.jobs.create(training_file=file.id, model="gpt-4o-mini")
# Wait for job.status == "succeeded", then use job.fine_tuned_model as model ID`,
    },
    {
      heading: "RAG + Fine-tuning Together",
      body: `The most powerful setup for many production systems is **both**: fine-tune for output format and domain behaviour, then use RAG to inject fresh data at query time. The fine-tuned model knows your conventions; RAG provides the current facts.`,
      items: [
        "Fine-tune on examples of your desired JSON output format → model reliably follows it",
        "Fine-tune on few representative domain conversations → model speaks your domain language",
        "At query time, use RAG to inject current documents → model uses them with correct format",
        "Net result: consistent format + fresh data + domain tone",
      ],
    },
    {
      heading: "Decision Framework",
      body: `A practical flowchart for choosing between RAG, fine-tuning, or a combination.`,
      code: `# Decision flowchart (pseudo-code / thinking tool)
def choose_approach(problem: dict) -> str:
    if problem["data_changes_frequently"]:
        return "RAG"

    if problem["need_citation_or_attribution"]:
        return "RAG"

    if problem["need_behaviour_or_style_change"]:
        if problem["data_changes_frequently"]:
            return "fine-tune + RAG"
        return "fine-tuning"

    if problem["large_document_corpus"]:
        if problem["need_exact_format"]:
            return "fine-tune + RAG"
        return "RAG"

    # Default: start with RAG, fine-tune if quality isn't sufficient
    return "RAG (start here)"`,
    },
  ],
};
