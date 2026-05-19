export const content = {
  title: "Classes & Objects",
  sections: [
    {
      heading: "What is a Class?",
      body: `A class is a blueprint for creating objects. An **object** (or instance) is a specific thing built from that blueprint — it has its own data (attributes) and behaviour (methods). Python's \`class\` keyword defines one.`,
      code: `class Dog:
    def __init__(self, name, breed):
        # __init__ runs when you create an instance
        self.name = name    # instance attribute
        self.breed = breed

    def bark(self):
        print(f"{self.name} says: Woof!")

# Create instances
rex = Dog("Rex", "German Shepherd")
luna = Dog("Luna", "Labrador")

rex.bark()    # Rex says: Woof!
luna.bark()   # Luna says: Woof!
print(rex.name, rex.breed)   # Rex German Shepherd`,
    },
    {
      heading: "The __init__ Method and self",
      body: `\`__init__\` is the **initialiser** — Python calls it automatically when you create an instance with \`ClassName(...)\`. \`self\` is a reference to the instance being created. Every instance method must have \`self\` as its first parameter, though Python passes it automatically — you never write \`self\` when calling the method.`,
      code: `class Circle:
    PI = 3.14159   # class attribute — shared by all instances

    def __init__(self, radius):
        self.radius = radius    # instance attribute — unique per instance

    def area(self):
        return Circle.PI * self.radius ** 2

    def circumference(self):
        return 2 * Circle.PI * self.radius

c1 = Circle(5)
c2 = Circle(10)

print(f"Area of c1: {c1.area():.2f}")           # 78.54
print(f"Circumference of c2: {c2.circumference():.2f}")  # 62.83`,
    },
    {
      heading: "Dunder Methods",
      body: `Methods with double underscores on both sides (\`__name__\`) are called **dunder** (double underscore) or magic methods. They let you define how Python's built-in operations work on your objects — printing, comparison, arithmetic, and more.`,
      code: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __len__(self):
        # Returns magnitude as int (for demo purposes)
        return int((self.x**2 + self.y**2) ** 0.5)

v1 = Vector(2, 3)
v2 = Vector(4, 1)

print(v1)         # Vector(2, 3)   — uses __repr__
print(v1 + v2)    # Vector(6, 4)   — uses __add__
print(len(v1))    # 3              — uses __len__`,
    },
    {
      heading: "Inheritance",
      body: `A child class can **inherit** all attributes and methods from a parent class, then extend or override them. Use \`super()\` to call the parent's methods without repeating code.`,
      code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError("Subclasses must implement speak()")

    def __repr__(self):
        return f"{type(self).__name__}(name={self.name!r})"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says: Meow!"

class Duck(Animal):
    def speak(self):
        return f"{self.name} says: Quack!"

animals = [Cat("Whiskers"), Duck("Donald"), Cat("Felix")]
for animal in animals:
    print(animal.speak())`,
    },
    {
      heading: "Properties",
      body: `The \`@property\` decorator lets you define a getter method that looks like a plain attribute from the outside. Pair it with \`@name.setter\` to validate data on assignment without exposing raw attributes.`,
      code: `class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius   # _prefix = internal by convention

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Temperature below absolute zero!")
        self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

t = Temperature(25)
print(t.celsius)      # 25
print(t.fahrenheit)   # 77.0

t.celsius = 100
print(t.fahrenheit)   # 212.0`,
    },
  ],
  starterCode: `# Classes & Objects practice

class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance
        self._history = []

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount
        self._history.append(f"+{amount}")

    def withdraw(self, amount):
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        self._history.append(f"-{amount}")

    def statement(self):
        print(f"Account: {self.owner}")
        print(f"Transactions: {', '.join(self._history)}")
        print(f"Balance: \${self._balance:.2f}")

    def __repr__(self):
        return f"BankAccount(owner={self.owner!r}, balance={self._balance})"

acc = BankAccount("Alice", 1000)
acc.deposit(500)
acc.withdraw(200)
acc.deposit(100)
acc.statement()
print(acc)
`,
};
