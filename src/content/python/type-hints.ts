export const content = {
  title: "Type Hints",
  sections: [
    {
      heading: "Why Type Hints?",
      body: `Python is dynamically typed — variables can hold any type. Type hints (PEP 484, Python 3.5+) let you annotate what types you expect. They are **not enforced at runtime** by Python itself, but editors (VS Code, PyCharm), type checkers (mypy, pyright), and other tools use them to catch bugs before you run the code.`,
      code: `# Without hints — unclear what types are expected
def area(width, height):
    return width * height

# With hints — self-documenting, tool-friendly
def area(width: float, height: float) -> float:
    return width * height

# Variable annotations
name: str = "Alice"
age: int = 30
scores: list[float] = [92.5, 88.0, 95.5]

print(area(5.0, 3.0))   # 15.0`,
    },
    {
      heading: "Basic Annotations",
      body: `Annotate function parameters with \`: type\` and return values with \`-> type\`. Use \`None\` as the return type for functions that don't return a value. Python 3.9+ allows built-in generics like \`list[str]\` and \`dict[str, int]\` directly — no imports needed.`,
      code: `def greet(name: str) -> str:
    return f"Hello, {name}!"

def send_email(to: str, subject: str, body: str) -> None:
    print(f"Sending to {to}: {subject}")

def first_item(items: list[int]) -> int:
    return items[0]

def lookup(data: dict[str, int], key: str) -> int:
    return data.get(key, 0)

print(greet("Alice"))
print(first_item([10, 20, 30]))
print(lookup({"a": 1, "b": 2}, "a"))`,
    },
    {
      heading: "Optional and Union",
      body: `Use \`X | None\` (Python 3.10+) or \`Optional[X]\` when a value can be the given type or \`None\`. Use \`X | Y\` (Python 3.10+) or \`Union[X, Y]\` when a value can be one of several types. \`Optional[X]\` is exactly \`Union[X, None]\`.`,
      code: `from typing import Optional, Union

# Python 3.10+ shorthand (preferred)
def find_user(user_id: int) -> dict | None:
    users = {1: {"name": "Alice"}, 2: {"name": "Bob"}}
    return users.get(user_id)

# Older style (works in Python 3.5+)
def parse_number(value: Union[str, int]) -> Optional[float]:
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

print(find_user(1))    # {'name': 'Alice'}
print(find_user(99))   # None
print(parse_number("3.14"))   # 3.14
print(parse_number("oops"))   # None`,
    },
    {
      heading: "Collections and Tuples",
      body: `Python 3.9+ lets you use built-in types directly as generics. For tuples, you can specify the exact types of each position. \`tuple[int, ...]\` means a tuple of any number of ints.`,
      code: `from typing import Sequence

# Specific tuple structure: (name, age, score)
def describe(person: tuple[str, int, float]) -> str:
    name, age, score = person
    return f"{name} (age {age}) scored {score:.1f}"

# Sequence accepts list, tuple, str — anything ordered
def total(values: Sequence[float]) -> float:
    return sum(values)

# Callable type hint
from typing import Callable

def apply(fn: Callable[[int], int], value: int) -> int:
    return fn(value)

print(describe(("Alice", 30, 92.5)))
print(total([1.0, 2.0, 3.0]))
print(apply(lambda x: x * 2, 5))`,
    },
    {
      heading: "TypeVar and Generic Functions",
      body: `\`TypeVar\` lets you write generic functions that work with any type while preserving type relationships. This tells the type checker: "whatever type goes in, the same type comes out."`,
      code: `from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

def last(items: list[T]) -> T:
    return items[-1]

# Type checker knows: first([1, 2, 3]) returns int
print(first([1, 2, 3]))        # 1
print(first(["a", "b", "c"]))  # a
print(last([10.0, 20.0]))      # 20.0`,
    },
  ],
  starterCode: `# Type Hints practice
from typing import Optional

def celsius_to_fahrenheit(c: float) -> float:
    return (c * 9 / 5) + 32

def format_temp(
    celsius: float,
    label: Optional[str] = None,
    precision: int = 1,
) -> str:
    f = celsius_to_fahrenheit(celsius)
    name = f"{label}: " if label else ""
    return f"{name}{celsius}°C = {f:.{precision}f}°F"

def parse_temp(value: str | float) -> float | None:
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

# Try them out
temps: list[tuple[float, str]] = [
    (0.0, "Freezing"),
    (100.0, "Boiling"),
    (37.0, "Body temp"),
    (-40.0, "Brrr"),
]

for c, label in temps:
    print(format_temp(c, label, precision=2))

print()
for val in ["98.6", "not_a_number", 42, None]:
    result = parse_temp(val)
    print(f"parse_temp({val!r}) -> {result}")
`,
};
