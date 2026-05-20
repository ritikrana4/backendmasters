import type { QuestionData } from "@/components/QuestionContent";

export const content: QuestionData = {
  title: "Fibonacci Number",
  difficulty: "Easy",
  topic: "Recursion",
  problem: "Given an integer `n`, return `fib(n)` — the nth number in the Fibonacci sequence. The sequence starts: `0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...` where each number is the sum of the two preceding numbers.",
  constraints: [
    "`0 ≤ n ≤ 30`",
    "`fib(0) = 0`, `fib(1) = 1`",
  ],
  explanation: [
    {
      heading: "Two base cases, two recursive calls",
      body: "Fibonacci is a natural fit for recursion because the mathematical definition IS already recursive: `fib(n) = fib(n-1) + fib(n-2)`. Unlike factorial (which had one recursive call per step), Fibonacci has **two** recursive calls — it forms a binary call tree, not a linear chain.",
      items: [
        "**Base case 1** — `n == 0`: return `0`",
        "**Base case 2** — `n == 1`: return `1`",
        "**Recursive case** — `n ≥ 2`: return `fib(n-1) + fib(n-2)`. We wait for both sub-calls to complete, then add the results.",
      ],
    },
    {
      heading: "The call order — left branch first",
      body: "When Python evaluates `fib(n-1) + fib(n-2)`, it computes **`fib(n-1)` completely first** (all the way down to a base case and back), then starts `fib(n-2)`. This is called **depth-first, left-branch-first** execution.\n\nWatching the visualizer below, notice how the stack builds deep on the left side of the tree, unwinds, then starts building on the right side. The full tree is explored one path at a time.",
      code: `# Full call tree for fib(4):
#
#            fib(4)
#           /      \\
#       fib(3)    fib(2)    ← right branch waits while left resolves
#       /    \\    /    \\
#   fib(2) fib(1) fib(1) fib(0)
#   /    \\
# fib(1) fib(0)
#
# Notice: fib(2) is computed TWICE, fib(1) is computed THREE times.
# This repeated work makes naive Fibonacci O(2^n) — exponential!`,
    },
    {
      heading: "Why is this O(2^n)? The exponential blowup",
      body: "Every non-base-case call spawns **two** more calls. That means the number of calls roughly doubles for each increment of `n`. For `fib(40)`, there are over a billion function calls — you can feel the slowdown.\n\nThe fix is **memoization**: cache the result of each `fib(n)` the first time it's computed. Any future call for the same `n` returns the cached value instantly. This reduces work from O(2^n) to O(n) — we cover this in the Dynamic Programming chapter.",
    },
  ],
  visualizerSteps: [
    {
      description: "fib(4) is called. n=4 ≥ 2, so we need fib(3) + fib(2). We evaluate the LEFT branch — fib(3) — first.",
      stack: [{ label: "fib(4)", status: "active" }],
      phase: "calling",
    },
    {
      description: "fib(4) waits and calls fib(3). fib(3) also needs two sub-calls. We continue down the left branch: fib(2).",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(3)", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "fib(3) waits and calls fib(2). fib(2) needs fib(1) and fib(0). We go left again: fib(1).",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(3)", status: "waiting" },
        { label: "fib(2)", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "BASE CASE: fib(1) = 1. n=1 is a base case — return 1 immediately. Stack starts unwinding this branch.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(3)", status: "waiting" },
        { label: "fib(2)", status: "waiting" },
        { label: "fib(1)", status: "returning", returnValue: "1" },
      ],
      phase: "calling",
    },
    {
      description: "fib(1) returned 1. fib(2) now calls its RIGHT branch: fib(0). n=0 is also a base case — return 0.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(3)", status: "waiting" },
        { label: "fib(2)", status: "waiting" },
        { label: "fib(0)", status: "returning", returnValue: "0" },
      ],
      phase: "calling",
    },
    {
      description: "fib(0) returned 0. fib(2) has both results: fib(1)=1 and fib(0)=0. It returns 1+0 = 1.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(3)", status: "waiting" },
        { label: "fib(2)", status: "returning", returnValue: "1" },
      ],
      phase: "unwinding",
    },
    {
      description: "fib(2) returned 1. fib(3) now calls its RIGHT branch: fib(1). n=1 is a base case — returns 1.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(3)", status: "waiting" },
        { label: "fib(1)", status: "returning", returnValue: "1" },
      ],
      phase: "unwinding",
    },
    {
      description: "fib(1) returned 1. fib(3) has both results: fib(2)=1 and fib(1)=1. It returns 1+1 = 2.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(3)", status: "returning", returnValue: "2" },
      ],
      phase: "unwinding",
    },
    {
      description: "fib(3) returned 2. fib(4) now evaluates its RIGHT branch: fib(2). Notice — fib(2) is computed again from scratch! This is the repeated work problem.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(2)", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "fib(2) calls fib(1) again (LEFT branch). BASE CASE — returns 1.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(2)", status: "waiting" },
        { label: "fib(1)", status: "returning", returnValue: "1" },
      ],
      phase: "calling",
    },
    {
      description: "fib(2) calls fib(0) (RIGHT branch). BASE CASE — returns 0.",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(2)", status: "waiting" },
        { label: "fib(0)", status: "returning", returnValue: "0" },
      ],
      phase: "calling",
    },
    {
      description: "fib(2) has both results again: 1+0 = 1. It returns 1. (Same result as before — wasted work!)",
      stack: [
        { label: "fib(4)", status: "waiting" },
        { label: "fib(2)", status: "returning", returnValue: "1" },
      ],
      phase: "unwinding",
    },
    {
      description: "All branches resolved. fib(4) = fib(3) + fib(2) = 2 + 1 = 3. Final answer: 3 ✓",
      stack: [
        { label: "fib(4)", status: "returning", returnValue: "3" },
      ],
      phase: "unwinding",
    },
  ],
  solution: `def fib(n: int) -> int:
    # Base cases
    if n == 0:
        return 0
    if n == 1:
        return 1
    # Recursive case: sum of two preceding numbers
    return fib(n - 1) + fib(n - 2)


# Tests
print(fib(0))   # 0
print(fib(1))   # 1
print(fib(4))   # 3
print(fib(6))   # 8
print(fib(10))  # 55
# fib(35) is noticeably slow — this is the O(2^n) cost`,
  complexity: {
    time: "O(2ⁿ)",
    space: "O(n)",
    note: "Time is O(2^n) — every call spawns two more, so the call tree has ~2^n nodes. Space is O(n) because the **maximum stack depth** at any moment is n (we only go as deep as one branch at a time). The fix — memoization — brings time down to O(n).",
  },
};
