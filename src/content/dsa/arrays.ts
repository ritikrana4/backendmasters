import type { DiagramConfig } from "@/components/FlowDiagram";

const twoPointerDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "Two pointers close in from both ends — O(n) instead of O(n²)",
  nodes: [
    { id: "left",  type: "client", label: "Left ptr",  sublabel: "index 0",   x: 100, y: 80 },
    { id: "e1",    type: "server", label: "Element",   sublabel: "arr[1]",    x: 240, y: 80 },
    { id: "e2",    type: "server", label: "Element",   sublabel: "arr[2]",    x: 380, y: 80 },
    { id: "e3",    type: "server", label: "Element",   sublabel: "arr[3]",    x: 520, y: 80 },
    { id: "right", type: "cache",  label: "Right ptr", sublabel: "index n-1", x: 660, y: 80 },
  ],
  edges: [
    { from: "left",  to: "e1" },
    { from: "e1",    to: "e2" },
    { from: "e2",    to: "e3" },
    { from: "e3",    to: "right" },
    { from: "right", to: "e3", dashed: true },
  ],
};

export const content = {
  title: "Arrays & Two-Pointer Technique",
  sections: [
    {
      heading: "Array Fundamentals",
      diagram: twoPointerDiagram,
      body: `An array stores elements in a **contiguous block of memory**. Each element is accessed by its **index** (zero-based in Python lists). This gives O(1) random access — jump directly to any element.

Key complexity facts:
`,
      items: [
        "`arr[i]` — access by index: **O(1)**",
        "`arr.append(x)` — add to end: **O(1)** amortized",
        "`arr.insert(i, x)` — insert at position: **O(n)** (shifts elements right)",
        "`arr.pop(i)` — remove at position: **O(n)** (shifts elements left)",
        "`x in arr` — linear search: **O(n)**",
      ],
    },
    {
      heading: "Two-Pointer Technique",
      body: `The two-pointer pattern uses two index variables — one starting at the left (\`lo\`), one at the right (\`hi\`) — and moves them inward. It converts many O(n²) brute-force solutions into O(n).

**When to reach for it:** sorted arrays, palindrome checks, pair/sum problems, reversals.

Classic example — **reverse an array in-place**:`,
      code: `def reverse_array(arr):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        arr[lo], arr[hi] = arr[hi], arr[lo]
        lo += 1
        hi -= 1
    return arr

print(reverse_array([1, 2, 3, 4, 5]))  # [5, 4, 3, 2, 1]
print(reverse_array([1, 2]))            # [2, 1]
print(reverse_array([42]))              # [42]  (single element — untouched)`,
    },
    {
      heading: "Two-Sum in a Sorted Array",
      body: `Given a **sorted** array and a target, find two indices whose values sum to the target.

**Brute force** tries every pair — O(n²). **Two pointers** solve it in O(n): if the current sum is too small, move \`lo\` right (increase the sum); if too large, move \`hi\` left (decrease the sum). The sorted order guarantees correctness.`,
      code: `def two_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        current = arr[lo] + arr[hi]
        if current == target:
            return (lo, hi)          # found!
        elif current < target:
            lo += 1                  # sum too small — move left pointer right
        else:
            hi -= 1                  # sum too large — move right pointer left
    return None                      # no pair found

arr = [1, 3, 5, 7, 9, 11]
print(two_sum_sorted(arr, 10))  # (1, 4)  → arr[1]+arr[4] = 3+7 = 10
print(two_sum_sorted(arr, 20))  # (4, 5)  → arr[4]+arr[5] = 9+11 = 20
print(two_sum_sorted(arr, 99))  # None`,
    },
    {
      heading: "Sliding Window",
      body: `The **sliding window** technique maintains a contiguous subarray of fixed or variable size as it slides across the array. Like two pointers, it keeps O(n) time by avoiding redundant recomputation — the window grows or shrinks from one end while the other end advances.

Example — **maximum sum subarray of size k**:`,
      code: `def max_subarray_sum(arr, k):
    if len(arr) < k:
        return None

    # Build the first window
    window_sum = sum(arr[:k])
    best = window_sum

    # Slide: add the new right element, drop the old left element
    for i in range(k, len(arr)):
        window_sum += arr[i]       # grow right
        window_sum -= arr[i - k]   # shrink left
        best = max(best, window_sum)

    return best

print(max_subarray_sum([2, 1, 5, 1, 3, 2], k=3))  # 9  (subarray [5,1,3])
print(max_subarray_sum([1, 4, 2, 9, 7, 3], k=2))  # 16 (subarray [9,7])`,
    },
    {
      heading: "Common Array Problems",
      body: `Here are three more patterns worth knowing: finding duplicates with a hash set, rotating an array in-place, and checking for a valid palindrome (combining two-pointers with string cleaning).`,
      code: `# 1. Contains Duplicate — O(n) with a set
def contains_duplicate(arr):
    seen = set()
    for x in arr:
        if x in seen:
            return True
        seen.add(x)
    return False

print(contains_duplicate([1, 2, 3, 1]))  # True
print(contains_duplicate([1, 2, 3, 4]))  # False

# 2. Rotate array right by k steps
def rotate(arr, k):
    n = len(arr)
    k = k % n               # handle k > n
    arr[:] = arr[-k:] + arr[:-k]

a = [1, 2, 3, 4, 5]
rotate(a, 2)
print(a)  # [4, 5, 1, 2, 3]

# 3. Valid palindrome (ignore non-alphanumeric, case-insensitive)
def is_palindrome(s):
    cleaned = [c.lower() for c in s if c.isalnum()]
    lo, hi = 0, len(cleaned) - 1
    while lo < hi:
        if cleaned[lo] != cleaned[hi]:
            return False
        lo += 1
        hi -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))                       # False`,
    },
  ],
  starterCode: `# Two-pointer and sliding window practice

def reverse_array(arr):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        arr[lo], arr[hi] = arr[hi], arr[lo]
        lo += 1
        hi -= 1
    return arr

def two_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        s = arr[lo] + arr[hi]
        if s == target:
            return (lo, hi)
        elif s < target:
            lo += 1
        else:
            hi -= 1
    return None

def max_subarray_sum(arr, k):
    window_sum = sum(arr[:k])
    best = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        best = max(best, window_sum)
    return best

print(reverse_array([1, 2, 3, 4, 5]))
print(two_sum_sorted([1, 3, 5, 7, 9], 12))
print(max_subarray_sum([2, 1, 5, 1, 3, 2], 3))
`,
};
