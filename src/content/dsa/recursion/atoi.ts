import type { QuestionData } from "@/components/QuestionContent";

export const content: QuestionData = {
  title: "Recursive atoi()",
  difficulty: "Medium",
  topic: "Recursion",
  problem: "Implement `atoi(s)` — convert a string of digit characters to its integer value **without** using `int()` or any built-in conversion. Use **recursion** to build the number digit by digit.\n\nExamples:\n`atoi(\"1234\")` → `1234`\n`atoi(\"7\")` → `7`\n`atoi(\"0\")` → `0`",
  constraints: [
    "Input contains only digit characters `'0'`–`'9'`",
    "No leading zeros (other than the string `\"0\"` itself)",
    "Convert a character digit to its integer value with `ord(c) - ord('0')`",
    "The key insight: `atoi(\"1234\") = atoi(\"123\") * 10 + 4`",
  ],
  explanation: [
    {
      heading: "The recursive insight: peel the last digit",
      body: "The trick is to express `atoi(s)` in terms of a smaller subproblem. Notice that any number can be split into its **all-but-last digits** and its **last digit**:\n\n`1234 = 123 × 10 + 4`\n\nIn string terms: `atoi(s) = atoi(s[:-1]) * 10 + digit_value(s[-1])`\n\nWe recursively solve the prefix (`\"123\"`), then multiply by 10 and add the last digit. The base case is a single-character string — return its digit value directly.",
      items: [
        "**Base case** — `len(s) == 1`: return `ord(s) - ord('0')` (e.g. `'4'` → `4`)",
        "**Recursive case** — `len(s) > 1`: return `atoi(s[:-1]) * 10 + (ord(s[-1]) - ord('0'))`",
      ],
    },
    {
      heading: "How the call stack builds the number",
      body: "Calls go **deeper** stripping one character at a time until a single digit remains. Then as the stack **unwinds**, each frame multiplies the accumulated result by 10 and adds its digit. The deepest frame contributes the most significant digit; the shallowest frame contributes the least significant digit.",
      code: `# Tracing atoi("1234"):
#
# atoi("1234")  →  atoi("123") * 10 + 4
#   atoi("123") →  atoi("12")  * 10 + 3
#     atoi("12") → atoi("1")   * 10 + 2
#       atoi("1") → 1          (base case)
#     ↑ returns 1 * 10 + 2  = 12
#   ↑ returns 12 * 10 + 3   = 123
# ↑ returns 123 * 10 + 4    = 1234`,
    },
    {
      heading: "Alternative: peel from the left (with index)",
      body: "You can also peel the **first** digit and pass an index instead of slicing the string. This avoids creating new string objects on every call and is more memory-efficient for large inputs.",
      code: `def atoi(s: str, i: int = 0) -> int:
    if i == len(s) - 1:            # base case: last character
        return ord(s[i]) - ord('0')
    rest = atoi(s, i + 1)          # value of suffix s[i+1:]
    place = 10 ** (len(s) - 1 - i) # place value of digit at i
    return (ord(s[i]) - ord('0')) * place + rest`,
    },
  ],
  visualizerSteps: [
    {
      description: "atoi(\"1234\") is called. len > 1, so we recurse on the prefix \"123\" and remember to add digit '4' later.",
      stack: [
        { label: "atoi(\"1234\")", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "atoi(\"123\") is called. Still len > 1, recurse on \"12\".",
      stack: [
        { label: "atoi(\"1234\")", status: "waiting" },
        { label: "atoi(\"123\")", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "atoi(\"12\") is called. Still len > 1, recurse on \"1\".",
      stack: [
        { label: "atoi(\"1234\")", status: "waiting" },
        { label: "atoi(\"123\")", status: "waiting" },
        { label: "atoi(\"12\")", status: "active" },
      ],
      phase: "calling",
    },
    {
      description: "BASE CASE: atoi(\"1\") — single character. ord('1') - ord('0') = 1. Returns 1.",
      stack: [
        { label: "atoi(\"1234\")", status: "waiting" },
        { label: "atoi(\"123\")", status: "waiting" },
        { label: "atoi(\"12\")", status: "waiting" },
        { label: "atoi(\"1\") → 1", status: "returning", returnValue: "1" },
      ],
      phase: "calling",
    },
    {
      description: "atoi(\"12\") resumes: prefix returned 1. Last digit is '2' → 2. Result = 1 × 10 + 2 = 12.",
      stack: [
        { label: "atoi(\"1234\")", status: "waiting" },
        { label: "atoi(\"123\")", status: "waiting" },
        { label: "atoi(\"12\") → 12", status: "returning", returnValue: "12" },
      ],
      phase: "unwinding",
    },
    {
      description: "atoi(\"123\") resumes: prefix returned 12. Last digit is '3' → 3. Result = 12 × 10 + 3 = 123.",
      stack: [
        { label: "atoi(\"1234\")", status: "waiting" },
        { label: "atoi(\"123\") → 123", status: "returning", returnValue: "123" },
      ],
      phase: "unwinding",
    },
    {
      description: "atoi(\"1234\") resumes: prefix returned 123. Last digit is '4' → 4. Result = 123 × 10 + 4 = 1234. Done!",
      stack: [
        { label: "atoi(\"1234\") → 1234", status: "returning", returnValue: "1234" },
      ],
      phase: "unwinding",
    },
  ],
  solution: `def atoi(s: str) -> int:
    # Base case: single character
    if len(s) == 1:
        return ord(s) - ord('0')
    # Recursive case: prefix * 10 + last digit
    return atoi(s[:-1]) * 10 + (ord(s[-1]) - ord('0'))


# Tests
print(atoi("0"))     # 0
print(atoi("7"))     # 7
print(atoi("42"))    # 42
print(atoi("1234"))  # 1234
print(atoi("9999"))  # 9999


# Index-based version (no string slicing — O(n) space instead of O(n²))
def atoi_idx(s: str, i: int = 0) -> int:
    if i == len(s) - 1:
        return ord(s[i]) - ord('0')
    return (ord(s[i]) - ord('0')) * (10 ** (len(s) - 1 - i)) + atoi_idx(s, i + 1)

print(atoi_idx("1234"))  # 1234`,
  complexity: {
    time: "O(n²)",
    space: "O(n)",
    note: "The slice version is O(n²) time: each of the n calls creates an O(n) string slice. The index-based version is O(n) time and O(n) stack space. Both have O(n) call depth.",
  },
};
