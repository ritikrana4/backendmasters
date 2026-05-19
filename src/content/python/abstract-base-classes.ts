export const content = {
  title: "Abstract Base Classes",
  sections: [
    {
      heading: "What is an Abstract Base Class?",
      body: `An **Abstract Base Class (ABC)** defines an interface — a contract that subclasses must fulfil. It can declare methods that **must** be implemented by every concrete subclass. If a subclass forgets to implement them, Python raises a \`TypeError\` at instantiation time, not at call time. This catches errors early.`,
      code: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        """Return the area of the shape."""

    @abstractmethod
    def perimeter(self) -> float:
        """Return the perimeter of the shape."""

    def describe(self) -> str:
        return f"{type(self).__name__}: area={self.area():.2f}, perimeter={self.perimeter():.2f}"

# Trying to instantiate the ABC directly raises TypeError
try:
    s = Shape()
except TypeError as e:
    print(e)   # Can't instantiate abstract class Shape...`,
    },
    {
      heading: "Implementing Concrete Subclasses",
      body: `A concrete subclass must implement **all** abstract methods. Once it does, it can be instantiated normally. Non-abstract methods defined on the ABC (like \`describe()\` above) are inherited for free.`,
      code: `from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...
    @abstractmethod
    def perimeter(self) -> float: ...
    def describe(self):
        return f"{type(self).__name__}: area={self.area():.2f}"

class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius
    def area(self):
        return math.pi * self.radius ** 2
    def perimeter(self):
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, w: float, h: float):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h
    def perimeter(self):
        return 2 * (self.w + self.h)

shapes = [Circle(5), Rectangle(4, 6), Circle(2)]
for s in shapes:
    print(s.describe())

# Polymorphism — same interface, different behaviour
total_area = sum(s.area() for s in shapes)
print(f"Total area: {total_area:.2f}")`,
    },
    {
      heading: "Abstract Properties",
      body: `Use \`@property\` combined with \`@abstractmethod\` to require subclasses to implement a property. The order matters: \`@property\` must be the outermost decorator.`,
      code: `from abc import ABC, abstractmethod

class Animal(ABC):
    @property
    @abstractmethod
    def sound(self) -> str:
        """The sound this animal makes."""

    @property
    @abstractmethod
    def legs(self) -> int:
        """Number of legs."""

    def describe(self):
        print(f"{type(self).__name__}: '{self.sound}', {self.legs} legs")

class Dog(Animal):
    @property
    def sound(self): return "Woof"
    @property
    def legs(self): return 4

class Bird(Animal):
    @property
    def sound(self): return "Tweet"
    @property
    def legs(self): return 2

for animal in [Dog(), Bird()]:
    animal.describe()`,
    },
    {
      heading: "collections.abc — Built-in ABCs",
      body: `Python's \`collections.abc\` module defines ABCs for container types: \`Iterable\`, \`Iterator\`, \`Sequence\`, \`Mapping\`, \`MutableMapping\`, \`Set\`, and more. You can use these for isinstance checks, or inherit from them to get free method implementations when you implement the required ones.`,
      code: `from collections.abc import MutableMapping

class CaseInsensitiveDict(MutableMapping):
    """A dict with case-insensitive string keys."""

    def __init__(self, data=None):
        self._store = {}
        if data:
            self.update(data)

    def __setitem__(self, key, value):
        self._store[key.lower()] = value

    def __getitem__(self, key):
        return self._store[key.lower()]

    def __delitem__(self, key):
        del self._store[key.lower()]

    def __iter__(self):
        return iter(self._store)

    def __len__(self):
        return len(self._store)

d = CaseInsensitiveDict({"Content-Type": "application/json"})
print(d["content-type"])    # application/json
print(d["CONTENT-TYPE"])    # application/json
d["Accept"] = "text/html"
print(dict(d))`,
    },
    {
      heading: "typing.Protocol — Structural Subtyping",
      body: `\`Protocol\` (Python 3.8+) is a lighter alternative to ABCs. With Protocol, a class satisfies the interface if it has the right methods — **no explicit inheritance required**. This is called structural subtyping (duck typing with static analysis support).`,
      code: `from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> str: ...
    def resize(self, factor: float) -> None: ...

# These classes do NOT inherit from Drawable —
# they just happen to have the right methods
class Square:
    def __init__(self, side: float): self.side = side
    def draw(self): return f"□ side={self.side}"
    def resize(self, factor): self.side *= factor

class Triangle:
    def __init__(self, base: float): self.base = base
    def draw(self): return f"△ base={self.base}"
    def resize(self, factor): self.base *= factor

def render(shape: Drawable) -> None:
    print(shape.draw())

# Both work — no inheritance, just compatible methods
render(Square(4.0))
render(Triangle(3.0))`,
    },
  ],
  starterCode: `from abc import ABC, abstractmethod

class PaymentProcessor(ABC):
    """Abstract base for all payment methods."""

    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def charge(self, amount: float) -> bool:
        """Attempt to charge amount. Return True on success."""

    @abstractmethod
    def refund(self, amount: float) -> bool:
        """Attempt to refund amount. Return True on success."""

    def process(self, amount: float) -> str:
        if amount <= 0:
            raise ValueError("Amount must be positive")
        success = self.charge(amount)
        return f"{self.name}: {'charged' if success else 'failed'} \${amount:.2f}"

class CreditCard(PaymentProcessor):
    @property
    def name(self): return "Credit Card"
    def charge(self, amount):
        print(f"  Charging \${amount:.2f} to card...")
        return True
    def refund(self, amount):
        print(f"  Refunding \${amount:.2f} to card...")
        return True

class BankTransfer(PaymentProcessor):
    @property
    def name(self): return "Bank Transfer"
    def charge(self, amount):
        print(f"  Initiating \${amount:.2f} bank transfer...")
        return amount < 10_000   # transfers over 10k require manual review
    def refund(self, amount):
        return True

processors = [CreditCard(), BankTransfer()]
for p in processors:
    print(p.process(99.99))
`,
};
