import type { DiagramConfig } from "@/components/FlowDiagram";

const treeDiagram: DiagramConfig = {
  width: 760,
  height: 270,
  caption: "DFS visits root→left→right (pre-order), BFS visits level by level",
  nodes: [
    { id: "root",  type: "client",   label: "Root",  sublabel: "val=10", x: 380, y: 50  },
    { id: "left",  type: "server",   label: "Left",  sublabel: "val=5",  x: 210, y: 140 },
    { id: "right", type: "server",   label: "Right", sublabel: "val=15", x: 550, y: 140 },
    { id: "ll",    type: "database", label: "Node",  sublabel: "val=3",  x: 130, y: 230 },
    { id: "lr",    type: "database", label: "Node",  sublabel: "val=7",  x: 290, y: 230 },
    { id: "rr",    type: "database", label: "Node",  sublabel: "val=20", x: 640, y: 230 },
  ],
  edges: [
    { from: "root",  to: "left"  },
    { from: "root",  to: "right" },
    { from: "left",  to: "ll"   },
    { from: "left",  to: "lr"   },
    { from: "right", to: "rr"   },
  ],
};

const bstDiagram: DiagramConfig = {
  width: 760,
  height: 200,
  caption: "BST property: every left child < parent, every right child > parent",
  nodes: [
    { id: "bst_root",  type: "client",   label: "Root",  sublabel: "val=8",  x: 380, y: 50  },
    { id: "bst_left",  type: "server",   label: "Left",  sublabel: "val=3",  x: 210, y: 130 },
    { id: "bst_right", type: "server",   label: "Right", sublabel: "val=10", x: 550, y: 130 },
    { id: "bst_ll",    type: "cache",    label: "Node",  sublabel: "val=1",  x: 130, y: 175 },
    { id: "bst_lr",    type: "cache",    label: "Node",  sublabel: "val=6",  x: 290, y: 175 },
    { id: "bst_rr",    type: "cache",    label: "Node",  sublabel: "val=14", x: 640, y: 175 },
  ],
  edges: [
    { from: "bst_root",  to: "bst_left",  label: "< 8" },
    { from: "bst_root",  to: "bst_right", label: "> 8" },
    { from: "bst_left",  to: "bst_ll",    label: "< 3" },
    { from: "bst_left",  to: "bst_lr",    label: "> 3" },
    { from: "bst_right", to: "bst_rr",    label: "> 10" },
  ],
};

export const content = {
  title: "Binary Trees & DFS/BFS",
  sections: [
    {
      heading: "Tree Nodes & Terminology",
      diagram: treeDiagram,
      body: `A **binary tree** is a hierarchical structure where each node has at most two children, called **left** and **right**. The topmost node is the **root**; nodes with no children are **leaves**.

Key vocabulary:
`,
      items: [
        "**Root** — the single entry point at the top of the tree",
        "**Parent / child** — a node is the parent of the nodes it points to",
        "**Leaf** — a node with no children (left == None and right == None)",
        "**Height** — the number of edges on the longest root-to-leaf path",
        "**Depth** — the number of edges from the root to a specific node",
      ],
      code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val   = val
        self.left  = left
        self.right = right

# Build the tree from the diagram manually:
#        10
#       /  \\
#      5    15
#     / \\     \\
#    3   7    20
root = TreeNode(10,
    left  = TreeNode(5,
        left  = TreeNode(3),
        right = TreeNode(7)),
    right = TreeNode(15,
        right = TreeNode(20)))

# Height of a tree (recursive)
def height(node):
    if node is None:
        return -1   # -1 so a single node has height 0
    return 1 + max(height(node.left), height(node.right))

print(height(root))   # 2`,
    },
    {
      heading: "Depth-First Search (DFS)",
      body: `DFS explores as far down a branch as possible before backtracking. There are three orderings — the only difference is **when you process the current node** relative to its children:
`,
      items: [
        "**Pre-order** (root → left → right) — useful for copying or serializing a tree",
        "**In-order** (left → root → right) — on a BST, yields elements in sorted order",
        "**Post-order** (left → right → root) — useful for deleting a tree or evaluating expressions",
      ],
      code: `def preorder(node):
    if node is None:
        return []
    return [node.val] + preorder(node.left) + preorder(node.right)

def inorder(node):
    if node is None:
        return []
    return inorder(node.left) + [node.val] + inorder(node.right)

def postorder(node):
    if node is None:
        return []
    return postorder(node.left) + postorder(node.right) + [node.val]

print(preorder(root))   # [10, 5, 3, 7, 15, 20]
print(inorder(root))    # [3, 5, 7, 10, 15, 20]
print(postorder(root))  # [3, 7, 5, 20, 15, 10]

# Count total nodes
def count_nodes(node):
    if node is None:
        return 0
    return 1 + count_nodes(node.left) + count_nodes(node.right)

print(count_nodes(root))  # 6`,
    },
    {
      heading: "Breadth-First Search (BFS)",
      body: `BFS visits the tree **level by level** — all nodes at depth 0, then depth 1, then depth 2, and so on. It uses a **queue** (from \`collections.deque\`) to track which node to visit next.

BFS is the go-to approach for:
`,
      items: [
        "Level-order traversal (print or collect nodes level by level)",
        "Finding the **minimum depth** (first leaf reached is the shallowest)",
        "Checking if a tree is **symmetric** or if two trees have the same structure",
      ],
      code: `from collections import deque

def level_order(root):
    if root is None:
        return []
    result = []
    queue  = deque([root])
    while queue:
        level_size = len(queue)
        level      = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result

print(level_order(root))
# [[10], [5, 15], [3, 7, 20]]

# Minimum depth (number of edges to nearest leaf)
def min_depth(root):
    if root is None:
        return 0
    queue = deque([(root, 1)])
    while queue:
        node, depth = queue.popleft()
        if not node.left and not node.right:
            return depth   # first leaf found — shallowest!
        if node.left:
            queue.append((node.left, depth + 1))
        if node.right:
            queue.append((node.right, depth + 1))

print(min_depth(root))  # 2  (path: 10 → 15 → ... wait, 15 has no left)
                        # Actually 2: 10 → 5 → 3 or 10 → 5 → 7`,
    },
    {
      heading: "Binary Search Tree (BST)",
      diagram: bstDiagram,
      body: `A **Binary Search Tree** enforces a powerful invariant: for every node, all values in its **left subtree** are less than the node's value, and all values in its **right subtree** are greater.

This means:
`,
      items: [
        "**Search** — compare at each node, go left or right: O(h) where h is height",
        "**Insert** — follow the same path as search, insert at the null spot: O(h)",
        "**In-order traversal** — always yields elements in sorted ascending order",
        "For a **balanced** BST (like AVL or Red-Black trees), h = O(log n)",
      ],
      code: `def bst_search(root, target):
    if root is None:
        return False
    if root.val == target:
        return True
    elif target < root.val:
        return bst_search(root.left, target)   # go left
    else:
        return bst_search(root.right, target)  # go right

def bst_insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left  = bst_insert(root.left, val)
    elif val > root.val:
        root.right = bst_insert(root.right, val)
    return root   # val == root.val: already exists, skip

#     8
#    / \\
#   3   10
#  / \\    \\
# 1   6   14
bst = TreeNode(8,
    left  = TreeNode(3, TreeNode(1), TreeNode(6)),
    right = TreeNode(10, right=TreeNode(14)))

print(bst_search(bst, 6))   # True
print(bst_search(bst, 5))   # False
print(inorder(bst))          # [1, 3, 6, 8, 10, 14]  ← sorted!

bst = bst_insert(bst, 7)
print(inorder(bst))          # [1, 3, 6, 7, 8, 10, 14]`,
    },
  ],
  starterCode: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val   = val
        self.left  = left
        self.right = right

# Build example tree:  10 -> (5 -> (3, 7)), (15 -> (_, 20))
root = TreeNode(10,
    left  = TreeNode(5, TreeNode(3), TreeNode(7)),
    right = TreeNode(15, right=TreeNode(20)))

def inorder(node):
    if node is None: return []
    return inorder(node.left) + [node.val] + inorder(node.right)

def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            n = queue.popleft()
            level.append(n.val)
            if n.left:  queue.append(n.left)
            if n.right: queue.append(n.right)
        result.append(level)
    return result

def height(node):
    if node is None: return -1
    return 1 + max(height(node.left), height(node.right))

print("In-order:", inorder(root))
print("Level-order:", level_order(root))
print("Height:", height(root))
`,
};
