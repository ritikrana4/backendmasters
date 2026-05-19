export const content = {
  title: "Testing with unittest & pytest",
  sections: [
    {
      heading: "Why Write Tests?",
      body: `Tests are automated checks that your code does what you think it does. They catch regressions (bugs introduced by new changes), document intended behaviour, and give you confidence to refactor. The key principle: **a function that's hard to test is usually a function that's hard to reason about** — testing pressure leads to better design.`,
      items: [
        "**Unit tests** — test one function or class in isolation",
        "**Integration tests** — test how components work together",
        "**End-to-end tests** — test the full system from a user perspective",
        "**Regression tests** — verify a bug never comes back after a fix",
      ],
    },
    {
      heading: "unittest Basics",
      body: `Python's built-in \`unittest\` module follows the xUnit pattern. Create a class that inherits \`unittest.TestCase\`, write methods starting with \`test_\`, and use \`self.assert*\` methods to check results. Run with \`unittest.main()\` or the test runner.`,
      code: `import unittest

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return a / b

class TestMath(unittest.TestCase):

    def test_add_positive(self):
        self.assertEqual(add(2, 3), 5)

    def test_add_negative(self):
        self.assertEqual(add(-1, -1), -2)

    def test_divide(self):
        self.assertAlmostEqual(divide(10, 3), 3.333, places=3)

    def test_divide_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            divide(10, 0)

# Run the tests
unittest.main(argv=[""], exit=False, verbosity=2)`,
    },
    {
      heading: "Common Assertions",
      body: `\`unittest.TestCase\` provides many assertion methods. A failing assertion prints a clear message and marks the test as failed.`,
      items: [
        "`assertEqual(a, b)` — a == b",
        "`assertNotEqual(a, b)` — a != b",
        "`assertTrue(x)` / `assertFalse(x)` — bool check",
        "`assertIs(a, b)` — identity (same object)",
        "`assertIsNone(x)` / `assertIsNotNone(x)`",
        "`assertIn(a, b)` — a in b",
        "`assertAlmostEqual(a, b, places=7)` — for floats",
        "`assertRaises(ExcType)` — as context manager",
        "`assertGreater(a, b)`, `assertLess(a, b)`",
      ],
    },
    {
      heading: "setUp and tearDown",
      body: `\`setUp()\` runs before **each** test method — use it to prepare shared state. \`tearDown()\` runs after each test — use it to clean up. \`setUpClass()\` and \`tearDownClass()\` run once for the whole test class (useful for expensive setup like database connections).`,
      code: `import unittest

class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance
    def deposit(self, amount):
        self.balance += amount
    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount

class TestBankAccount(unittest.TestCase):

    def setUp(self):
        # Fresh account before every test
        self.account = BankAccount(balance=100)

    def test_deposit(self):
        self.account.deposit(50)
        self.assertEqual(self.account.balance, 150)

    def test_withdraw(self):
        self.account.withdraw(30)
        self.assertEqual(self.account.balance, 70)

    def test_overdraft(self):
        with self.assertRaises(ValueError):
            self.account.withdraw(200)

unittest.main(argv=[""], exit=False, verbosity=2)`,
    },
    {
      heading: "pytest — the Modern Standard",
      body: `\`pytest\` is the industry-standard test runner. Its key advantages: no class needed (plain functions work), cleaner assertions with plain \`assert\`, powerful fixtures, parametrize, and a huge plugin ecosystem. Install with \`pip install pytest\` and run with the \`pytest\` command.`,
      code: `# With pytest — no imports, no class, plain assert

def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5

def test_add_floats():
    assert abs(add(0.1, 0.2) - 0.3) < 1e-10

# Parametrize — run one test with many inputs
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (2,  3,   5),
    (-1, 1,   0),
    (0,  0,   0),
    (100, -50, 50),
])
def test_add_cases(a, b, expected):
    assert add(a, b) == expected

# In the terminal: pytest test_math.py -v`,
    },
    {
      heading: "Test-Driven Development (TDD)",
      body: `TDD is the practice of writing the test **before** the implementation. The cycle is Red → Green → Refactor: write a failing test, write just enough code to make it pass, then clean up. This forces you to think about the interface before the internals, and ensures every line of code is tested.`,
      code: `import unittest

# Step 1: Write the test first (it will fail — no implementation yet)
class TestPasswordValidator(unittest.TestCase):

    def test_too_short(self):
        self.assertFalse(is_valid_password("abc"))

    def test_no_digit(self):
        self.assertFalse(is_valid_password("abcdefgh"))

    def test_no_uppercase(self):
        self.assertFalse(is_valid_password("abcdefg1"))

    def test_valid(self):
        self.assertTrue(is_valid_password("Abcdefg1"))

# Step 2: Write the minimum implementation to make tests pass
def is_valid_password(pw: str) -> bool:
    return (
        len(pw) >= 8
        and any(c.isdigit() for c in pw)
        and any(c.isupper() for c in pw)
    )

unittest.main(argv=[""], exit=False, verbosity=2)`,
    },
  ],
  starterCode: `import unittest

# --- Code to test ---

def fizzbuzz(n: int) -> str:
    """Return 'Fizz', 'Buzz', 'FizzBuzz', or the number as a string."""
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

def running_average(numbers: list[float]) -> list[float]:
    """Return list of running averages."""
    result = []
    total = 0
    for i, n in enumerate(numbers, 1):
        total += n
        result.append(total / i)
    return result

# --- Tests ---

class TestFizzBuzz(unittest.TestCase):
    def test_fizz(self):
        self.assertEqual(fizzbuzz(3), "Fizz")
        self.assertEqual(fizzbuzz(9), "Fizz")

    def test_buzz(self):
        self.assertEqual(fizzbuzz(5), "Buzz")
        self.assertEqual(fizzbuzz(10), "Buzz")

    def test_fizzbuzz(self):
        self.assertEqual(fizzbuzz(15), "FizzBuzz")
        self.assertEqual(fizzbuzz(30), "FizzBuzz")

    def test_number(self):
        self.assertEqual(fizzbuzz(7), "7")

class TestRunningAverage(unittest.TestCase):
    def test_basic(self):
        result = running_average([1, 2, 3])
        self.assertAlmostEqual(result[0], 1.0)
        self.assertAlmostEqual(result[1], 1.5)
        self.assertAlmostEqual(result[2], 2.0)

    def test_empty(self):
        self.assertEqual(running_average([]), [])

unittest.main(argv=[""], exit=False, verbosity=2)
`,
};
