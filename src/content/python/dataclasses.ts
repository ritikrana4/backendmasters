export const content = {
  title: "Dataclasses",
  sections: [
    {
      heading: "The Problem with Plain Classes",
      body: `Every time you write a data-holding class in Python, you write the same boilerplate: \`__init__\` assigns attributes, \`__repr__\` formats them for printing, \`__eq__\` compares them field-by-field. The \`@dataclass\` decorator (Python 3.7+) generates all of this automatically from type-annotated class variables.`,
      code: `# Plain class — lots of repetitive boilerplate
class PointPlain:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

# Dataclass — exact same result, no boilerplate
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)
print(p1)          # Point(x=1.0, y=2.0)
print(p1 == p2)    # True`,
    },
    {
      heading: "Default Values and field()",
      body: `Provide defaults directly in the annotation. For mutable defaults (lists, dicts), use \`field(default_factory=...)\` — never assign a mutable default directly, as that would share the same object across all instances.`,
      code: `from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    grade: int = 0
    subjects: list[str] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)

alice = Student("Alice", grade=10)
bob   = Student("Bob",   grade=11, subjects=["Math", "Physics"])

alice.subjects.append("English")  # doesn't affect bob

print(alice)
print(bob)`,
    },
    {
      heading: "Frozen Dataclasses (Immutable)",
      body: `Pass \`frozen=True\` to make instances immutable — attempting to set an attribute raises \`FrozenInstanceError\`. Frozen dataclasses are also hashable, so they can be used as dict keys or in sets.`,
      code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Color:
    r: int
    g: int
    b: int

    def to_hex(self) -> str:
        return f"#{self.r:02X}{self.g:02X}{self.b:02X}"

red   = Color(255, 0, 0)
green = Color(0, 255, 0)

print(red.to_hex())    # #FF0000
print(green.to_hex())  # #00FF00

# Hashable — usable as dict keys and in sets
palette = {red, green, Color(0, 0, 255)}
print(len(palette))   # 3`,
    },
    {
      heading: "Post-Init Processing",
      body: `Use \`__post_init__\` to run validation or derived calculations after the generated \`__init__\` sets all fields. This gives you the best of both worlds: auto-generated init plus custom logic.`,
      code: `from dataclasses import dataclass

@dataclass
class Rectangle:
    width: float
    height: float
    area: float = 0.0      # will be computed

    def __post_init__(self):
        if self.width <= 0 or self.height <= 0:
            raise ValueError("Dimensions must be positive")
        self.area = self.width * self.height

r = Rectangle(4.0, 5.0)
print(r)         # Rectangle(width=4.0, height=5.0, area=20.0)

try:
    bad = Rectangle(-1, 5)
except ValueError as e:
    print(e)     # Dimensions must be positive`,
    },
    {
      heading: "Ordering and Comparison",
      body: `Pass \`order=True\` to automatically generate \`__lt__\`, \`__le__\`, \`__gt__\`, \`__ge__\` — enabling sorting and comparison. The comparison is done field by field in declaration order.`,
      code: `from dataclasses import dataclass

@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

versions = [
    Version(2, 0, 0),
    Version(1, 9, 3),
    Version(1, 10, 1),
    Version(2, 1, 0),
]

for v in sorted(versions):
    print(v)
# 1.9.3
# 1.10.1
# 2.0.0
# 2.1.0`,
    },
  ],
  starterCode: `# Dataclasses practice
from dataclasses import dataclass, field
from typing import Optional

@dataclass(order=True)
class Product:
    # order=True compares by price first (first declared field)
    price: float
    name: str
    tags: list[str] = field(default_factory=list, compare=False)
    in_stock: bool = field(default=True, compare=False)

    def __post_init__(self):
        if self.price < 0:
            raise ValueError(f"Price cannot be negative: {self.price}")

    def __str__(self):
        status = "✓" if self.in_stock else "✗"
        return f"{status} {self.name} - \${self.price:.2f}"

# Build a small product catalogue
catalogue = [
    Product(9.99,  "Mouse",    tags=["hardware", "input"]),
    Product(24.99, "Keyboard", tags=["hardware", "input"]),
    Product(4.99,  "USB Hub",  tags=["hardware"]),
    Product(14.99, "Mousepad", tags=["hardware"], in_stock=False),
]

print("Sorted by price:")
for p in sorted(catalogue):
    print(f"  {p}")

in_stock = [p for p in catalogue if p.in_stock]
total = sum(p.price for p in in_stock)
print(f"\\n{len(in_stock)} items in stock, total value: \${total:.2f}")
`,
};
