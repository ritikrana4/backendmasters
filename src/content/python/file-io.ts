export const content = {
  title: "File I/O",
  sections: [
    {
      heading: "Opening and Reading Files",
      body: `Use the built-in \`open(path, mode)\` function to open a file. Always use it with the \`with\` statement — it guarantees the file is closed when the block exits, even if an error occurs. The default mode is \`"r"\` (read text).`,
      code: `# Write a file first so we have something to read
with open("hello.txt", "w") as f:
    f.write("Hello, File I/O!\\n")
    f.write("Second line.\\n")
    f.write("Third line.\\n")

# Read the entire file as one string
with open("hello.txt", "r") as f:
    content = f.read()
    print(content)

# Read line by line (memory-efficient for large files)
with open("hello.txt") as f:
    for line in f:
        print(repr(line))`,
    },
    {
      heading: "Reading Methods",
      body: `The file object has three read methods with different trade-offs:`,
      items: [
        "`f.read()` — entire file as one string. Simple, but loads the whole file into memory.",
        "`f.readline()` — reads one line at a time (including the `\\n`). Good for streaming.",
        "`f.readlines()` — returns a list of all lines. Handy when you need random access to lines.",
      ],
      code: `with open("hello.txt", "w") as f:
    f.writelines(["line one\\n", "line two\\n", "line three\\n"])

# readlines() — list of all lines
with open("hello.txt") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
for i, line in enumerate(lines, 1):
    print(f"{i}: {line.strip()}")`,
    },
    {
      heading: "Writing Files",
      body: `Mode \`"w"\` creates or overwrites a file. Mode \`"a"\` appends to an existing file without erasing it. Mode \`"x"\` creates a new file and fails if it already exists — useful when you want to avoid accidental overwrites.`,
      code: `# "w" — create or overwrite
with open("log.txt", "w") as f:
    f.write("Session started\\n")

# "a" — append without overwriting
with open("log.txt", "a") as f:
    f.write("Event: user logged in\\n")
    f.write("Event: page loaded\\n")

with open("log.txt") as f:
    print(f.read())`,
    },
    {
      heading: "Working with CSV",
      body: `Python's \`csv\` module handles comma-separated values correctly — including quoted fields, commas inside fields, and different delimiters. Use \`csv.reader\` for reading and \`csv.writer\` / \`csv.DictWriter\` for writing.`,
      code: `import csv

# Write CSV
rows = [
    ["name", "age", "city"],
    ["Alice", "30", "London"],
    ["Bob", "25", "New York"],
    ["Charlie", "35", "Tokyo"],
]
with open("people.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

# Read as dicts (header row becomes keys)
with open("people.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['name']} ({row['age']}) — {row['city']}")`,
    },
    {
      heading: "Working with JSON Files",
      body: `\`json.dump()\` serialises a Python object to a JSON file. \`json.load()\` parses a JSON file back into Python objects. This is the standard way to persist configuration, API responses, and structured data.`,
      code: `import json

data = {
    "app": "Panel",
    "version": "1.0",
    "features": ["python", "go"],
    "settings": {"theme": "dark", "font_size": 14},
}

# Write JSON
with open("config.json", "w") as f:
    json.dump(data, f, indent=2)

# Read JSON
with open("config.json") as f:
    loaded = json.load(f)

print(loaded["app"])
print(loaded["features"])
print(loaded["settings"]["theme"])`,
    },
  ],
  starterCode: `# File I/O practice
import json
import csv

# 1. Write a small CSV of quiz scores
scores = [
    {"name": "Alice",   "score": 92},
    {"name": "Bob",     "score": 78},
    {"name": "Charlie", "score": 85},
]

with open("scores.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerows(scores)

# 2. Read it back and compute stats
with open("scores.csv") as f:
    reader = csv.DictReader(f)
    results = list(reader)

values = [int(r["score"]) for r in results]
print("Scores:", values)
print(f"Average: {sum(values) / len(values):.1f}")
print(f"Top scorer: {max(results, key=lambda r: int(r['score']))['name']}")

# 3. Save summary as JSON
summary = {"average": sum(values) / len(values), "count": len(values)}
with open("summary.json", "w") as f:
    json.dump(summary, f, indent=2)
print("\\nSummary saved:", summary)
`,
};
