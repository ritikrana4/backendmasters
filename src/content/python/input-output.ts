export const content = {
  title: "Input & Output",
  sections: [
    {
      heading: "Output with print()",
      body: `**print()** writes values to the terminal. You can pass any number of arguments — Python converts them to strings automatically. Two key parameters control the format: **sep** (what goes between values, default space) and **end** (what goes at the end, default newline).`,
      code: `# Single value
print("Hello, world!")
print(42)
print(3.14)

# Multiple values — joined by sep (default: space)
print("Name:", "Alice")              # Name: Alice
print("a", "b", "c")                # a b c
print("a", "b", "c", sep="-")       # a-b-c
print("a", "b", "c", sep="")        # abc

# end — what to print at the end (default: newline)
print("Loading", end="")
print("...", end=" ")
print("done!")
# Output (one line): Loading... done!

# Print a blank line
print()`,
    },
    {
      heading: "Formatting Output with f-strings",
      body: `**f-strings** are the modern way to embed variables and expressions inside strings. Prefix the string with \`f\` and put any expression inside \`{}\`. They also support number formatting, alignment, and padding.`,
      code: `name  = "Alice"
age   = 30
score = 97.456

# Embed variables
print(f"Hello, {name}!")                  # Hello, Alice!
print(f"{name} is {age} years old")

# Expressions inside {}
print(f"Next year: {age + 1}")
print(f"Uppercase: {name.upper()}")

# Number formatting  →  {value:.Nf}  means N decimal places
print(f"Score: {score:.2f}")              # 97.46
print(f"Score: {score:.0f}")              # 97

# Thousands separator
population = 1_000_000
print(f"Population: {population:,}")      # 1,000,000

# Alignment and padding
#   < left   > right   ^ centre
print(f"{'left':<10}|")                   # left      |
print(f"{'right':>10}|")                  #      right|
print(f"{'centre':^10}|")                 #   centre  |

# Zero-padding numbers
print(f"Hour: {7:02d}:{5:02d}")           # Hour: 07:05`,
    },
    {
      heading: "Reading Input with input()",
      body: `**input()** pauses the program and waits for the user to type something and press Enter. It always returns a **string** — even if the user typed a number. The optional argument is the prompt shown to the user.`,
      code: `# Basic input — always returns a string
name = input("What is your name? ")
print(f"Hello, {name}!")

# input() with no prompt (silent wait)
value = input()

# The returned value is ALWAYS a string
response = input("Enter a number: ")
print(type(response))   # <class 'str'>  ← not int, not float

# So "5" + "3" would give "53", not 8
print(response + "3")   # "53"  (string concatenation!)`,
    },
    {
      heading: "Converting Input to Numbers",
      body: `Since **input()** always returns a string, you must convert it when you need a number. Wrap with **int()** for whole numbers or **float()** for decimals. If the user enters something non-numeric, this raises a **ValueError** — handle it with try/except.`,
      code: `# Convert to integer
age = int(input("Enter your age: "))
print(f"In 10 years you'll be {age + 10}")

# Convert to float
price = float(input("Enter price: "))
tax   = price * 0.18
print(f"Price with tax: {price + tax:.2f}")

# Safe conversion — handle bad input
try:
    number = int(input("Enter a whole number: "))
    print(f"Double: {number * 2}")
except ValueError:
    print("That wasn't a valid number!")

# One-liner: read and convert in one step
x = float(input("Enter x: "))

# Multiple inputs on one line — split by spaces
# User types: 10 20 30
numbers = input("Enter three numbers: ").split()
a, b, c = int(numbers[0]), int(numbers[1]), int(numbers[2])
print(f"Sum: {a + b + c}")

# Shorter with map()
a, b, c = map(int, input("Enter three numbers: ").split())
print(f"Sum: {a + b + c}")`,
    },
    {
      heading: "Putting It Together — Interactive Programs",
      body: `Combining **input()** and **print()** lets you build interactive programs. A common pattern is a loop that keeps asking until the user provides valid input.`,
      code: `# Simple calculator
print("=== Simple Calculator ===")

a = float(input("Enter first number:  "))
b = float(input("Enter second number: "))
op = input("Operation (+, -, *, /):  ")

if op == "+":
    result = a + b
elif op == "-":
    result = a - b
elif op == "*":
    result = a * b
elif op == "/" and b != 0:
    result = a / b
else:
    print("Invalid operation or division by zero")
    result = None

if result is not None:
    print(f"Result: {a} {op} {b} = {result}")

# -------------------------------------------------
# Loop until valid input
while True:
    raw = input("Enter a positive number: ")
    try:
        n = float(raw)
        if n > 0:
            break
        print("Must be positive, try again.")
    except ValueError:
        print("Not a number, try again.")

print(f"You entered: {n}")`,
    },
  ],
  starterCode: `# Input & Output practice

# 1. Ask for the user's name and age
name = input("What is your name? ")
age  = int(input("How old are you? "))

print(f"\\nHello, {name}!")
print(f"You are {age} years old.")
print(f"In 5 years you will be {age + 5}.")

# 2. Simple tip calculator
print("\\n--- Tip Calculator ---")
bill = float(input("Bill amount: $"))
tip_pct = float(input("Tip percentage: "))

tip   = bill * (tip_pct / 100)
total = bill + tip

print(f"Tip:   \${tip:.2f}")
print(f"Total: \${total:.2f}")
`,
};
