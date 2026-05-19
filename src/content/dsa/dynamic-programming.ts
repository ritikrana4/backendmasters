import type { DiagramConfig } from "@/components/FlowDiagram";

const memoDiagram: DiagramConfig = {
  width: 760,
  height: 270,
  caption: "Memoization caches computed results — fib(3) computed once, never again",
  nodes: [
    { id: "fib5", type: "client", label: "fib(5)",     sublabel: "compute",           x: 380, y: 50  },
    { id: "fib4", type: "server", label: "fib(4)",     sublabel: "compute",           x: 200, y: 130 },
    { id: "fib3", type: "server", label: "fib(3) ✓",  sublabel: "cached!",           x: 560, y: 130 },
    { id: "memo", type: "cache",  label: "memo{}",     sublabel: "{0:0,1:1,2:1,3:2}", x: 380, y: 220 },
  ],
  edges: [
    { from: "fib5", to: "fib4" },
    { from: "fib5", to: "fib3", dashed: true, label: "cache hit" },
    { from: "fib4", to: "memo", label: "store result" },
    { from: "fib3", to: "memo", label: "read from cache", dashed: true },
  ],
};

const tabulationDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "Tabulation fills a table bottom-up — no recursion, no stack overhead",
  nodes: [
    { id: "dp0", type: "cache",  label: "dp[0]", sublabel: "=0 (base)",  x: 80,  y: 80 },
    { id: "dp1", type: "cache",  label: "dp[1]", sublabel: "=1 (base)",  x: 215, y: 80 },
    { id: "dp2", type: "server", label: "dp[2]", sublabel: "=1",         x: 350, y: 80 },
    { id: "dp3", type: "server", label: "dp[3]", sublabel: "=2",         x: 485, y: 80 },
    { id: "dp4", type: "client", label: "dp[n]", sublabel: "answer",     x: 650, y: 80 },
  ],
  edges: [
    { from: "dp0", to: "dp2", label: "+dp[1]" },
    { from: "dp1", to: "dp2" },
    { from: "dp2", to: "dp3" },
    { from: "dp3", to: "dp4", label: "..." },
  ],
};

export const content = {
  title: "Dynamic Programming",
  sections: [
    {
      heading: "Overlapping Subproblems",
      body: `**Dynamic Programming (DP)** is an optimization technique for problems that have two key properties:

1. **Overlapping subproblems** — the same sub-computation is needed multiple times.
2. **Optimal substructure** — the optimal solution to the whole problem can be built from optimal solutions to its subproblems.

The naive recursive Fibonacci we saw in the Recursion topic runs in O(2^n) because \`fib(3)\`, \`fib(2)\`, etc. are recomputed from scratch every time they're needed. DP fixes this by storing each result the first time it's computed.

There are two equivalent approaches — top-down (memoization) and bottom-up (tabulation). Both give O(n) time for Fibonacci.`,
      items: [
        "**Top-down (memoization)** — keep the recursive structure, add a cache (dict/array)",
        "**Bottom-up (tabulation)** — iteratively fill a table in dependency order",
      ],
    },
    {
      heading: "Top-Down: Memoization",
      diagram: memoDiagram,
      body: `**Memoization** = recursion + a cache. Before computing \`fib(n)\`, check if the answer is already stored. If yes, return it immediately. If no, compute it, store it, then return it.

The call tree collapses from exponential to linear: each value \`fib(0)\` through \`fib(n)\` is computed **exactly once**, then served from the cache for every subsequent request.

In Python, \`functools.lru_cache\` is a one-line memoization decorator:`,
      code: `from functools import lru_cache

# Option 1: manual memo dict
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]          # cache hit — return immediately
    if n <= 1:
        return n                # base cases
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

print(fib_memo(10))   # 55
print(fib_memo(50))   # 12586269025  (instant — O(n))

# Option 2: lru_cache decorator (cleaner)
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(100))  # 354224848179261915075  (still instant)`,
    },
    {
      heading: "Bottom-Up: Tabulation",
      diagram: tabulationDiagram,
      body: `**Tabulation** fills a table iteratively, starting from the base cases and working up to the answer. There's no recursion and no stack overhead — it's often slightly faster in practice and avoids Python's recursion depth limit.

The key insight is knowing the **recurrence relation** and **evaluation order**: \`dp[i] = dp[i-1] + dp[i-2]\`, so you must fill index \`i\` after indexes \`i-1\` and \`i-2\`.

Space optimization: since \`dp[i]\` only depends on the two previous values, we can drop the array entirely and use two variables — O(1) space.`,
      code: `# Full table — easy to read and debug
def fib_table(n):
    if n <= 1:
        return n
    dp    = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print(fib_table(10))  # 55
print(fib_table(50))  # 12586269025

# Space-optimized: O(1) — only keep last two values
def fib_optimized(n):
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1

print(fib_optimized(10))   # 55
print(fib_optimized(100))  # 354224848179261915075`,
    },
    {
      heading: "Classic DP Problem: Coin Change",
      body: `**Coin Change** is the canonical DP problem. Given coin denominations and a target amount, find the **minimum number of coins** needed to reach the target.

**Recurrence:** \`dp[amount] = 1 + min(dp[amount - coin])\` for all coins where \`coin <= amount\`.

**Base case:** \`dp[0] = 0\` (zero coins needed to make amount 0).

**Bottom-up approach:** fill \`dp[1]\` through \`dp[target]\`. For each amount, try every coin and take the minimum.`,
      code: `def coin_change(coins, amount):
    # dp[i] = min coins needed to make amount i
    # Initialize with amount+1 (a value larger than any valid answer)
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0   # base case: 0 coins to make amount 0

    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], 1 + dp[a - coin])

    # If dp[amount] is still amount+1, it's unreachable
    return dp[amount] if dp[amount] <= amount else -1

print(coin_change([1, 5, 10, 25], 36))   #  3  (25+10+1)
print(coin_change([1, 5, 10, 25], 30))   #  2  (25+5)
print(coin_change([2], 3))               # -1  (impossible with only 2s)
print(coin_change([1, 2, 5], 11))        #  3  (5+5+1)

# Trace dp for coins=[1,5] amount=7:
# dp[0]=0, dp[1]=1, dp[2]=2, dp[3]=3, dp[4]=4,
# dp[5]=1, dp[6]=2, dp[7]=3  (5+1+1)`,
    },
  ],
  starterCode: `from functools import lru_cache

# Top-down memoization
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# Bottom-up tabulation
def fib_table(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

# Coin change
def coin_change(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], 1 + dp[a - coin])
    return dp[amount] if dp[amount] <= amount else -1

print("fib(10):", fib(10))
print("fib_table(10):", fib_table(10))
print("coin_change([1,5,10,25], 36):", coin_change([1, 5, 10, 25], 36))
print("coin_change([2], 3):", coin_change([2], 3))
`,
};
