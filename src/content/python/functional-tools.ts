export const content = {
  title: "Functional Tools",
  sections: [
    {
      heading: "enumerate — loop with an index",
      body: `\`enumerate(iterable)\` wraps any iterable and yields \`(index, value)\` pairs. This eliminates the pattern of manually tracking a counter variable, and is cleaner than \`range(len(...))\`.`,
      code: `fruits = ["apple", "banana", "cherry"]

# Without enumerate (verbose)
# for i in range(len(fruits)):
#     print(i, fruits[i])

# With enumerate
for i, fruit in enumerate(fruits):
    print(i, fruit)

# Start counting from 1
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")`,
    },
    {
      heading: "zip — iterate multiple sequences together",
      body: `\`zip(a, b, ...)\` pairs up items from multiple iterables, stopping at the shortest one. Use it to combine two lists element-wise, or to unpack rows from a column-oriented data structure.`,
      code: `names = ["Alice", "Bob", "Charlie"]
scores = [92, 85, 78]
grades = ["A", "B", "C"]

for name, score, grade in zip(names, scores, grades):
    print(f"{name}: {score} ({grade})")

# Unzip (transpose)
pairs = [(1, "a"), (2, "b"), (3, "c")]
numbers, letters = zip(*pairs)
print(numbers)   # (1, 2, 3)
print(letters)   # ('a', 'b', 'c')`,
    },
    {
      heading: "map — transform every item",
      body: `\`map(fn, iterable)\` applies a function to every item and returns a lazy iterator. It's the functional equivalent of a list comprehension without filtering. Wrap in \`list()\` to materialise the result.`,
      code: `numbers = [1, 4, 9, 16, 25]

# Apply math.sqrt to every item
import math
roots = list(map(math.sqrt, numbers))
print(roots)   # [1.0, 2.0, 3.0, 4.0, 5.0]

# With lambda
doubled = list(map(lambda x: x * 2, numbers))
print(doubled)   # [2, 8, 18, 32, 50]

# map over two iterables at once
a = [1, 2, 3]
b = [10, 20, 30]
sums = list(map(lambda x, y: x + y, a, b))
print(sums)   # [11, 22, 33]`,
    },
    {
      heading: "filter — keep items matching a condition",
      body: `\`filter(fn, iterable)\` keeps only items for which \`fn\` returns \`True\`. Like \`map\`, it returns a lazy iterator. Passing \`None\` as the function keeps only truthy items.`,
      code: `numbers = range(-5, 6)

positives = list(filter(lambda x: x > 0, numbers))
print(positives)   # [1, 2, 3, 4, 5]

words = ["hello", "", "world", "", "python"]
non_empty = list(filter(None, words))
print(non_empty)   # ['hello', 'world', 'python']

# filter + map together
evens_squared = list(map(
    lambda x: x**2,
    filter(lambda x: x % 2 == 0, range(1, 11))
))
print(evens_squared)   # [4, 16, 36, 64, 100]`,
    },
    {
      heading: "sorted with key — custom sort order",
      body: `\`sorted(iterable, key=fn)\` sorts by the return value of \`key\` rather than the item itself. The \`key\` function is called once per item, making it efficient. Add \`reverse=True\` for descending order.`,
      code: `words = ["banana", "Apple", "cherry", "date"]

# Case-insensitive sort
print(sorted(words, key=str.lower))
# ['Apple', 'banana', 'cherry', 'date']

# Sort by length
print(sorted(words, key=len))
# ['date', 'Apple', 'banana', 'cherry']

# Sort complex objects
people = [
    {"name": "Charlie", "age": 35},
    {"name": "Alice",   "age": 30},
    {"name": "Bob",     "age": 25},
]
by_age = sorted(people, key=lambda p: p["age"])
for p in by_age:
    print(p["name"], p["age"])`,
    },
    {
      heading: "reduce — fold a sequence into one value",
      body: `\`functools.reduce(fn, iterable)\` applies a two-argument function cumulatively to all items, reducing the sequence to a single value. Classic use cases: product of a list, finding the maximum manually, building a string.`,
      code: `from functools import reduce

nums = [1, 2, 3, 4, 5]

total = reduce(lambda acc, x: acc + x, nums)
print(total)   # 15

product = reduce(lambda acc, x: acc * x, nums)
print(product) # 120

# Flatten a list of lists
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(lambda acc, x: acc + x, nested)
print(flat)    # [1, 2, 3, 4, 5, 6]`,
    },
  ],
  starterCode: `# Functional Tools practice
from functools import reduce

students = [
    {"name": "Alice",   "grade": 88},
    {"name": "Bob",     "grade": 72},
    {"name": "Charlie", "grade": 95},
    {"name": "Diana",   "grade": 61},
    {"name": "Eve",     "grade": 84},
]

# 1. Passing students (grade >= 75) sorted by grade descending
passing = sorted(
    filter(lambda s: s["grade"] >= 75, students),
    key=lambda s: s["grade"],
    reverse=True,
)
print("Passing students:")
for rank, s in enumerate(passing, 1):
    print(f"  {rank}. {s['name']}: {s['grade']}")

# 2. Class average using reduce
total = reduce(lambda acc, s: acc + s["grade"], students, 0)
avg = total / len(students)
print(f"\\nClass average: {avg:.1f}")

# 3. Numbered roll call with enumerate + zip
print("\\nRoll call:")
for i, s in enumerate(students, 1):
    print(f"  {i:02d}. {s['name']}")
`,
};
