import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Virtual DOM & Reconciliation",
  difficulty: "Medium",
  category: "React",
  problem: "What is the Virtual DOM and why does React use it? Explain the reconciliation algorithm — how does React decide what to update in the real DOM?",
  constraints: [
    "The Virtual DOM is a **lightweight JavaScript tree** that mirrors the real DOM — cheap to create and diff.",
    "React compares the previous and next Virtual DOM trees (**diffing**) and only applies the minimum changes to the real DOM.",
    "React assumes that elements of different **types** produce different trees (type change → full subtree replace).",
  ],
  explanation: [
    {
      heading: "Why not update the DOM directly?",
      body: "Real DOM operations are expensive — they trigger layout, paint, and composite phases in the browser. React's Virtual DOM acts as a **buffer**: compute changes in JavaScript (fast), then apply only the minimal diff to the real DOM (slow part minimised).",
    },
    {
      heading: "The diffing algorithm (O(n) heuristics)",
      body: "A naive tree diff is O(n³). React's reconciler uses two heuristics to get to O(n):",
      items: [
        "**Different element types** → tear down the old tree and build a fresh one. Don't try to reuse children.",
        "**Same element type** → update only the changed attributes. Recurse into children.",
        "**Lists** → use `key` props to match elements across renders. Without keys, React can't tell which item moved vs changed.",
      ],
    },
    {
      heading: "React 18 — Concurrent rendering",
      body: "React 18's new concurrent renderer (Fiber) can **interrupt** and **prioritise** renders. Urgent updates (user typing) can interrupt slow updates (data fetching). The Virtual DOM tree is now built incrementally — React can pause mid-tree and resume later.",
    },
  ],
  visualizerSteps: [
    {
      description: "Initial render: React creates a Virtual DOM tree mirroring the component structure. The real DOM is built from it.",
      panels: [
        { title: "Virtual DOM (v1)", color: "#61dafb", items: [{ label: "<div>" }, { label: "  <h1>Hello</h1>" }, { label: "  <p>World</p>" }] },
        { title: "Real DOM", color: "#3fb950", items: [{ label: "div", active: true }, { label: "  h1: Hello" }, { label: "  p: World" }] },
      ],
      phase: "initial render",
    },
    {
      description: "State changes. React creates a new Virtual DOM tree (v2) but does NOT touch the real DOM yet.",
      panels: [
        { title: "Virtual DOM (v2)", color: "#f0db4f", items: [{ label: "<div>" }, { label: "  <h1>Hello</h1>" }, { label: "  <p>Changed!</p>", active: true }] },
        { title: "Real DOM", color: "#3fb950", items: [{ label: "div" }, { label: "  h1: Hello" }, { label: "  p: World" }] },
      ],
      phase: "new vdom",
    },
    {
      description: "Diffing: React compares v1 and v2. div is same type, h1 is unchanged. Only the p text changed.",
      panels: [
        { title: "Diff result", color: "#e3b341", items: [{ label: "div: no change" }, { label: "h1: no change" }, { label: "p text: CHANGED", active: true }] },
        { title: "DOM updates", color: "#f85149", items: [{ label: "1 text node update", active: true }] },
      ],
      phase: "diffing",
    },
    {
      description: "Commit: React applies only the minimal diff — updates the single text node in p. No full re-render of the DOM.",
      panels: [
        { title: "Real DOM (after)", color: "#3fb950", items: [{ label: "div" }, { label: "  h1: Hello" }, { label: "  p: Changed!", active: true }] },
        { title: "Ops applied", color: "#8b949e", items: [{ label: "textContent = 'Changed!'" }] },
      ],
      phase: "commit",
    },
  ],
  solution: `// React's Virtual DOM in action:
// 1. You write JSX — React creates a lightweight object tree
const element = <h1>Hello</h1>;
// Becomes: { type: 'h1', props: { children: 'Hello' } }

// 2. On state change, React diffs old tree vs new tree
// 3. Applies only the changed parts to the real DOM

// Key prop is critical for list reconciliation:
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>  // ← stable key
      ))}
    </ul>
  );
}
// Without key, React can't match items across renders
// → uses index as key (fragile) or re-creates all nodes`,
};
