import type { QuestionData } from "@/components/QuestionContent";

export const content: QuestionData = {
  title: "Factorial",
  difficulty: "Easy",
  topic: "Recursion",
  problem: "Given a non-negative integer `n`, return `n!` (n factorial). Factorial is defined as `n! = n × (n-1) × (n-2) × ... × 1`. By convention, `0! = 1`.",
  constraints: [
    "`0 ≤ n ≤ 12`",
    "The answer fits in a 32-bit integer.",
  ],
  explanation: [
    {
      heading: "What is a recursive solution?",
      body: "Recursion means a function calls **itself** with a smaller input. To write a recursive solution you need exactly two things: a **base case** (the simplest possible input where you can answer directly without recursing) and a **recursive case** (how to break the current problem into a smaller version of itself).",
      items: [
        "**Base case** — when does the recursion stop? For factorial: when `n ≤ 1`, the answer is `1` (nothing left to multiply).",
        "**Recursive case** — how is this problem related to a smaller one? `factorial(n) = n × factorial(n-1)`.",
        "**Trust the recursion** — assume `factorial(n-1)` returns the right answer. Your job is only to handle `n`.",
      ],
    },
    {
      heading: "Tracing the call: factorial(4)",
      body: "When you call `factorial(4)`, Python doesn't compute the answer immediately — it adds a **stack frame** for `factorial(4)` and then calls `factorial(3)`. That call adds another frame and calls `factorial(2)`, and so on. The stack keeps **growing** until the base case is hit. Then every frame gets to finish — computing its multiplication — in reverse order. This is called **unwinding**.",
      code: `factorial(4)
  → 4 * factorial(3)
        → 3 * factorial(2)
              → 2 * factorial(1)
                    → 1   ← BASE CASE, stack stops growing

# Now unwind (return values bubble up):
                    1      (factorial(1) = 1)
              2 * 1 = 2    (factorial(2) = 2)
        3 * 2 = 6          (factorial(3) = 6)
  4 * 6 = 24               (factorial(4) = 24)`,
    },
    {
      heading: "The two-part mental model",
      body: "Every recursive function has the same structure. Read it like a contract: **\"If the input is at the base case, return immediately. Otherwise, return `n` combined with the answer to the (n-1) version of the problem.\"**\n\nThe critical insight: you never have to think about all the calls at once. Just think about ONE call — what should it return given `n`? The rest takes care of itself.",
    },
  ],
  visualizerSteps: [
    {
      description: "We call factorial(4). n=4 is NOT the base case (not ≤ 1). We need factorial(3) first, so we push a new frame and make the call.",
      stack: [{ label: "factorial(4)", status: "active" }],
      phase: "calling",
    },
    {
      description: "factorial(4) is now waiting on the stack. It called factorial(3). n=3 is still not the base case — we go deeper.",
      stack: [
        { label: "factorial(4)", status: "waiting" },
        { label: "factorial(3)", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "Two frames are waiting. factorial(3) called factorial(2). n=2 — still not the base case. The stack grows again.",
      stack: [
        { label: "factorial(4)", status: "waiting" },
        { label: "factorial(3)", status: "waiting" },
        { label: "factorial(2)", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "factorial(2) calls factorial(1). n=1 — this hits the base case! No more recursive calls. The stack stops growing here.",
      stack: [
        { label: "factorial(4)", status: "waiting" },
        { label: "factorial(3)", status: "waiting" },
        { label: "factorial(2)", status: "waiting" },
        { label: "factorial(1)", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "BASE CASE: n=1 ≤ 1, so factorial(1) returns 1 immediately. The stack starts unwinding — values bubble back up.",
      stack: [
        { label: "factorial(4)", status: "waiting" },
        { label: "factorial(3)", status: "waiting" },
        { label: "factorial(2)", status: "waiting" },
        { label: "factorial(1)", status: "returning", returnValue: "1" },
      ],
      phase: "unwinding",
    },
    {
      description: "factorial(1) returned 1. factorial(2) resumes: it computes 2 × 1 = 2, then returns 2.",
      stack: [
        { label: "factorial(4)", status: "waiting" },
        { label: "factorial(3)", status: "waiting" },
        { label: "factorial(2)", status: "returning", returnValue: "2" },
      ],
      phase: "unwinding",
    },
    {
      description: "factorial(2) returned 2. factorial(3) resumes: it computes 3 × 2 = 6, then returns 6.",
      stack: [
        { label: "factorial(4)", status: "waiting" },
        { label: "factorial(3)", status: "returning", returnValue: "6" },
      ],
      phase: "unwinding",
    },
    {
      description: "factorial(3) returned 6. factorial(4) is the last frame — it computes 4 × 6 = 24. The stack is now empty. Answer: 24 ✓",
      stack: [
        { label: "factorial(4)", status: "returning", returnValue: "24" },
      ],
      phase: "unwinding",
    },
  ],
  solution: `def factorial(n: int) -> int:
    # Base case: 0! = 1, 1! = 1
    if n <= 1:
        return 1
    # Recursive case: n! = n * (n-1)!
    return n * factorial(n - 1)


# Tests
print(factorial(0))   # 1
print(factorial(1))   # 1
print(factorial(4))   # 24
print(factorial(5))   # 120
print(factorial(10))  # 3628800`,
  complexity: {
    time: "O(n)",
    space: "O(n)",
    note: "Time is O(n) — we make exactly n recursive calls. Space is O(n) because the call stack holds n frames simultaneously at peak depth (when we reach the base case).",
  },
};
