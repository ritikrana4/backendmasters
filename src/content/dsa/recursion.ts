import type { DiagramConfig } from "@/components/FlowDiagram";

const factorialDiagram: DiagramConfig = {
  width: 740,
  height: 140,
  caption: "fact(5) makes 4 recursive calls; fact(1) is the base case",
  nodes: [
    { id: "fact5", type: "client", label: "fact(5)", sublabel: "n=5",        x: 65,  y: 70 },
    { id: "fact4", type: "server", label: "fact(4)", sublabel: "n=4",        x: 210, y: 70 },
    { id: "fact3", type: "server", label: "fact(3)", sublabel: "n=3",        x: 355, y: 70 },
    { id: "fact2", type: "server", label: "fact(2)", sublabel: "n=2",        x: 500, y: 70 },
    { id: "fact1", type: "cache",  label: "fact(1)", sublabel: "BASE: n=1",  x: 645, y: 70 },
  ],
  edges: [
    { from: "fact5", to: "fact4", label: "recurse" },
    { from: "fact4", to: "fact3", label: "recurse" },
    { from: "fact3", to: "fact2", label: "recurse" },
    { from: "fact2", to: "fact1", label: "recurse" },
  ],
};

const fibDiagram: DiagramConfig = {
  width: 760,
  height: 265,
  caption: "fib(5) explodes into 15 calls — fib(3) is computed twice!",
  nodes: [
    { id: "fib5",  type: "client", label: "fib(5)", sublabel: "n=5",  x: 380, y: 45  },
    { id: "fib4",  type: "server", label: "fib(4)", sublabel: "n=4",  x: 200, y: 130 },
    { id: "fib3a", type: "server", label: "fib(3)", sublabel: "n=3",  x: 560, y: 130 },
    { id: "fib3b", type: "server", label: "fib(3)", sublabel: "n=3",  x: 110, y: 215 },
    { id: "fib2a", type: "server", label: "fib(2)", sublabel: "n=2",  x: 290, y: 215 },
    { id: "fib2b", type: "server", label: "fib(2)", sublabel: "n=2",  x: 470, y: 215 },
    { id: "fib1",  type: "cache",  label: "fib(1)", sublabel: "BASE", x: 650, y: 215 },
  ],
  edges: [
    { from: "fib5",  to: "fib4",  label: "fib(4)" },
    { from: "fib5",  to: "fib3a", label: "fib(3)" },
    { from: "fib4",  to: "fib3b" },
    { from: "fib4",  to: "fib2a" },
    { from: "fib3a", to: "fib2b" },
    { from: "fib3a", to: "fib1" },
  ],
};

const sumDigitsDiagram: DiagramConfig = {
  width: 740,
  height: 140,
  caption: "sumDigits(1234): peel one digit at a time until n < 10",
  nodes: [
    { id: "s1234", type: "client", label: "sumDigits", sublabel: "1234",   x: 65,  y: 70 },
    { id: "s123",  type: "server", label: "sumDigits", sublabel: "123",    x: 210, y: 70 },
    { id: "s12",   type: "server", label: "sumDigits", sublabel: "12",     x: 370, y: 70 },
    { id: "s1",    type: "server", label: "sumDigits", sublabel: "1",      x: 515, y: 70 },
    { id: "base",  type: "cache",  label: "BASE",      sublabel: "return 0", x: 655, y: 70 },
  ],
  edges: [
    { from: "s1234", to: "s123", label: "+4" },
    { from: "s123",  to: "s12",  label: "+3" },
    { from: "s12",   to: "s1",   label: "+2" },
    { from: "s1",    to: "base", label: "n<10" },
  ],
};

const powerDiagram: DiagramConfig = {
  width: 740,
  height: 140,
  caption: "power(2,5): each call reduces exponent by 1 — naive O(n) approach",
  nodes: [
    { id: "p5",   type: "client", label: "power",  sublabel: "2^5",      x: 65,  y: 70 },
    { id: "p4",   type: "server", label: "power",  sublabel: "2^4",      x: 210, y: 70 },
    { id: "p3",   type: "server", label: "power",  sublabel: "2^3",      x: 355, y: 70 },
    { id: "p2",   type: "server", label: "power",  sublabel: "2^2",      x: 500, y: 70 },
    { id: "base", type: "cache",  label: "power",  sublabel: "BASE: 2^0=1", x: 650, y: 70 },
  ],
  edges: [
    { from: "p5",   to: "p4",   label: "n-1" },
    { from: "p4",   to: "p3",   label: "n-1" },
    { from: "p3",   to: "p2",   label: "n-1" },
    { from: "p2",   to: "base", label: "n=0" },
  ],
};

const palindromeDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "isPalindrome checks outer chars, then recurses on the middle",
  nodes: [
    { id: "full", type: "client", label: "isPalin", sublabel: '"racecar"', x: 75,  y: 80 },
    { id: "m1",   type: "server", label: "isPalin", sublabel: '"aceca"',   x: 230, y: 80 },
    { id: "m2",   type: "server", label: "isPalin", sublabel: '"cec"',     x: 390, y: 80 },
    { id: "m3",   type: "server", label: "isPalin", sublabel: '"e"',       x: 545, y: 80 },
    { id: "base", type: "cache",  label: "BASE",    sublabel: "len≤1: True", x: 680, y: 80 },
  ],
  edges: [
    { from: "full", to: "m1",   label: "r==r ✓" },
    { from: "m1",   to: "m2",   label: "a==a ✓" },
    { from: "m2",   to: "m3",   label: "c==c ✓" },
    { from: "m3",   to: "base" },
  ],
};

export const content = {
  title: "Recursion — 5 Problems",
  sections: [
    // ── PROBLEM 1: Factorial ──────────────────────────────────────────────────
    {
      heading: "Problem 1: Factorial",
      diagram: factorialDiagram,
      body: `Given a non-negative integer \`n\`, compute \`n! = n × (n-1) × ... × 1\`. By definition, \`0! = 1\` and \`1! = 1\`.

**The recursive insight:** \`fact(n) = n × fact(n-1)\`. We keep peeling off one factor until we hit the base case.

**Base case:** \`n <= 1\` — return \`1\` (nothing left to multiply).
**Recursive case:** return \`n * factorial(n - 1)\`.`,
    },
    {
      heading: "Factorial — Solution",
      body: `The call chain for \`fact(5)\`:

\`fact(5)\` → \`5 × fact(4)\` → \`5 × 4 × fact(3)\` → \`5 × 4 × 3 × fact(2)\` → \`5 × 4 × 3 × 2 × fact(1)\` → \`5 × 4 × 3 × 2 × 1 = 120\`

Each call waits on the stack until the base case returns \`1\`, then the multiplications unwind back up the chain.`,
      code: `def factorial(n):
    # Base case: 0! = 1, 1! = 1
    if n <= 1:
        return 1
    # Recursive case: n! = n * (n-1)!
    return n * factorial(n - 1)

print(factorial(5))   # 120
print(factorial(0))   # 1
print(factorial(10))  # 3628800`,
    },

    // ── PROBLEM 2: Fibonacci ──────────────────────────────────────────────────
    {
      heading: "Problem 2: Fibonacci",
      diagram: fibDiagram,
      body: `Compute the nth Fibonacci number. The sequence is defined as:

- \`fib(0) = 0\`
- \`fib(1) = 1\`
- \`fib(n) = fib(n-1) + fib(n-2)\` for n ≥ 2

The first several values are: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34 …

**The recursive insight:** Each call fans out into TWO recursive calls — it forms a binary tree, not a chain.`,
      items: [
        "`fib(5)` calls `fib(4)` and `fib(3)`",
        "`fib(4)` calls `fib(3)` and `fib(2)` — but `fib(3)` is already being computed above!",
        "The diagram shows `fib(3)` appearing twice — repeated work grows exponentially",
      ],
    },
    {
      heading: "Fibonacci — Solution (Naive)",
      body: `The direct translation of the definition into code is clean and readable. It runs in **O(2^n)** time because every call spawns two more, and many subproblems are recomputed from scratch.

For \`fib(5)\`, there are ~15 function calls. For \`fib(40)\`, there are over a billion. The naive version is fine for small \`n\` — and it perfectly illustrates the problem structure.

> **Note:** This O(2^n) version is intentionally unoptimized. In the **Dynamic Programming** topic we'll add a memo table that reduces this to O(n) — a single lookup per subproblem.`,
      code: `def fib(n):
    # Base cases
    if n == 0:
        return 0
    if n == 1:
        return 1
    # Recursive case: sum of two previous terms
    return fib(n - 1) + fib(n - 2)

print(fib(0))   # 0
print(fib(1))   # 1
print(fib(6))   # 8
print(fib(10))  # 55
# fib(40) works but is noticeably slow — try it!`,
    },

    // ── PROBLEM 3: Sum of Digits ──────────────────────────────────────────────
    {
      heading: "Problem 3: Sum of Digits",
      diagram: sumDigitsDiagram,
      body: `Given a non-negative integer, return the sum of its digits.

\`sumDigits(1234) = 1 + 2 + 3 + 4 = 10\`

**The recursive insight:** \`n % 10\` peels off the **last** digit. \`n // 10\` removes it, shrinking the number. Repeat until the number itself is a single digit — that is the base case.

**Base case:** \`n < 10\` — the number IS the digit, return \`n\`.
**Recursive case:** return \`(n % 10) + sumDigits(n // 10)\`.`,
    },
    {
      heading: "Sum of Digits — Solution",
      body: `Walk-through for \`sumDigits(1234)\`:

1. \`1234 % 10 = 4\` → peel last digit; recurse on \`123\`
2. \`123 % 10 = 3\` → peel last digit; recurse on \`12\`
3. \`12 % 10 = 2\` → peel last digit; recurse on \`1\`
4. \`1 < 10\` → BASE CASE, return \`1\`
5. Unwind: \`1 + 2 + 3 + 4 = 10\`

Each recursive call has one fewer digit, so the depth equals the number of digits — O(log₁₀ n).`,
      code: `def sum_digits(n):
    # Base case: single digit — it IS the sum
    if n < 10:
        return n
    # Recursive case: last digit + sum of remaining digits
    return (n % 10) + sum_digits(n // 10)

print(sum_digits(0))     # 0
print(sum_digits(9))     # 9
print(sum_digits(1234))  # 10
print(sum_digits(9999))  # 36`,
    },

    // ── PROBLEM 4: Power x^n ──────────────────────────────────────────────────
    {
      heading: "Problem 4: Power x^n",
      diagram: powerDiagram,
      body: `Compute \`x^n\` for base \`x\` and non-negative integer exponent \`n\`.

\`power(2, 10) = 1024\`, \`power(3, 4) = 81\`

**The recursive insight:** \`x^n = x × x^(n-1)\`. Multiply \`x\` by itself, reducing the exponent by 1 each time.

**Base case:** \`n == 0\` — any number to the power 0 is 1 (\`x^0 = 1\`).
**Recursive case:** return \`x * power(x, n - 1)\`.`,
    },
    {
      heading: "Power — Solution (Naive O(n))",
      body: `Walk-through for \`power(2, 5)\`:

\`power(2,5)\` → \`2 × power(2,4)\` → \`2 × 2 × power(2,3)\` → \`2 × 2 × 2 × power(2,2)\` → \`2 × 2 × 2 × 2 × power(2,1)\` → \`2 × 2 × 2 × 2 × 2 × power(2,0)\` → \`2 × 2 × 2 × 2 × 2 × 1 = 32\`

The call depth equals \`n\`, so this is **O(n)** in both time and stack space.

> **Note:** There's a smarter algorithm — *fast exponentiation* — that uses \`x^n = (x^(n/2))^2\` to halve the exponent each step, giving O(log n). We'll see it in the **Divide & Conquer** topic.`,
      code: `def power(x, n):
    # Base case: anything to the 0th power is 1
    if n == 0:
        return 1
    # Recursive case: x^n = x * x^(n-1)
    return x * power(x, n - 1)

print(power(2, 0))   # 1
print(power(2, 5))   # 32
print(power(3, 4))   # 81
print(power(10, 3))  # 1000`,
    },

    // ── PROBLEM 5: Palindrome Check ───────────────────────────────────────────
    {
      heading: "Problem 5: Palindrome Check",
      diagram: palindromeDiagram,
      body: `Check whether a string reads the same forwards and backwards.

\`isPalindrome("racecar")\` → \`True\`
\`isPalindrome("hello")\` → \`False\`
\`isPalindrome("a")\` → \`True\`

**The recursive insight:** Compare the first and last characters. If they match, the word can only be a palindrome if the *inner* substring is also a palindrome. Strip the outer two characters and recurse.

**Base case:** A string of length 0 or 1 is always a palindrome.
**Early exit:** If the first and last characters differ, return \`False\` immediately — no need to look deeper.`,
    },
    {
      heading: "Palindrome — Solution",
      body: `Walk-through for \`"racecar"\`:

1. \`s[0]='r'\`, \`s[-1]='r'\` — match ✓ → recurse on \`"aceca"\`
2. \`s[0]='a'\`, \`s[-1]='a'\` — match ✓ → recurse on \`"cec"\`
3. \`s[0]='c'\`, \`s[-1]='c'\` — match ✓ → recurse on \`"e"\`
4. \`len("e") == 1\` → BASE CASE, return \`True\`
5. All outer pairs matched → the original string is a palindrome.

For \`"hello"\`: \`s[0]='h'\`, \`s[-1]='o'\` — mismatch! Return \`False\` immediately without any further calls.`,
      code: `def is_palindrome(s):
    # Base case: empty string or single char is always a palindrome
    if len(s) <= 1:
        return True
    # Early exit: outer characters don't match
    if s[0] != s[-1]:
        return False
    # Recursive case: check the inner substring
    return is_palindrome(s[1:-1])

print(is_palindrome("racecar"))  # True
print(is_palindrome("hello"))    # False
print(is_palindrome("a"))        # True
print(is_palindrome("abba"))     # True
print(is_palindrome("abcd"))     # False`,
    },
  ],
  starterCode: `# Try all five recursive problems!

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def fib(n):
    if n == 0: return 0
    if n == 1: return 1
    return fib(n - 1) + fib(n - 2)

def sum_digits(n):
    if n < 10:
        return n
    return (n % 10) + sum_digits(n // 10)

def power(x, n):
    if n == 0:
        return 1
    return x * power(x, n - 1)

def is_palindrome(s):
    if len(s) <= 1:
        return True
    if s[0] != s[-1]:
        return False
    return is_palindrome(s[1:-1])

# Test them all
print("factorial(5) =", factorial(5))      # 120
print("fib(10) =", fib(10))                # 55
print("sum_digits(1234) =", sum_digits(1234))  # 10
print("power(2, 8) =", power(2, 8))        # 256
print("is_palindrome('racecar') =", is_palindrome("racecar"))  # True
`,
};
