import type { DiagramConfig } from "@/components/FlowDiagram";

const linkedListDiagram: DiagramConfig = {
  width: 760,
  height: 160,
  caption: "Each node holds a value and a pointer to the next node",
  nodes: [
    { id: "head",  type: "client",   label: "Head",   sublabel: "entry point", x: 80,  y: 80 },
    { id: "n1",    type: "server",   label: "Node 1", sublabel: "val=1",       x: 220, y: 80 },
    { id: "n2",    type: "server",   label: "Node 2", sublabel: "val=2",       x: 380, y: 80 },
    { id: "n3",    type: "server",   label: "Node 3", sublabel: "val=3",       x: 540, y: 80 },
    { id: "null",  type: "cache",    label: "None",   sublabel: "NULL",        x: 680, y: 80 },
  ],
  edges: [
    { from: "head", to: "n1",   label: ".next" },
    { from: "n1",   to: "n2",   label: ".next" },
    { from: "n2",   to: "n3",   label: ".next" },
    { from: "n3",   to: "null", label: ".next" },
  ],
};

const fastSlowDiagram: DiagramConfig = {
  width: 760,
  height: 180,
  caption: "Fast pointer moves 2 steps, slow moves 1 — they meet at the cycle or slow reaches the middle",
  nodes: [
    { id: "s1", type: "client",   label: "Slow",   sublabel: "1 step/iter", x: 100, y: 90 },
    { id: "f1", type: "server",   label: "Fast",   sublabel: "2 steps/iter", x: 310, y: 90 },
    { id: "m",  type: "queue",    label: "Middle", sublabel: "slow stops here", x: 520, y: 90 },
    { id: "e",  type: "cache",    label: "End",    sublabel: "fast reaches here", x: 670, y: 90 },
  ],
  edges: [
    { from: "s1", to: "m",  label: "n/2 steps" },
    { from: "f1", to: "e",  label: "n steps" },
  ],
};

export const content = {
  title: "Linked Lists",
  sections: [
    {
      heading: "Nodes & Pointers",
      diagram: linkedListDiagram,
      body: `A **linked list** is a chain of nodes where each node stores a value and a reference (pointer) to the next node. Unlike arrays, nodes can live anywhere in memory — they're connected by pointers, not proximity.

The list starts at a **head** pointer. The last node's \`next\` is \`None\` (null), signalling the end.`,
      code: `class Node:
    def __init__(self, val=0, next=None):
        self.val  = val
        self.next = next

# Build the list 1 → 2 → 3 → None manually
n3   = Node(3)
n2   = Node(2, next=n3)
n1   = Node(1, next=n2)
head = n1

# Or use a helper to build from a Python list
def build_list(values):
    if not values:
        return None
    head = Node(values[0])
    cur  = head
    for v in values[1:]:
        cur.next = Node(v)
        cur = cur.next
    return head

head = build_list([1, 2, 3, 4, 5])`,
    },
    {
      heading: "Traversal & Common Operations",
      body: `**Traversal** starts at \`head\` and follows \`.next\` pointers until \`None\`:

\`cur = head\` → process \`cur.val\` → \`cur = cur.next\` → repeat.

Insertion and deletion are O(1) **if you already have the target node** — just rewire pointers. Finding the node is O(n).`,
      code: `# Print all values
def print_list(head):
    cur = head
    while cur:
        print(cur.val, end=" → ")
        cur = cur.next
    print("None")

# Length of the list
def length(head):
    count, cur = 0, head
    while cur:
        count += 1
        cur = cur.next
    return count

# Insert a new node AFTER a given node
def insert_after(node, val):
    new_node = Node(val, next=node.next)
    node.next = new_node

# Delete the node AFTER a given node
def delete_after(node):
    if node.next:
        node.next = node.next.next   # skip one link

head = build_list([1, 2, 4, 5])
print_list(head)              # 1 → 2 → 4 → 5 → None
insert_after(head.next, 3)    # insert 3 after node 2
print_list(head)              # 1 → 2 → 3 → 4 → 5 → None`,
    },
    {
      heading: "Fast-Slow Pointer Technique",
      diagram: fastSlowDiagram,
      body: `The **fast-slow** (tortoise-and-hare) pattern uses two pointers moving at different speeds:

- **Slow** advances 1 node per iteration.
- **Fast** advances 2 nodes per iteration.

Two classic uses:
`,
      items: [
        "**Find the middle** — when fast reaches the end, slow is at the midpoint",
        "**Detect a cycle** — if a cycle exists, fast will eventually lap slow and they meet",
      ],
      code: `# Find middle node (returns first middle for even-length lists)
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

head = build_list([1, 2, 3, 4, 5])
print(find_middle(head).val)   # 3

head = build_list([1, 2, 3, 4])
print(find_middle(head).val)   # 2  (first of the two middles)

# Detect a cycle — returns True if the list loops back
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:        # same object in memory
            return True
    return False                # fast hit None — no cycle

# Create a cycle for testing: 1 → 2 → 3 → 4 → back to 2
n4 = Node(4); n3 = Node(3, n4); n2 = Node(2, n3); n1 = Node(1, n2)
n4.next = n2   # cycle!
print(has_cycle(n1))   # True

straight = build_list([1, 2, 3])
print(has_cycle(straight))  # False`,
    },
    {
      heading: "Common Linked List Problems",
      body: `Two patterns that appear constantly in interviews: **reversing a linked list** and **merging two sorted lists**.

Reversing works by iterating once and flipping each pointer in-place — O(n) time, O(1) space. Merging two sorted lists uses a dummy head node to simplify edge cases around the result head.`,
      code: `# Reverse a linked list in-place
def reverse_list(head):
    prev = None
    cur  = head
    while cur:
        nxt       = cur.next   # save next
        cur.next  = prev       # flip pointer
        prev      = cur        # advance prev
        cur       = nxt        # advance cur
    return prev                # new head

head = build_list([1, 2, 3, 4, 5])
head = reverse_list(head)
print_list(head)  # 5 → 4 → 3 → 2 → 1 → None

# Merge two sorted linked lists
def merge_sorted(l1, l2):
    dummy = Node(0)     # placeholder head — simplifies result head tracking
    cur   = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            cur.next = l1
            l1 = l1.next
        else:
            cur.next = l2
            l2 = l2.next
        cur = cur.next
    cur.next = l1 if l1 else l2   # attach the remainder
    return dummy.next

a = build_list([1, 3, 5])
b = build_list([2, 4, 6])
print_list(merge_sorted(a, b))  # 1 → 2 → 3 → 4 → 5 → 6 → None`,
    },
  ],
  starterCode: `# Linked list practice

class Node:
    def __init__(self, val=0, next=None):
        self.val  = val
        self.next = next

def build_list(values):
    if not values:
        return None
    head = Node(values[0])
    cur  = head
    for v in values[1:]:
        cur.next = Node(v)
        cur = cur.next
    return head

def print_list(head):
    cur = head
    while cur:
        print(cur.val, end=" → ")
        cur = cur.next
    print("None")

def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt, cur.next = cur.next, prev
        prev, cur = cur, nxt
    return prev

def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

head = build_list([1, 2, 3, 4, 5])
print_list(head)
print("Middle:", find_middle(head).val)
head = reverse_list(head)
print_list(head)
`,
};
