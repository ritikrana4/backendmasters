export const content = {
  title: "Functions",
  sections: [
    {
      heading: "Defining a Function",
      body: `Use the \`def\` keyword to define a function. Give it a name, optional parameters in parentheses, and indent the body. Call it by writing its name followed by \`()\`.`,
      code: `def greet(name):
    print(f"Hello, {name}!")

greet("Alice")   # Hello, Alice!
greet("Bob")     # Hello, Bob!`,
    },
    {
      heading: "Return Values",
      body: `Functions can send a value back to the caller using \`return\`. Without \`return\`, a function returns \`None\` implicitly. You can return any type — a number, string, list, or even another function.`,
      code: `def add(a, b):
    return a + b

result = add(3, 7)
print(result)          # 10
print(add(10, 20))     # 30

def is_even(n):
    return n % 2 == 0

print(is_even(4))   # True
print(is_even(7))   # False`,
    },
    {
      heading: "Default Arguments",
      body: `Parameters can have default values. If the caller doesn't pass that argument, the default is used. Default parameters must come after non-default ones.`,
      code: `def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")               # Hello, Alice!
greet("Bob", "Good morning") # Good morning, Bob!

def power(base, exponent=2):
    return base ** exponent

print(power(3))     # 9  (3²)
print(power(2, 10)) # 1024`,
    },
    {
      heading: "*args and **kwargs",
      body: `\`*args\` collects any number of positional arguments into a tuple. \`**kwargs\` collects any number of keyword arguments into a dict. Use them when you don't know in advance how many arguments a caller will pass.`,
      code: `def total(*args):
    return sum(args)

print(total(1, 2, 3))        # 6
print(total(10, 20, 30, 40)) # 100

def describe(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

describe(name="Alice", age=30, city="London")
# name: Alice
# age: 30
# city: London`,
    },
    {
      heading: "Lambda Functions — Syntax & Basics",
      body: `A **lambda** is a small, anonymous function defined in a single expression. The syntax is \`lambda parameters: expression\` — no \`def\`, no \`return\`, no body block. The expression is evaluated and returned automatically. Lambdas are best used as short, throwaway callbacks — when writing a full \`def\` would be more noise than signal.`,
      code: `# Syntax:  lambda <params> : <expression>

# No arguments
greet = lambda: "Hello!"
print(greet())                  # Hello!

# One argument
square  = lambda x: x ** 2
double  = lambda x: x * 2
is_even = lambda x: x % 2 == 0

print(square(5))                # 25
print(double(7))                # 14
print(is_even(4))               # True

# Multiple arguments
add      = lambda a, b: a + b
multiply = lambda a, b: a * b
clamp    = lambda val, lo, hi: max(lo, min(val, hi))

print(add(3, 4))                # 7
print(multiply(6, 7))           # 42
print(clamp(15, 0, 10))         # 10  (15 clamped to max 10)

# Lambda vs def — they are equivalent
square_def    = lambda x: x ** 2
def square_fn(x):
    return x ** 2
# Both do the same thing; lambda is just more concise for simple cases`,
    },
    {
      heading: "Lambdas with sorted(), min(), max()",
      body: `The most common real-world use of lambdas is as the **key** argument to \`sorted()\`, \`min()\`, and \`max()\`. The key function is called on each item and the result is used for comparison — the original items are returned, not the key values.`,
      code: `# Sort a list of strings by length
words = ["banana", "kiwi", "apple", "fig", "cherry"]
print(sorted(words, key=lambda w: len(w)))
# ['fig', 'kiwi', 'apple', 'banana', 'cherry']

# Sort case-insensitively
names = ["charlie", "Alice", "BOB", "diana"]
print(sorted(names, key=lambda s: s.lower()))
# ['Alice', 'BOB', 'charlie', 'diana']

# Sort in reverse
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(sorted(numbers, key=lambda x: x, reverse=True))
# [9, 6, 5, 4, 3, 2, 1, 1]

# Sort list of dicts by a field
students = [
    {"name": "Alice", "grade": 88},
    {"name": "Bob",   "grade": 95},
    {"name": "Carol", "grade": 72},
]
by_grade = sorted(students, key=lambda s: s["grade"], reverse=True)
for s in by_grade:
    print(f"{s['name']}: {s['grade']}")
# Bob: 95 / Alice: 88 / Carol: 72

# min() and max() with key
prices = [("apple", 1.20), ("banana", 0.50), ("cherry", 2.00)]
cheapest  = min(prices, key=lambda item: item[1])
most_expensive = max(prices, key=lambda item: item[1])
print(f"Cheapest: {cheapest[0]}")        # Cheapest: banana
print(f"Priciest: {most_expensive[0]}")  # Priciest: cherry

# Sort by multiple fields: first by grade (desc), then name (asc)
sorted_students = sorted(
    students,
    key=lambda s: (-s["grade"], s["name"])
)`,
    },
    {
      heading: "Lambdas with filter() and map()",
      body: `**filter()** keeps only the items for which the function returns \`True\`. **map()** transforms every item by applying a function to it. Both return iterators — wrap with \`list()\` to see the results. Lambdas are a natural fit as the function argument.`,
      code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# filter() — keep items where function returns True
evens   = list(filter(lambda x: x % 2 == 0, numbers))
odds    = list(filter(lambda x: x % 2 != 0, numbers))
big     = list(filter(lambda x: x > 5, numbers))
print(evens)    # [2, 4, 6, 8, 10]
print(odds)     # [1, 3, 5, 7, 9]
print(big)      # [6, 7, 8, 9, 10]

# map() — transform every item
squares  = list(map(lambda x: x ** 2, numbers))
doubled  = list(map(lambda x: x * 2, numbers))
print(squares)  # [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
print(doubled)  # [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

# map() with two lists — applies lambda element-wise
a = [1, 2, 3, 4]
b = [10, 20, 30, 40]
products = list(map(lambda x, y: x * y, a, b))
print(products)  # [10, 40, 90, 160]

# Real-world: clean and transform a list of strings
raw = ["  Alice ", "BOB", "charlie  "]
clean = list(map(lambda s: s.strip().title(), raw))
print(clean)     # ['Alice', 'Bob', 'Charlie']

# Chaining filter + map
result = list(map(lambda x: x ** 2,
               filter(lambda x: x % 2 == 0, numbers)))
print(result)    # [4, 16, 36, 64, 100]  (squares of evens only)

# Note: list comprehensions are often more readable than map/filter
# result = [x**2 for x in numbers if x % 2 == 0]`,
    },
    {
      heading: "Docstrings",
      body: `A docstring is the first string literal in a function body. It documents what the function does, its parameters, and return value. Access it at runtime with \`help(fn)\` or \`fn.__doc__\`.`,
      code: `def divide(a, b):
    """
    Divide a by b and return the result.

    Args:
        a: The numerator.
        b: The denominator (must not be zero).

    Returns:
        The float result of a / b.
    """
    return a / b

print(divide(10, 4))   # 2.5
print(divide.__doc__)  # prints the docstring`,
    },
  ],
  starterCode: `# Functions + Lambdas practice

# --- Regular functions ---
def celsius_to_fahrenheit(c):
    return (c * 9 / 5) + 32

def average(*numbers):
    return sum(numbers) / len(numbers)

print(celsius_to_fahrenheit(100))  # 212.0
print(average(10, 20, 30, 40))     # 25.0

# --- Lambda basics ---
square  = lambda x: x ** 2
is_even = lambda x: x % 2 == 0

print(square(9))        # 81
print(is_even(6))       # True

# --- sorted() with lambda key ---
products = [
    {"name": "Laptop",  "price": 999},
    {"name": "Mouse",   "price": 25},
    {"name": "Monitor", "price": 349},
    {"name": "Keyboard","price": 79},
]

by_price = sorted(products, key=lambda p: p["price"])
for p in by_price:
    print(f"  {p['name']:<10} \${p['price']}")

# --- filter() and map() ---
numbers = list(range(1, 11))

evens   = list(filter(lambda x: x % 2 == 0, numbers))
squares = list(map(lambda x: x ** 2, numbers))

print("Evens:  ", evens)
print("Squares:", squares)

# Try it: find the most expensive product using max() + lambda
most_expensive = max(products, key=lambda p: p["price"])
print("Most expensive:", most_expensive["name"])
`,
};
