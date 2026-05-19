export const content = {
  title: "Error Handling",
  sections: [
    {
      heading: "What are Exceptions?",
      body: `When Python encounters an error at runtime, it raises an **exception** — an object that describes what went wrong. If nothing catches it, the program stops and prints a traceback. Common built-in exceptions you'll encounter:`,
      items: [
        "`ValueError` — right type, wrong value: `int('abc')`",
        "`TypeError` — wrong type: `'hello' + 5`",
        "`KeyError` — missing dict key: `d['missing']`",
        "`IndexError` — list index out of range: `l[99]` on a short list",
        "`ZeroDivisionError` — dividing by zero",
        "`FileNotFoundError` — reading a file that doesn't exist",
        "`AttributeError` — accessing a method or attribute that doesn't exist",
      ],
    },
    {
      heading: "try / except",
      body: `Wrap the code that might fail in a \`try\` block. If it raises an exception, the matching \`except\` block runs instead of crashing the program. You can catch multiple exception types.`,
      code: `# Catch a specific exception
try:
    number = int("abc")   # raises ValueError
except ValueError:
    print("That's not a valid number.")

# Catch and inspect the exception
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")   # Error: division by zero

# Catch multiple types
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
    except TypeError:
        return None

print(safe_divide(10, 2))   # 5.0
print(safe_divide(10, 0))   # None`,
    },
    {
      heading: "else and finally",
      body: `The \`else\` block runs only if **no exception** was raised. The \`finally\` block **always** runs — whether an exception occurred or not. \`finally\` is ideal for cleanup: closing files, releasing connections, resetting state.`,
      code: `def read_number(text):
    try:
        value = int(text)
    except ValueError:
        print(f"'{text}' is not an integer.")
    else:
        # Runs only when try succeeds
        print(f"Parsed successfully: {value}")
        return value
    finally:
        # Runs no matter what
        print("Attempt complete.")

read_number("42")    # Parsed successfully: 42  /  Attempt complete.
read_number("oops")  # 'oops' is not an integer.  /  Attempt complete.`,
    },
    {
      heading: "Raising Exceptions",
      body: `Use \`raise\` to deliberately trigger an exception — for example, when input violates a rule your function requires. You can raise any built-in exception or create your own.`,
      code: `def set_age(age):
    if not isinstance(age, int):
        raise TypeError(f"age must be int, got {type(age).__name__}")
    if age < 0 or age > 150:
        raise ValueError(f"age {age} is out of range [0, 150]")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(f"ValueError: {e}")

try:
    set_age("thirty")
except TypeError as e:
    print(f"TypeError: {e}")`,
    },
    {
      heading: "Custom Exceptions",
      body: `Define your own exception classes by inheriting from \`Exception\` (or a more specific base class). Custom exceptions make your library's failure modes explicit and give callers something specific to catch.`,
      code: `class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds the account balance."""
    def __init__(self, amount, balance):
        self.amount = amount
        self.balance = balance
        super().__init__(
            f"Cannot withdraw {amount}. Balance is only {balance}."
        )

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(amount, self.balance)
        self.balance -= amount
        return self.balance

account = BankAccount(100)
try:
    account.withdraw(150)
except InsufficientFundsError as e:
    print(e)   # Cannot withdraw 150. Balance is only 100.`,
    },
  ],
  starterCode: `# Error Handling practice

def parse_and_divide(a_str, b_str):
    """Parse two strings as numbers and return their division."""
    try:
        a = float(a_str)
        b = float(b_str)
        result = a / b
    except ValueError:
        return "Error: both inputs must be numbers"
    except ZeroDivisionError:
        return "Error: cannot divide by zero"
    else:
        return f"{a} / {b} = {result:.4f}"
    finally:
        print(f"  (computed: {a_str!r} / {b_str!r})")

print(parse_and_divide("10", "3"))
print(parse_and_divide("10", "0"))
print(parse_and_divide("10", "abc"))
`,
};
