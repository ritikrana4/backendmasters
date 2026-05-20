import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "useMemo & useCallback",
  difficulty: "Medium",
  category: "React",
  problem: "When should you use `useMemo` and `useCallback`? What is the difference between them? What problem do they solve, and what is the cost of overusing them?",
  constraints: [
    "`useMemo` memoises a **computed value**. `useCallback` memoises a **function reference**.",
    "Both only re-compute when their dependency array changes — like `useEffect`.",
    "Memoisation has a cost: React stores the previous value and does a comparison each render. Only use when the computation is genuinely expensive or referential equality matters.",
  ],
  explanation: [
    {
      heading: "The referential equality problem",
      body: "Every time a component renders, new objects and functions are created. For primitive values (strings, numbers), equality is by value. For objects and functions, equality is by **reference** — `{} !== {}`. This matters because child components wrapped in `React.memo` will still re-render if their prop is a new function reference on every parent render.",
      code: `// Without useCallback: new function reference every render
function Parent() {
  const handleClick = () => console.log('clicked'); // new ref each render
  return <Child onClick={handleClick} />;
}

// With useCallback: stable reference
function Parent() {
  const handleClick = useCallback(() => console.log('clicked'), []);
  return <Child onClick={handleClick} />; // same ref — memo works
}`,
    },
    {
      heading: "useMemo — memoising computed values",
      body: "`useMemo` runs a function and **caches the result** until a dependency changes. Use it for expensive computations that run inside a render (sorting large arrays, complex math, filtering). Don't use it for simple operations — the memoisation overhead isn't worth it.",
      code: `const sortedList = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items] // only re-sort when items changes
);

// NOT worth it:
const doubled = useMemo(() => count * 2, [count]); // trivial calc`,
    },
    {
      heading: "useCallback — memoising function references",
      body: "`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`. Use it when passing callbacks to child components wrapped in `React.memo`, or as stable references in other hooks' dependency arrays.",
    },
  ],
  visualizerSteps: [
    {
      description: "Without memoisation: Parent re-renders → new function ref → Child sees new prop → Child re-renders (even if data is same).",
      panels: [
        { title: "Parent renders", color: "#f85149", items: [{ label: "handleClick = new fn ref", active: true }] },
        { title: "Child props", color: "#f85149", items: [{ label: "onClick: prev ref ≠ new ref", active: true }] },
        { title: "Child", color: "#f85149", items: [{ label: "re-renders (wasted)", active: true }] },
      ],
      phase: "without memo",
    },
    {
      description: "With useCallback + React.memo: Parent re-renders → same function ref → Child sees same prop → Child skips re-render.",
      panels: [
        { title: "Parent renders", color: "#3fb950", items: [{ label: "handleClick = same ref", active: true }] },
        { title: "Child props", color: "#3fb950", items: [{ label: "onClick: same ref ✓", active: true }] },
        { title: "Child (memo'd)", color: "#3fb950", items: [{ label: "skips re-render ✓", active: true }] },
      ],
      phase: "with memo",
    },
    {
      description: "useMemo for expensive computation: only re-runs when 'items' changes, not on every render.",
      panels: [
        { title: "items unchanged", color: "#3fb950", items: [{ label: "useMemo: returns cached sort", active: true }] },
        { title: "items changed", color: "#e3b341", items: [{ label: "useMemo: re-runs sort", active: true }] },
      ],
      phase: "useMemo",
    },
    {
      description: "The cost: every useMemo/useCallback stores a value and runs a comparison each render. Overusing them adds overhead.",
      panels: [
        { title: "Use when", color: "#3fb950", items: [{ label: "expensive computation" }, { label: "referential equality needed" }, { label: "stable dep for useEffect" }] },
        { title: "Avoid when", color: "#f85149", items: [{ label: "trivial operations" }, { label: "non-memoised children" }, { label: "premature optimisation" }] },
      ],
      phase: "when to use",
    },
  ],
  solution: `import { useMemo, useCallback, memo } from 'react';

// useMemo: expensive computation
function ProductList({ products, filter }) {
  const filtered = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  );
  return filtered.map(p => <Product key={p.id} {...p} />);
}

// useCallback + React.memo: stable callback to memoised child
const Button = memo(({ onClick, label }) => (
  <button onClick={onClick}>{label}</button>
));

function Parent({ id }) {
  const handleDelete = useCallback(() => {
    deleteItem(id);
  }, [id]); // only new ref when id changes

  return <Button onClick={handleDelete} label="Delete" />;
}`,
};
