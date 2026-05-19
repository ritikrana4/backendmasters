import type { DiagramConfig } from "@/components/FlowDiagram";

const binarySearchDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "Binary search halves the search space each step — O(log n) comparisons",
  nodes: [
    { id: "lo",  type: "client", label: "lo",  sublabel: "lo=0",    x: 80,  y: 80 },
    { id: "mid", type: "server", label: "mid", sublabel: "compare", x: 380, y: 80 },
    { id: "hi",  type: "client", label: "hi",  sublabel: "hi=n-1",  x: 680, y: 80 },
  ],
  edges: [
    { from: "lo",  to: "mid", label: "lo+(hi-lo)//2" },
    { from: "hi",  to: "mid", label: "converge" },
  ],
};

const variationsDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "First occurrence: keep searching left even after a match",
  nodes: [
    { id: "lo2",     type: "client", label: "lo",      sublabel: "lo=0",     x: 80,  y: 80 },
    { id: "match",   type: "queue",  label: "Match",   sublabel: "store idx", x: 280, y: 80 },
    { id: "mid2",    type: "server", label: "mid",     sublabel: "check val", x: 460, y: 80 },
    { id: "result",  type: "cache",  label: "Result",  sublabel: "leftmost", x: 650, y: 80 },
  ],
  edges: [
    { from: "lo2",   to: "match",  label: "found here?" },
    { from: "match", to: "mid2",   label: "keep going left" },
    { from: "mid2",  to: "result", label: "return stored" },
  ],
};

export const content = {
  title: "Binary Search",
  sections: [
    {
      heading: "The Core Idea",
      diagram: binarySearchDiagram,
      body: `Binary search works on **sorted** arrays. Instead of scanning every element (O(n)), it cuts the search space in half with each comparison — yielding **O(log n)** time.

The algorithm maintains two boundary pointers, \`lo\` and \`hi\`. At each step it computes the midpoint \`mid = lo + (hi - lo) // 2\` and asks: is the target equal to, less than, or greater than \`arr[mid]\`?
`,
      items: [
        "**Equal** — found it, return \`mid\`",
        "**Less than** \`arr[mid]\` — target must be in the left half; set \`hi = mid - 1\`",
        "**Greater than** \`arr[mid]\` — target must be in the right half; set \`lo = mid + 1\`",
      ],
    },
    {
      heading: "Iterative Implementation",
      body: `The iterative version uses a \`while lo <= hi\` loop. The \`<=\` is important — it ensures a single-element range (\`lo == hi\`) is still checked. If \`lo > hi\`, the target is not in the array.

Note: use \`lo + (hi - lo) // 2\` instead of \`(lo + hi) // 2\` to avoid integer overflow (Python integers don't overflow, but it's a good habit from C/Java).`,
      code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid           # found — return index
        elif arr[mid] < target:
            lo = mid + 1         # target is in the right half
        else:
            hi = mid - 1         # target is in the left half
    return -1                    # not found

nums = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(nums, 7))    #  3
print(binary_search(nums, 1))    #  0
print(binary_search(nums, 15))   #  7
print(binary_search(nums, 6))    # -1  (not in list)`,
    },
    {
      heading: "Recursive Implementation",
      body: `The recursive version passes updated \`lo\` and \`hi\` bounds down the call stack. Both versions have identical time complexity — the choice is stylistic. The iterative version is preferred in practice because it uses O(1) stack space vs O(log n) for the recursive version.`,
      code: `def binary_search_recursive(arr, target, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1

    # Base case: search space exhausted
    if lo > hi:
        return -1

    mid = lo + (hi - lo) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, lo=mid + 1, hi=hi)
    else:
        return binary_search_recursive(arr, target, lo=lo, hi=mid - 1)

nums = [2, 4, 6, 8, 10, 12]
print(binary_search_recursive(nums, 8))    #  3
print(binary_search_recursive(nums, 7))    # -1`,
    },
    {
      heading: "Variations & Traps",
      diagram: variationsDiagram,
      body: `**Finding the first or last occurrence** of a target (when duplicates exist) requires a small tweak: don't return immediately on a match. Instead, store the index and keep searching left (for first) or right (for last).

**Off-by-one traps to watch for:**
`,
      items: [
        "`lo <= hi` vs `lo < hi` — use `<=` so a one-element range is still examined",
        "`mid - 1` and `mid + 1` — always exclude `mid` after a non-match to avoid infinite loops",
        "`lo + (hi - lo) // 2` — safe midpoint formula (avoids overflow in other languages)",
      ],
      code: `# First occurrence of target (handles duplicates)
def first_occurrence(arr, target):
    lo, hi, result = 0, len(arr) - 1, -1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            result = mid       # record match, then keep searching LEFT
            hi = mid - 1
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result

# Last occurrence of target
def last_occurrence(arr, target):
    lo, hi, result = 0, len(arr) - 1, -1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            result = mid       # record match, then keep searching RIGHT
            lo = mid + 1
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result

arr = [1, 2, 2, 2, 3, 4]
print(first_occurrence(arr, 2))   # 1
print(last_occurrence(arr, 2))    # 3
print(first_occurrence(arr, 5))   # -1`,
    },
  ],
  starterCode: `# Binary search — iterative and variations

def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

def first_occurrence(arr, target):
    lo, hi, result = 0, len(arr) - 1, -1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            result = mid
            hi = mid - 1
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result

nums = [1, 3, 5, 7, 9, 11, 13, 15]
print("binary_search(nums, 7):", binary_search(nums, 7))     # 3
print("binary_search(nums, 6):", binary_search(nums, 6))     # -1

dupes = [1, 2, 2, 2, 3, 4]
print("first_occurrence(dupes, 2):", first_occurrence(dupes, 2))  # 1
`,
};
