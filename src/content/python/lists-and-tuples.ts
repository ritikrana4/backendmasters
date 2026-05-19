export const content = {
  title: "Lists & Tuples",
  sections: [
    {
      heading: "Creating Lists",
      body: `A list is an ordered, mutable collection. Create one with square brackets \`[]\`. Lists can hold any mix of types, including other lists. Access elements by index — indices start at \`0\`, and \`-1\` is the last element.`,
      code: `fruits = ["apple", "banana", "cherry"]
print(fruits[0])    # apple
print(fruits[-1])   # cherry
print(fruits[1])    # banana

mixed = [42, "hello", 3.14, True]
print(mixed)`,
    },
    {
      heading: "Slicing",
      body: `Slicing extracts a sub-list using \`list[start:stop:step]\`. \`start\` is inclusive, \`stop\` is exclusive. Omitting either uses the beginning or end of the list.`,
      code: `nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(nums[2:5])    # [2, 3, 4]
print(nums[:4])     # [0, 1, 2, 3]
print(nums[6:])     # [6, 7, 8, 9]
print(nums[::2])    # [0, 2, 4, 6, 8]  every second element
print(nums[::-1])   # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]  reversed`,
    },
    {
      heading: "Common List Methods",
      body: `Lists have many built-in methods. These are the ones you'll use most:`,
      items: [
        "`append(x)` — add x to the end",
        "`extend([x, y])` — add all items from another iterable",
        "`insert(i, x)` — insert x at position i",
        "`remove(x)` — remove first occurrence of x (raises ValueError if not found)",
        "`pop(i)` — remove and return item at index i (default: last item)",
        "`sort()` — sort in place; `sorted(list)` returns a new sorted list",
        "`reverse()` — reverse in place",
        "`len(list)` — number of items",
        "`x in list` — True if x is in the list",
      ],
      code: `cities = ["London", "Paris", "Tokyo"]
cities.append("New York")
cities.insert(1, "Berlin")
print(cities)          # ['London', 'Berlin', 'Paris', 'Tokyo', 'New York']

cities.remove("Paris")
last = cities.pop()
print(last)            # New York
print(cities)          # ['London', 'Berlin', 'Tokyo']

cities.sort()
print(cities)          # ['Berlin', 'London', 'Tokyo']
print("Tokyo" in cities)  # True`,
    },
    {
      heading: "Tuples",
      body: `A tuple is like a list, but **immutable** — once created, it cannot be changed. Use parentheses \`()\` (or no brackets at all for simple cases). Tuples are faster than lists and signal that the data should not change: coordinates, RGB colours, database rows.`,
      code: `point = (3, 7)
print(point[0])   # 3
print(point[1])   # 7

# Trying to change a tuple raises TypeError
# point[0] = 10   ← this would crash

rgb = (255, 128, 0)
print(f"Red: {rgb[0]}, Green: {rgb[1]}, Blue: {rgb[2]}")

# Single-element tuple needs a trailing comma
single = (42,)
print(type(single))   # <class 'tuple'>`,
    },
    {
      heading: "Unpacking",
      body: `You can unpack a list or tuple into individual variables in one line. Use \`*rest\` to capture remaining items into a new list.`,
      code: `# Unpack a tuple
x, y = (10, 20)
print(x, y)   # 10 20

# Unpack a list
first, second, third = ["a", "b", "c"]
print(first, second, third)   # a b c

# Star unpacking
head, *tail = [1, 2, 3, 4, 5]
print(head)   # 1
print(tail)   # [2, 3, 4, 5]

# Swap variables without a temp variable
a, b = 5, 10
a, b = b, a
print(a, b)   # 10 5`,
    },
  ],
  starterCode: `# Lists & Tuples practice

scores = [88, 72, 95, 61, 84, 90, 77]

# Find min, max, average
print("Min:", min(scores))
print("Max:", max(scores))
print("Average:", sum(scores) / len(scores))

# Scores above 80
high_scores = [s for s in scores if s > 80]
print("High scores:", high_scores)

# Sort descending
scores.sort(reverse=True)
print("Ranked:", scores)

# Unpack top 3
gold, silver, bronze, *rest = scores
print(f"Gold: {gold}, Silver: {silver}, Bronze: {bronze}")
`,
};
