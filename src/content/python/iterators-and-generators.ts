export const content = {
  title: "Iterators & Generators",
  sections: [
    {
      heading: "The Iteration Protocol",
      body: `Anything you can loop over in Python is an **iterable**. Under the hood, a \`for\` loop calls \`iter(obj)\` to get an **iterator**, then calls \`next()\` on it repeatedly until \`StopIteration\` is raised. You can do this manually to see exactly what's happening.`,
      code: `numbers = [10, 20, 30]

# What a for loop actually does:
it = iter(numbers)
print(next(it))   # 10
print(next(it))   # 20
print(next(it))   # 30
# next(it)  ← raises StopIteration

# Strings, dicts, files are all iterables
for char in iter("hello"):
    print(char, end=" ")   # h e l l o`,
    },
    {
      heading: "Building a Custom Iterator",
      body: `Any class with \`__iter__\` (returns self) and \`__next__\` (returns next value or raises \`StopIteration\`) is an iterator. This is useful when you need stateful iteration over a custom data structure.`,
      code: `class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

for n in Countdown(5):
    print(n, end=" ")   # 5 4 3 2 1`,
    },
    {
      heading: "Generators with yield",
      body: `A **generator function** uses \`yield\` instead of \`return\`. Calling it returns a generator object — a lazy iterator that produces one value at a time, pausing at each \`yield\`. This is far simpler than writing a full iterator class.`,
      code: `def countdown(start):
    while start > 0:
        yield start
        start -= 1

for n in countdown(5):
    print(n, end=" ")   # 5 4 3 2 1

# Generators are lazy — values computed on demand
def infinite_counter(start=0):
    n = start
    while True:
        yield n
        n += 1

counter = infinite_counter(10)
print(next(counter))   # 10
print(next(counter))   # 11
print(next(counter))   # 12`,
    },
    {
      heading: "Why Generators Save Memory",
      body: `A regular function builds the entire list in memory before returning. A generator produces one item at a time — the rest doesn't exist yet. This makes generators ideal for large datasets, files, or infinite sequences.`,
      code: `import sys

# List — all 1 million numbers in memory at once
def squares_list(n):
    return [i**2 for i in range(n)]

# Generator — one number at a time
def squares_gen(n):
    for i in range(n):
        yield i**2

big_list = squares_list(1_000_000)
big_gen  = squares_gen(1_000_000)

print(f"List size:      {sys.getsizeof(big_list):,} bytes")
print(f"Generator size: {sys.getsizeof(big_gen):,} bytes")

# Both produce the same values:
print(next(iter(big_list)))   # 0
print(next(big_gen))          # 0`,
    },
    {
      heading: "Generator Expressions",
      body: `Generator expressions look like list comprehensions but with parentheses instead of brackets. They're lazy — no values are computed until iterated. Use them when you only need to iterate once and don't need to store all results.`,
      code: `# List comprehension — builds the whole list immediately
squares_list = [x**2 for x in range(10)]

# Generator expression — lazy, one item at a time
squares_gen = (x**2 for x in range(10))

# Use it anywhere an iterable is expected
print(sum(x**2 for x in range(10)))   # 285
print(max(x**2 for x in range(10)))   # 81

# Chain operations lazily
data = range(1_000_000)
result = sum(x**2 for x in data if x % 2 == 0)
print(result)`,
    },
    {
      heading: "itertools — the generator toolkit",
      body: `The \`itertools\` module provides composable, lazy building blocks for working with iterators. These are all memory-efficient and can handle infinite sequences.`,
      code: `import itertools

# islice — take first n items from any iterable
first_5 = list(itertools.islice(range(1_000_000), 5))
print(first_5)   # [0, 1, 2, 3, 4]

# chain — join multiple iterables lazily
combined = list(itertools.chain([1, 2], [3, 4], [5]))
print(combined)  # [1, 2, 3, 4, 5]

# takewhile — take items while condition holds
nums = itertools.takewhile(lambda x: x < 5, range(10))
print(list(nums))   # [0, 1, 2, 3, 4]

# count — infinite counter
counter = itertools.count(start=1, step=2)
odds = list(itertools.islice(counter, 5))
print(odds)   # [1, 3, 5, 7, 9]`,
    },
  ],
  starterCode: `# Iterators & Generators practice

def fibonacci():
    """Infinite Fibonacci generator."""
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def take(n, gen):
    """Take first n values from a generator."""
    for _ in range(n):
        yield next(gen)

# First 10 Fibonacci numbers
fib = fibonacci()
first_10 = list(take(10, fib))
print("Fibonacci:", first_10)

# Sum of first 20 Fibonacci numbers
fib2 = fibonacci()
total = sum(take(20, fib2))
print(f"Sum of first 20: {total}")

# First Fibonacci number over 1000
fib3 = fibonacci()
big = next(n for n in fib3 if n > 1000)
print(f"First Fibonacci > 1000: {big}")
`,
};
