export const content = {
  title: "Strings",
  sections: [
    {
      heading: "String Basics",
      body: `Strings are sequences of characters. In Python, they're immutable — you can't change a character in place, but you can build new strings. Strings support indexing and slicing just like lists.`,
      code: `s = "Hello, World!"

print(s[0])       # H
print(s[-1])      # !
print(s[7:12])    # World
print(s[:5])      # Hello
print(s[::-1])    # !dlroW ,olleH  (reversed)
print(len(s))     # 13
print("World" in s)   # True`,
    },
    {
      heading: "f-Strings (Formatted String Literals)",
      body: `f-strings (prefix \`f\`) are the modern way to embed expressions inside strings. Any valid Python expression goes inside \`{}\`. You can also control formatting with format specs after a \`:\`.`,
      code: `name = "Alice"
age = 30
balance = 1234.567

# Basic interpolation
print(f"Name: {name}, Age: {age}")

# Expressions inside {}
print(f"Next year: {age + 1}")
print(f"Uppercase: {name.upper()}")

# Format specs
print(f"Balance: \${balance:.2f}")    # $1234.57
print(f"Padded: {name:>10}")         # '     Alice' (right-align in 10 chars)
print(f"Percentage: {0.875:.1%}")    # 87.5%`,
    },
    {
      heading: "Essential String Methods",
      body: `Python strings come with a rich set of built-in methods. These are the ones you'll use most often:`,
      items: [
        "`upper()` / `lower()` — change case",
        "`strip()` / `lstrip()` / `rstrip()` — remove whitespace (or specified chars)",
        "`split(sep)` — split into a list by separator",
        "`join(iterable)` — join a list of strings with this string as separator",
        "`replace(old, new)` — replace all occurrences",
        "`startswith(s)` / `endswith(s)` — check prefix or suffix",
        "`find(s)` — return index of first occurrence, or -1 if not found",
        "`count(s)` — count non-overlapping occurrences",
        "`strip()` + `split()` — the classic one-two for parsing input",
      ],
      code: `text = "  Hello, Python World!  "

print(text.strip())                      # "Hello, Python World!"
print(text.strip().lower())             # "hello, python world!"
print(text.strip().split(", "))         # ['Hello', 'Python World!']
print(text.strip().replace("Python", "Amazing Python"))

words = ["one", "two", "three"]
print(", ".join(words))    # one, two, three
print("-".join(words))     # one-two-three`,
    },
    {
      heading: "String Checking Methods",
      body: `Python has a whole family of \`is\`-prefixed methods that return \`True\` or \`False\` based on the string's content. Useful for validation.`,
      code: `print("hello".isalpha())     # True  — all letters
print("hello123".isalpha())  # False
print("12345".isdigit())     # True  — all digits
print("hello ".isspace())    # False
print("Hello".istitle())     # True  — title case
print("HELLO".isupper())     # True
print("hello".islower())     # True

# Practical: validate a username
username = "user_42"
is_valid = username.replace("_", "").isalnum()
print(f"'{username}' is valid: {is_valid}")   # True`,
    },
    {
      heading: "Multiline Strings and Raw Strings",
      body: `Triple quotes (\`\"\"\"...\"\"\"\` or \`'''...'''\`) create strings that span multiple lines. Raw strings (\`r\"...\"\`) treat backslashes as literal characters — essential for file paths and regular expressions.`,
      code: `# Multiline string
message = """
Dear Alice,

Thank you for your order.
Your package ships today.

Regards,
The Team
"""
print(message.strip())

# Raw string — backslashes are literal
path = r"C:\\Users\\Alice\\Documents"
print(path)    # C:\\Users\\Alice\\Documents

import re
pattern = r"\\d+"    # matches one or more digits
print(bool(re.search(pattern, "order123")))   # True`,
    },
  ],
  starterCode: `# Strings practice

sentence = "the quick brown fox jumps over the lazy dog"

# 1. Title case
print(sentence.title())

# 2. Word count
words = sentence.split()
print(f"Words: {len(words)}")

# 3. Count a letter
letter = "o"
print(f"Letter '{letter}' appears {sentence.count(letter)} times")

# 4. Reverse the sentence word by word
reversed_sentence = " ".join(words[::-1])
print(reversed_sentence)

# 5. f-string report
unique_chars = len(set(sentence.replace(" ", "")))
print(f"The sentence has {len(words)} words and {unique_chars} unique characters.")
`,
};
