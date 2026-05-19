export const content = {
  title: "The print() Function",
  sections: [
    {
      heading: "Basic Usage",
      body: `**print()** is the most-used function in Python. It writes output to the terminal (stdout by default). You can pass any number of values, and Python will convert them to strings automatically.`,
      code: `# Print a single value
print("Hello, world!")

# Print a number (converted to string automatically)
print(42)
print(3.14)

# Print multiple values — separated by a space by default
print("Name:", "Alice")
print("Age:", 30, "City:", "London")
# Output: Age: 30 City: London

# Print a variable
name = "Alice"
print(name)          # Alice

# Print nothing — outputs a blank line
print()`,
    },
    {
      heading: "sep and end Parameters",
      body: `**sep** controls what goes between multiple values (default is a space). **end** controls what gets appended at the end of the output (default is a newline \`\\\\n\`).`,
      code: `# sep — custom separator between values
print("2024", "01", "15", sep="-")       # 2024-01-15
print("a", "b", "c", sep=", ")          # a, b, c
print("a", "b", "c", sep="")            # abc  (no separator)

# end — custom ending instead of newline
print("Loading", end="")
print("...", end="")
print(" done")
# Output (all on one line): Loading... done

# Progress dots without newlines
for i in range(5):
    print(".", end="", flush=True)
print()   # move to next line at the end

# Print a table with tab separators
print("Name",  "Age",  "City",    sep="\\t")
print("Alice", 30,     "London",  sep="\\t")
print("Bob",   25,     "Paris",   sep="\\t")`,
    },
    {
      heading: "f-strings — The Best Way to Format Output",
      body: `**f-strings** (formatted string literals) are the modern, readable way to embed variables and expressions inside strings. Prefix the string with \`f\` and use \`{}\` to insert values.`,
      code: `name  = "Alice"
age   = 30
score = 95.678

# f-string — embed variables directly
print(f"Hello, {name}!")
print(f"{name} is {age} years old")

# Expressions inside {}
print(f"Next year she'll be {age + 1}")
print(f"Uppercase: {name.upper()}")

# Number formatting
print(f"Score: {score:.2f}")      # 2 decimal places → 95.68
print(f"Score: {score:.0f}")      # 0 decimal places → 96
print(f"Pi: {3.14159265:.4f}")    # → 3.1416

# Integer formatting
n = 1000000
print(f"Population: {n:,}")       # thousands separator → 1,000,000
print(f"Hex: {255:#x}")           # → 0xff
print(f"Binary: {8:08b}")         # zero-padded binary → 00001000

# Padding and alignment
print(f"{'left':<10}|")           # left-align in 10 chars  → left      |
print(f"{'right':>10}|")          # right-align             →      right|
print(f"{'center':^10}|")         # center                  →   center  |`,
    },
    {
      heading: "Printing Different Types",
      body: `print() converts everything to a string using the object's \`__str__\` method. You can print any Python object — lists, dicts, booleans, None — and Python handles the conversion.`,
      code: `# Built-in types
print(True)                        # True
print(None)                        # None
print([1, 2, 3])                   # [1, 2, 3]
print({"a": 1, "b": 2})           # {'a': 1, 'b': 2}
print((1, 2, 3))                   # (1, 2, 3)

# Pretty-print complex structures
import pprint
data = {"users": [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]}
pprint.pprint(data)
# {'users': [{'age': 30, 'name': 'Alice'},
#            {'age': 25, 'name': 'Bob'}]}

# str() vs repr()
# str()  → human-readable (what print uses)
# repr() → unambiguous, shows quotes and escapes
s = "hello\\nworld"
print(str(s))    # hello
                 # world   (newline interpreted)
print(repr(s))   # 'hello\\nworld'  (shows the escape)`,
    },
    {
      heading: "file and flush Parameters",
      body: `By default print() writes to **stdout**. The \`file\` parameter redirects output. The \`flush\` parameter forces the output buffer to flush immediately — important for real-time progress displays.`,
      code: `import sys

# Print to stderr (errors and diagnostics)
print("Something went wrong", file=sys.stderr)

# Print to a file
with open("output.txt", "w") as f:
    print("Line 1", file=f)
    print("Line 2", file=f)
    print("Name:", "Alice", sep=": ", file=f)

# flush=True — force immediate output (useful for progress bars)
import time
for i in range(1, 6):
    print(f"\\rProcessing: {i}/5", end="", flush=True)
    time.sleep(0.3)
print()   # final newline

# Without flush=True, output may be buffered and appear all at once
# (especially when piping output to another process)`,
    },
  ],
  starterCode: `# Experiment with print()

name  = "Alice"
score = 97.456
items = ["apple", "banana", "cherry"]

# Basic print
print("Hello, world!")

# f-string formatting
print(f"{name} scored {score:.1f}")

# sep and end
print("a", "b", "c", sep=" | ")
print("no newline here", end=" — ")
print("same line!")

# Print a list
print(items)

# Loop with custom end
for fruit in items:
    print(fruit, end="  ")
print()   # newline at end

# Your turn: print a formatted table of numbers 1-5
# showing their square and cube
print(f"\\n{'n':>3}  {'n²':>6}  {'n³':>8}")
print("-" * 20)
for n in range(1, 6):
    print(f"{n:>3}  {n**2:>6}  {n**3:>8}")
`,
};
