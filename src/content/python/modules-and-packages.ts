export const content = {
  title: "Modules & Packages",
  sections: [
    {
      heading: "Importing Modules",
      body: `A module is any Python file. Python ships with a huge **standard library** of ready-to-use modules. Import one with \`import module_name\` and access its contents with dot notation. Use \`from module import name\` to import a specific name directly.`,
      code: `import math

print(math.pi)           # 3.141592653589793
print(math.sqrt(144))    # 12.0
print(math.floor(3.7))   # 3
print(math.ceil(3.2))    # 4

# Import specific names
from math import factorial, gcd

print(factorial(6))    # 720
print(gcd(48, 18))     # 6`,
    },
    {
      heading: "The random Module",
      body: `The \`random\` module provides random number generation, shuffling, and sampling. Useful for games, simulations, and testing.`,
      code: `import random

# Random float in [0, 1)
print(random.random())

# Random integer in [a, b] inclusive
print(random.randint(1, 6))   # dice roll

# Random choice from a sequence
colours = ["red", "green", "blue", "yellow"]
print(random.choice(colours))

# Shuffle a list in place
deck = list(range(1, 11))
random.shuffle(deck)
print(deck)

# Sample k unique items without replacement
print(random.sample(range(100), 5))`,
    },
    {
      heading: "The datetime Module",
      body: `\`datetime\` gives you tools for working with dates and times. The two most-used classes are \`datetime.date\` and \`datetime.datetime\`.`,
      code: `from datetime import date, datetime, timedelta

today = date.today()
print(today)                      # 2026-05-18 (for example)
print(today.strftime("%B %d, %Y"))  # May 18, 2026

now = datetime.now()
print(now.strftime("%H:%M:%S"))   # current time

# Arithmetic with timedelta
deadline = today + timedelta(days=30)
print(f"Deadline: {deadline}")

diff = deadline - today
print(f"Days until deadline: {diff.days}")`,
    },
    {
      heading: "The os and sys Modules",
      body: `\`os\` gives you operating-system level tools — file paths, environment variables, directory listing. \`sys\` exposes the Python interpreter itself — version info, the module search path, and standard streams.`,
      code: `import os
import sys

# Python version
print(sys.version)

# Current working directory
print(os.getcwd())

# Environment variables
path = os.environ.get("PATH", "not set")
print(f"PATH starts with: {path[:40]}...")

# Path joining (OS-independent)
home = os.path.expanduser("~")
docs = os.path.join(home, "Documents")
print(docs)

# Check if a path exists
print(os.path.exists(home))   # True`,
    },
    {
      heading: "The __name__ Guard",
      body: `When Python runs a file directly, it sets \`__name__\` to \`"__main__"\`. When the file is imported as a module, \`__name__\` is the module's filename. The \`if __name__ == "__main__":\` guard lets you write code that only runs when the file is executed directly — not when it's imported.`,
      code: `# utils.py
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

if __name__ == "__main__":
    # This block only runs when you run 'python utils.py' directly.
    # It is NOT executed when another file does 'import utils'.
    print("Running utils.py directly:")
    print(add(3, 4))
    print(multiply(3, 4))

# In the browser REPL, __name__ is '__main__', so this always runs:
print(f"Module name: {__name__}")`,
    },
    {
      heading: "Useful Standard Library Highlights",
      body: `Beyond what we've covered, these stdlib modules are worth knowing about:`,
      items: [
        "`collections` — `Counter`, `defaultdict`, `deque`, `namedtuple`",
        "`itertools` — `chain`, `product`, `combinations`, `permutations`, `islice`",
        "`functools` — `reduce`, `partial`, `lru_cache` (memoisation)",
        "`pathlib` — modern, object-oriented file path manipulation",
        "`json` — encode/decode JSON with `json.dumps()` and `json.loads()`",
        "`re` — regular expressions",
        "`typing` — type hints: `List`, `Dict`, `Optional`, `Union`",
      ],
      code: `from collections import Counter, defaultdict
import json

# Counter — count occurrences automatically
words = "to be or not to be that is the question".split()
freq = Counter(words)
print(freq.most_common(3))   # [('be', 2), ('to', 2), ('or', 1)]

# defaultdict — no KeyError on missing keys
groups = defaultdict(list)
for word in words:
    groups[len(word)].append(word)
print(dict(groups))

# json
data = {"name": "Alice", "scores": [95, 87, 91]}
json_str = json.dumps(data, indent=2)
print(json_str)
back = json.loads(json_str)
print(back["name"])   # Alice`,
    },
  ],
  starterCode: `# Modules & Packages practice
import math
import random
from collections import Counter
from datetime import date, timedelta

# 1. Statistics without importing statistics module
numbers = [random.randint(1, 100) for _ in range(20)]
numbers.sort()

mean = sum(numbers) / len(numbers)
median = (numbers[9] + numbers[10]) / 2   # average of two middle values
print(f"Numbers: {numbers}")
print(f"Mean: {mean:.1f}, Median: {median:.1f}")
print(f"Min: {min(numbers)}, Max: {max(numbers)}")

# 2. Days until next New Year
today = date.today()
next_ny = date(today.year + 1, 1, 1)
days_left = (next_ny - today).days
print(f"\\nDays until {next_ny}: {days_left}")

# 3. Most common digits in pi
pi_digits = str(math.pi).replace(".", "")
freq = Counter(pi_digits)
print(f"\\nDigit frequency in pi: {freq.most_common()}")
`,
};
