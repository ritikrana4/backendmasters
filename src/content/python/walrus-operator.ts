export const content = {
  title: "Walrus Operator",
  sections: [
    {
      heading: "What is the Walrus Operator?",
      body: `The walrus operator \`:=\` (named for its resemblance to a walrus's eyes and tusks) is an **assignment expression** introduced in Python 3.8. It assigns a value to a variable and **also evaluates to that value** — in a single expression. The key difference from \`=\`: it can be used inside expressions like \`while\`, \`if\`, and comprehensions.`,
      code: `# Without walrus — compute twice or need an extra line
import re
text = "Order number: 12345"
match = re.search(r"\\d+", text)
if match:
    print(match.group())

# With walrus — assign and test in one line
if match := re.search(r"\\d+", text):
    print(match.group())   # 12345

# Also useful when the computation is expensive:
# Without walrus
data = [1, 2, 3, 4, 5]
result = sum(data)
if result > 10:
    print(f"Sum {result} exceeds threshold")

# With walrus
if (result := sum(data)) > 10:
    print(f"Sum {result} exceeds threshold")`,
    },
    {
      heading: "Walrus in while Loops",
      body: `The most classic use of \`:=\` is in \`while\` loops that read until a sentinel. Without walrus, you need an awkward "read twice" pattern or a \`while True: ... break\` structure. Walrus cleans this up.`,
      code: `# Chunked file reading — classic walrus pattern
# Write a file to read
with open("/tmp/walrus_demo.txt", "w") as f:
    f.write("Hello World from walrus operator demo file.\\n" * 3)

# Without walrus — duplicated read() calls
with open("/tmp/walrus_demo.txt") as f:
    chunk = f.read(10)
    while chunk:
        print(repr(chunk), end=" ")
        chunk = f.read(10)

print()

# With walrus — assign and test in one place
with open("/tmp/walrus_demo.txt") as f:
    while chunk := f.read(10):
        print(repr(chunk), end=" ")`,
    },
    {
      heading: "Walrus in Comprehensions",
      body: `In a list comprehension with a filter, the expression is sometimes evaluated twice — once in the condition and once in the output. Walrus lets you compute it once, store it, and use it in both places.`,
      code: `import math

def expensive(x):
    """Simulate a slow computation."""
    return math.sqrt(abs(x - 5)) * 10

data = range(-5, 15)

# Without walrus — expensive() called twice per item
results_old = [v for x in data if (v := expensive(x)) > 15]

# With walrus — expensive() called once, result reused
results = [y for x in data if (y := expensive(x)) > 15]
print([f"{v:.1f}" for v in results])

# Another pattern: filter + transform
words = ["  hello  ", "  ", "world", "", "  python  "]
cleaned = [s for w in words if (s := w.strip())]
print(cleaned)   # ['hello', 'world', 'python']`,
    },
    {
      heading: "Walrus in while with Input",
      body: `Reading user input in a loop is a perfect fit for walrus — you want to read, store the value, and test it simultaneously.`,
      code: `# Simulate reading lines from a string (like stdin)
import io, sys

# Simulate interactive input
fake_input = io.StringIO("hello\\nworld\\nquit\\n")
sys.stdin = fake_input

# Old way
line = sys.stdin.readline().strip()
while line != "quit":
    print(f"Echo: {line}")
    line = sys.stdin.readline().strip()

fake_input.seek(0)   # reset

# Walrus way
while (line := sys.stdin.readline().strip()) != "quit":
    print(f"Echo: {line}")

# Restore stdin
sys.stdin = sys.__stdin__`,
    },
    {
      heading: "When NOT to Use Walrus",
      body: `Walrus is a power tool — it removes code duplication and adds clarity in specific situations. But overusing it makes code harder to read. Use it when it genuinely reduces repetition; avoid it when a plain \`=\` on the line before would be clearer.`,
      items: [
        "✅ `while chunk := f.read(1024):` — reads until EOF cleanly",
        "✅ `if m := re.match(pattern, text):` — match and test in one line",
        "✅ Comprehensions where a sub-expression is used in both filter and output",
        "❌ `if (x := 5) > 3:` — just write `x = 5` then `if x > 3`",
        "❌ Deeply nested walrus inside complex expressions — unreadable",
        "❌ Replacing every occurrence of `=` before `if` — that's overuse",
      ],
    },
  ],
  starterCode: `import re

# Parse a log file line by line using walrus
LOG = """
2026-05-18 10:01:32 INFO  Server started on port 8080
2026-05-18 10:02:15 ERROR Failed to connect: timeout after 30s
2026-05-18 10:03:44 INFO  200 GET /api/users
2026-05-18 10:04:01 WARNING Rate limit: 95% of quota used
2026-05-18 10:05:22 ERROR  Database connection lost
2026-05-18 10:06:00 INFO  200 GET /health
"""

ERROR_PATTERN = re.compile(r"(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) (ERROR|WARNING) (.+)")

errors = []
for line in LOG.strip().splitlines():
    if m := ERROR_PATTERN.search(line):
        errors.append({
            "time":    m.group(1),
            "level":   m.group(2),
            "message": m.group(3).strip(),
        })

print(f"Found {len(errors)} issues:\\n")
for e in errors:
    print(f"[{e['level']:7s}] {e['time']}  {e['message']}")

# Count by level using walrus in comprehension
from collections import Counter
levels = Counter(e["level"] for e in errors)
print("\\nSummary:", dict(levels))
`,
};
