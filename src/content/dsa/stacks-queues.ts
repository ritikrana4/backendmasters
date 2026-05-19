import type { DiagramConfig } from "@/components/FlowDiagram";

const stackQueueDiagram: DiagramConfig = {
  width: 760,
  height: 220,
  caption: "Stack: last in, first out. Queue: first in, first out.",
  nodes: [
    // Stack (vertical, left side)
    { id: "stk_bot", type: "database", label: "Stack",   sublabel: "bottom",       x: 130, y: 170 },
    { id: "stk_mid", type: "server",   label: "Stack",   sublabel: "middle",        x: 130, y: 110 },
    { id: "stk_top", type: "client",   label: "Stack",   sublabel: "top ← push/pop", x: 130, y: 50  },
    // Queue (horizontal, right side)
    { id: "q_enq",   type: "client",   label: "Enqueue", sublabel: "← add",         x: 430, y: 110 },
    { id: "q_item",  type: "server",   label: "Item",    sublabel: "in queue",       x: 565, y: 110 },
    { id: "q_deq",   type: "cache",    label: "Dequeue", sublabel: "remove →",       x: 690, y: 110 },
  ],
  edges: [
    { from: "stk_bot", to: "stk_mid" },
    { from: "stk_mid", to: "stk_top" },
    { from: "q_enq",   to: "q_item" },
    { from: "q_item",  to: "q_deq" },
  ],
};

const monotonicDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "Monotonic stack: pop anything that violates the order before pushing the new element",
  nodes: [
    { id: "arr",  type: "client",   label: "Array",  sublabel: "[2,1,5,3,4]",  x: 90,  y: 80 },
    { id: "cmp",  type: "server",   label: "Compare", sublabel: "top vs new",  x: 300, y: 80 },
    { id: "pop",  type: "cache",    label: "Pop",    sublabel: "NGE found!",   x: 500, y: 80 },
    { id: "push", type: "queue",    label: "Push",   sublabel: "push new",     x: 660, y: 80 },
  ],
  edges: [
    { from: "arr",  to: "cmp",  label: "new element" },
    { from: "cmp",  to: "pop",  label: "top < new" },
    { from: "cmp",  to: "push", label: "top >= new", dashed: true },
    { from: "pop",  to: "push", label: "then push" },
  ],
};

export const content = {
  title: "Stacks & Queues",
  sections: [
    {
      heading: "Stacks — LIFO",
      diagram: stackQueueDiagram,
      body: `A **stack** is a Last-In-First-Out (LIFO) structure. Think of a stack of plates: you always add and remove from the top.

Core operations:
`,
      items: [
        "`push(x)` — add to the top: O(1)",
        "`pop()` — remove from the top: O(1)",
        "`peek()` / `stack[-1]` — look at the top without removing: O(1)",
        "`is_empty()` — check if the stack has no elements: O(1)",
      ],
      code: `# Python list works perfectly as a stack
stack = []

stack.append(1)    # push 1
stack.append(2)    # push 2
stack.append(3)    # push 3
print(stack)       # [1, 2, 3]

print(stack[-1])   # peek: 3 (top)
stack.pop()        # pop 3
stack.pop()        # pop 2
print(stack)       # [1]

# Classic use: matching parentheses
def is_balanced(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in ')]}':
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return len(stack) == 0

print(is_balanced("({[]})"))   # True
print(is_balanced("({[})"))    # False`,
    },
    {
      heading: "Queues — FIFO",
      body: `A **queue** is a First-In-First-Out (FIFO) structure. Think of a checkout line: the first person to join is the first to be served.

Use Python's \`collections.deque\` — it provides O(1) append to the right and O(1) pop from the left. A plain list works but \`list.pop(0)\` is O(n) because it shifts all elements.`,
      code: `from collections import deque

queue = deque()

queue.append(1)     # enqueue 1  → [1]
queue.append(2)     # enqueue 2  → [1, 2]
queue.append(3)     # enqueue 3  → [1, 2, 3]

print(queue[0])     # peek front: 1
print(queue.popleft())  # dequeue: 1  → [2, 3]
print(queue.popleft())  # dequeue: 2  → [3]
print(queue)            # deque([3])

# Task scheduler simulation
tasks = deque(["parse", "validate", "save", "notify"])
while tasks:
    task = tasks.popleft()
    print(f"Processing: \${task}")
# Output: parse, validate, save, notify  (FIFO order)`,
    },
    {
      heading: "Monotonic Stack",
      diagram: monotonicDiagram,
      body: `A **monotonic stack** maintains a stack whose elements are always in sorted order (increasing or decreasing). When a new element arrives, pop everything that violates the order before pushing.

This is the key technique for **Next Greater Element** (NGE) and similar problems — finding the first element to the right that is larger/smaller than each element, in O(n) total time.`,
      code: `# Next Greater Element: for each element, find the first
# element to its right that is strictly greater. -1 if none.
def next_greater_element(arr):
    n = len(arr)
    result = [-1] * n
    stack = []   # stores indices, maintained as decreasing values

    for i in range(n):
        # Pop indices whose values are smaller than arr[i]
        while stack and arr[stack[-1]] < arr[i]:
            idx = stack.pop()
            result[idx] = arr[i]   # arr[i] is the NGE for arr[idx]
        stack.append(i)

    return result

print(next_greater_element([2, 1, 5, 3, 4]))
# [5, 5, -1, 4, -1]
# 2's NGE=5, 1's NGE=5, 5 has no NGE, 3's NGE=4, 4 has no NGE

print(next_greater_element([4, 3, 2, 1]))
# [-1, -1, -1, -1]  (decreasing — nothing greater to the right)`,
    },
    {
      heading: "BFS with a Queue",
      body: `**Breadth-First Search** (BFS) explores a graph or tree **level by level**. A queue is the natural data structure: enqueue the start node, then loop — dequeue a node, process it, and enqueue its unvisited neighbours. Nodes are always processed in the order they were discovered.

BFS finds the **shortest path** in an unweighted graph.`,
      code: `from collections import deque

# BFS on a graph represented as an adjacency list
def bfs(graph, start):
    visited = {start}
    queue   = deque([start])
    order   = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)
    return order

graph = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": [], "E": [], "F": [],
}
print(bfs(graph, "A"))   # ['A', 'B', 'C', 'D', 'E', 'F']

# Shortest path (number of edges) using BFS
def shortest_path_length(graph, start, end):
    if start == end:
        return 0
    visited = {start}
    queue   = deque([(start, 0)])   # (node, distance)
    while queue:
        node, dist = queue.popleft()
        for nb in graph[node]:
            if nb == end:
                return dist + 1
            if nb not in visited:
                visited.add(nb)
                queue.append((nb, dist + 1))
    return -1   # unreachable

print(shortest_path_length(graph, "A", "F"))  # 2  (A→C→F)`,
    },
  ],
  starterCode: `from collections import deque

# Stack — balanced parentheses
def is_balanced(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in ')]}':
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return len(stack) == 0

# Queue — BFS
def bfs(graph, start):
    visited = {start}
    queue   = deque([start])
    order   = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)
    return order

print(is_balanced("({[]})"))  # True
print(is_balanced("({[})"))   # False

graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
print(bfs(graph, "A"))        # ['A', 'B', 'C', 'D']
`,
};
