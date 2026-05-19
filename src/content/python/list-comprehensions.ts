export const content = {
  title: "List Comprehensions",
  sections: [
    {
      heading: "The Basic Pattern",
      body: `A list comprehension builds a new list by applying an expression to each item in an iterable — all in one line. The pattern is \`[expression for item in iterable]\`. It's faster than an equivalent \`for\` loop and, once familiar, much more readable.`,
      code: `# The long way
squares = []
for n in range(1, 6):
    squares.append(n ** 2)
print(squares)   # [1, 4, 9, 16, 25]

# List comprehension — same result, one line
squares = [n ** 2 for n in range(1, 6)]
print(squares)   # [1, 4, 9, 16, 25]

# Works on any iterable
words = ["hello", "world", "python"]
upper = [w.upper() for w in words]
print(upper)     # ['HELLO', 'WORLD', 'PYTHON']`,
    },
    {
      heading: "Adding a Condition (Filtering)",
      body: `Add an \`if\` clause at the end to filter items. Only items where the condition is \`True\` are included in the result. This replaces the pattern of appending inside an \`if\` block.`,
      code: `nums = range(1, 21)

# Even numbers only
evens = [n for n in nums if n % 2 == 0]
print(evens)   # [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

# Strings longer than 4 chars
words = ["cat", "elephant", "dog", "butterfly", "ox"]
long_words = [w for w in words if len(w) > 4]
print(long_words)   # ['elephant', 'butterfly']

# Combine: squares of odd numbers
odd_squares = [n**2 for n in range(1, 11) if n % 2 != 0]
print(odd_squares)  # [1, 9, 25, 49, 81]`,
    },
    {
      heading: "if/else in the Expression",
      body: `You can also use a ternary \`if/else\` in the **expression part** (before \`for\`) to transform items rather than filter them. This is subtly different — every item is included, just with different values.`,
      code: `nums = range(1, 11)

# Replace even numbers with "even", odd with "odd"
labels = ["even" if n % 2 == 0 else "odd" for n in nums]
print(labels)
# ['odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even']

# Clamp values to a max of 5
raw = [1, 3, 7, 2, 9, 4, 6]
clamped = [min(x, 5) for x in raw]
print(clamped)   # [1, 3, 5, 2, 5, 4, 5]`,
    },
    {
      heading: "Dict and Set Comprehensions",
      body: `The same syntax works for dicts (\`{key: value for ...}\`) and sets (\`{expression for ...}\`). Dict comprehensions are especially useful for inverting a mapping or transforming key-value pairs.`,
      code: `# Set comprehension — unique vowels in a string
text = "hello world"
vowels = {c for c in text if c in "aeiou"}
print(vowels)   # {'e', 'o'}  (order may vary)

# Dict comprehension — word lengths
words = ["python", "go", "rust", "java"]
lengths = {w: len(w) for w in words}
print(lengths)  # {'python': 6, 'go': 2, 'rust': 4, 'java': 4}

# Invert a dictionary
original = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in original.items()}
print(inverted)  # {1: 'a', 2: 'b', 3: 'c'}`,
    },
    {
      heading: "Nested Comprehensions",
      body: `Comprehensions can nest — the inner \`for\` runs for every item from the outer \`for\`. Use this for flattening nested lists or working with 2D data. Keep it to at most two levels; deeper nesting is harder to read than a regular loop.`,
      code: `# Flatten a 2D list
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
print(flat)   # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# All pairs (i, j) where i != j
pairs = [(i, j) for i in range(1, 4) for j in range(1, 4) if i != j]
print(pairs)
# [(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]`,
    },
  ],
  starterCode: `# List Comprehensions practice

# 1. Celsius to Fahrenheit for a list of temperatures
celsius = [0, 20, 37, 100]
fahrenheit = [round((c * 9 / 5) + 32, 1) for c in celsius]
print("Fahrenheit:", fahrenheit)

# 2. Extract names starting with a vowel
names = ["Alice", "Bob", "Eve", "Oscar", "Ivan", "Tom"]
vowel_names = [n for n in names if n[0].lower() in "aeiou"]
print("Vowel names:", vowel_names)

# 3. Build a multiplication table as a dict
table = {f"{a}x{b}": a * b for a in range(1, 4) for b in range(1, 4)}
for expr, result in table.items():
    print(f"  {expr} = {result}")
`,
};
