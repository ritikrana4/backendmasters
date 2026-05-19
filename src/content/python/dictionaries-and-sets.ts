export const content = {
  title: "Dictionaries & Sets",
  sections: [
    {
      heading: "Creating Dictionaries",
      body: `A dictionary maps **keys** to **values**. Create one with curly braces \`{}\` using \`key: value\` pairs. Keys must be unique and immutable (strings, numbers, tuples). Values can be anything. Access a value with \`dict[key]\`.`,
      code: `person = {
    "name": "Alice",
    "age": 30,
    "city": "London"
}

print(person["name"])   # Alice
print(person["age"])    # 30

# Add or update a key
person["email"] = "alice@example.com"
person["age"] = 31
print(person)`,
    },
    {
      heading: "Safe Access and Common Methods",
      body: `Use \`dict.get(key)\` instead of \`dict[key]\` when the key might not exist — it returns \`None\` (or a default) instead of raising a \`KeyError\`. Other essential methods:`,
      items: [
        "`get(key, default)` — safe access; returns default if key missing",
        "`keys()` — view of all keys",
        "`values()` — view of all values",
        "`items()` — view of (key, value) pairs — great for looping",
        "`update({...})` — merge another dict in",
        "`pop(key)` — remove and return a value",
        "`key in dict` — check membership",
      ],
      code: `config = {"host": "localhost", "port": 5432}

print(config.get("host"))           # localhost
print(config.get("password"))       # None
print(config.get("password", ""))   # ""  (default)

for key, value in config.items():
    print(f"{key} = {value}")

config.update({"port": 5433, "dbname": "mydb"})
print(config)`,
    },
    {
      heading: "Dictionary Patterns",
      body: `Dictionaries are incredibly versatile. Here are patterns you'll reach for constantly: counting occurrences, grouping data, and building lookup tables.`,
      code: `# Counting word frequency
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
freq = {}
for word in words:
    freq[word] = freq.get(word, 0) + 1
print(freq)   # {'apple': 3, 'banana': 2, 'cherry': 1}

# Lookup table
http_codes = {200: "OK", 404: "Not Found", 500: "Server Error"}
print(http_codes.get(404, "Unknown"))   # Not Found`,
    },
    {
      heading: "Sets",
      body: `A set is an **unordered collection of unique items**. Sets are perfect for membership testing (much faster than lists), deduplication, and mathematical set operations. Create one with \`{}\` or \`set()\`.`,
      code: `# Deduplication
nums = [1, 2, 2, 3, 3, 3, 4]
unique = set(nums)
print(unique)        # {1, 2, 3, 4}

tags = {"python", "coding", "python", "tutorial"}
print(tags)          # {'python', 'coding', 'tutorial'}

# Membership — O(1) lookup, much faster than lists
print("python" in tags)   # True
print("java" in tags)     # False`,
    },
    {
      heading: "Set Operations",
      body: `Sets support all the classic mathematical operations: union, intersection, difference, and symmetric difference. These are enormously useful when comparing datasets.`,
      code: `backend = {"Python", "Go", "SQL"}
frontend = {"JavaScript", "TypeScript", "Python"}

# Union — all skills from either
print(backend | frontend)
# {'Python', 'Go', 'SQL', 'JavaScript', 'TypeScript'}

# Intersection — skills in BOTH
print(backend & frontend)
# {'Python'}

# Difference — in backend but NOT frontend
print(backend - frontend)
# {'Go', 'SQL'}

# Symmetric difference — in one but NOT both
print(backend ^ frontend)
# {'Go', 'SQL', 'JavaScript', 'TypeScript'}`,
    },
  ],
  starterCode: `# Dictionaries & Sets practice

inventory = {
    "apples": 50,
    "bananas": 30,
    "oranges": 0,
    "grapes": 15,
}

# Items in stock (value > 0)
in_stock = {item for item, qty in inventory.items() if qty > 0}
print("In stock:", in_stock)

# Total items
total = sum(inventory.values())
print("Total items:", total)

# Update stock: receive a delivery
delivery = {"bananas": 20, "oranges": 40, "mangoes": 25}
for item, qty in delivery.items():
    inventory[item] = inventory.get(item, 0) + qty

print("\\nUpdated inventory:")
for item, qty in sorted(inventory.items()):
    print(f"  {item}: {qty}")
`,
};
