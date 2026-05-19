export const content = {
  title: "Slots & Memory",
  sections: [
    {
      heading: "How Python Stores Instance Attributes",
      body: `By default, every Python instance stores its attributes in a dictionary (\`__dict__\`). This is flexible — you can add attributes dynamically — but dictionaries have overhead: a hash table, spare capacity for future keys, and pointer indirection. For classes with millions of instances, this adds up fast.`,
      code: `import sys

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1.0, 2.0)

# Instance attributes live in __dict__
print(p.__dict__)   # {'x': 1.0, 'y': 2.0}

# Size of one instance
print(f"Point instance:   {sys.getsizeof(p)} bytes")
print(f"Its __dict__:     {sys.getsizeof(p.__dict__)} bytes")
print(f"Total (approx):   {sys.getsizeof(p) + sys.getsizeof(p.__dict__)} bytes")`,
    },
    {
      heading: "__slots__",
      body: `Declaring \`__slots__\` as a class variable tells Python to store attributes in a fixed-size struct instead of a dict. This removes \`__dict__\` entirely, saving 100–200 bytes per instance and speeding up attribute access. The trade-off: you can only use the declared attributes — no arbitrary attribute assignment.`,
      code: `import sys

class PointSlots:
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x = x
        self.y = y

p = PointSlots(1.0, 2.0)

# No __dict__
print(hasattr(p, "__dict__"))   # False

print(f"PointSlots size: {sys.getsizeof(p)} bytes")

# Can't add new attributes
try:
    p.z = 3.0
except AttributeError as e:
    print(e)   # 'PointSlots' object has no attribute 'z'`,
    },
    {
      heading: "Memory Comparison at Scale",
      body: `The difference is negligible for a handful of objects, but when you're processing millions of records — parsing CSV files, holding sensor readings, building graph nodes — \`__slots__\` becomes a meaningful optimisation.`,
      code: `import sys

class Regular:
    def __init__(self, x, y, z):
        self.x, self.y, self.z = x, y, z

class Slotted:
    __slots__ = ("x", "y", "z")
    def __init__(self, x, y, z):
        self.x, self.y, self.z = x, y, z

N = 100_000

regular = [Regular(i, i*2, i*3) for i in range(N)]
slotted  = [Slotted(i, i*2, i*3) for i in range(N)]

def total_size(objects):
    return sum(
        sys.getsizeof(o) + sys.getsizeof(o.__dict__)
        if hasattr(o, "__dict__") else sys.getsizeof(o)
        for o in objects
    )

reg_mb   = total_size(regular) / 1_000_000
slot_mb  = total_size(slotted) / 1_000_000
savings  = (1 - slot_mb / reg_mb) * 100

print(f"Regular: {reg_mb:.1f} MB")
print(f"Slotted: {slot_mb:.1f} MB")
print(f"Savings: {savings:.0f}%")`,
    },
    {
      heading: "__slots__ with Inheritance",
      body: `When using \`__slots__\` with inheritance, each class in the hierarchy should declare its own \`__slots__\`. If a parent class doesn't declare \`__slots__\` (or declares \`__dict__\` in it), the subclass will still have a \`__dict__\` and the memory benefit is lost.`,
      code: `class Base:
    __slots__ = ("x",)
    def __init__(self, x): self.x = x

class Child(Base):
    __slots__ = ("y",)   # declare only NEW attributes
    def __init__(self, x, y):
        super().__init__(x)
        self.y = y

c = Child(1, 2)
print(c.x, c.y)            # 1 2
print(hasattr(c, "__dict__"))  # False — still no dict

# If Child forgot __slots__, it would regain __dict__:
class BadChild(Base):
    def __init__(self, x, y):
        super().__init__(x)
        self.y = y   # stored in __dict__ — savings lost

import sys
bc = BadChild(1, 2)
print(hasattr(bc, "__dict__"))  # True`,
    },
    {
      heading: "Other Memory Optimisation Techniques",
      body: `\`__slots__\` is the most impactful single change for attribute-heavy objects. Here are other tools in the memory-optimisation toolbox:`,
      items: [
        "`sys.getsizeof(obj)` — shallow size of one object in bytes (doesn't include referenced objects)",
        "`tracemalloc` — trace memory allocations to find where memory is growing",
        "`array` module — typed arrays (only homogeneous values) — much smaller than a `list` of ints",
        "`numpy` arrays — 10–100× more memory-efficient than Python lists for numerical data",
        "`__slots__` + `@dataclass(slots=True)` — Python 3.10+ combines both for clean syntax",
        "Generators instead of lists — produce values on demand without holding all in memory",
      ],
      code: `import sys
from dataclasses import dataclass

# Python 3.10+ — @dataclass with slots=True
@dataclass(slots=True)
class Vector3D:
    x: float
    y: float
    z: float

v = Vector3D(1.0, 2.0, 3.0)
print(v)
print(f"Size: {sys.getsizeof(v)} bytes")
print(f"Has __dict__: {hasattr(v, '__dict__')}")`,
    },
  ],
  starterCode: `import sys
from dataclasses import dataclass

# Compare 4 approaches to storing a 2D point

class DictPoint:
    def __init__(self, x, y): self.x, self.y = x, y

class SlotsPoint:
    __slots__ = ("x", "y")
    def __init__(self, x, y): self.x, self.y = x, y

@dataclass
class DataPoint:
    x: float
    y: float

@dataclass(slots=True)
class SlottedDataPoint:
    x: float
    y: float

N = 50_000
classes = [DictPoint, SlotsPoint, DataPoint, SlottedDataPoint]
names   = ["dict class", "__slots__", "@dataclass", "@dataclass(slots=True)"]

print(f"{'Class':22s} {'1 obj':>8s} {'50k objs':>12s}")
print("-" * 45)
for cls, name in zip(classes, names):
    objs = [cls(i * 0.1, i * 0.2) for i in range(N)]
    one  = sys.getsizeof(objs[0])
    if hasattr(objs[0], "__dict__"):
        one += sys.getsizeof(objs[0].__dict__)
    total_mb = one * N / 1_000_000
    print(f"{name:22s} {one:>7d}B  {total_mb:>8.1f} MB")
`,
};
