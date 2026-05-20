import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "useState Hook",
  difficulty: "Easy",
  category: "React",
  problem: "Explain how `useState` works. Why does this code NOT print the updated count immediately after calling setCount?\n\nconst [count, setCount] = useState(0);\nconst handleClick = () => {\n  setCount(count + 1);\n  console.log(count); // still 0!\n};",
  constraints: [
    "State updates in React are **asynchronous** — `setCount` schedules a re-render, it doesn't mutate `count` in place.",
    "`count` in the current render is a **constant** — it captures the value from when the component rendered.",
    "Use the **functional updater form** `setCount(prev => prev + 1)` when updating based on previous state.",
  ],
  explanation: [
    {
      heading: "State is a snapshot",
      body: "When a component renders, React calls your function and all `useState` values are fixed constants for that render. Calling `setCount(count + 1)` schedules a new render with `count + 1` as the next value — but `count` in the CURRENT render closure stays the same. The `console.log(count)` reads the snapshot from this render.",
    },
    {
      heading: "Batching — multiple setState calls",
      body: "React batches multiple `setState` calls within event handlers into a single re-render. This means if you call `setCount(count + 1)` three times in one handler, you still only get one re-render with `count + 1` (not `count + 3`), because all three calls read the same stale `count`.",
      code: `// Bug: count + 1 three times → only increments by 1
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);

// Fix: functional form reads the latest queued value
setCount(prev => prev + 1);
setCount(prev => prev + 1);
setCount(prev => prev + 1); // increments by 3`,
    },
    {
      heading: "Initialisation — lazy initial state",
      body: "If computing the initial state is expensive, pass a **function** to `useState` instead of a value. React calls it only on the first render, not on every re-render.",
      code: `// Expensive computation runs every render: ✗
const [data, setData] = useState(computeExpensiveData());

// Lazy initialisation — called once: ✓
const [data, setData] = useState(() => computeExpensiveData());`,
    },
  ],
  visualizerSteps: [
    {
      description: "Component renders for the first time. useState(0) returns [0, setCount]. count = 0 is a constant for this render.",
      panels: [
        { title: "Render 1", color: "#61dafb", items: [{ label: "count = 0 (snapshot)", active: true }] },
        { title: "React state store", color: "#3fb950", items: [{ label: "slot[0] = 0" }] },
        { title: "setCount", color: "#8b949e", items: [{ label: "schedules re-render" }] },
      ],
      phase: "initial render",
    },
    {
      description: "handleClick fires: setCount(0 + 1). React queues a re-render with next state = 1. count is still 0 for the rest of this function.",
      panels: [
        { title: "Current render", color: "#61dafb", items: [{ label: "count = 0 (unchanged)", active: true }] },
        { title: "React queue", color: "#e3b341", items: [{ label: "next state: 1", active: true }] },
        { title: "console.log(count)", color: "#f85149", items: [{ label: "logs 0 (snapshot)", active: true }] },
      ],
      phase: "set state",
    },
    {
      description: "React re-renders the component. count is now 1. A new snapshot is created for this render.",
      panels: [
        { title: "Render 2", color: "#61dafb", items: [{ label: "count = 1 (new snapshot)", active: true }] },
        { title: "React state store", color: "#3fb950", items: [{ label: "slot[0] = 1", active: true }] },
      ],
      phase: "re-render",
    },
    {
      description: "Functional updater pattern: setCount(prev => prev + 1) reads the latest queued value, making batched calls safe.",
      panels: [
        { title: "setCount(prev => prev + 1)", color: "#3fb950", items: [{ label: "prev = 0 → 1", active: true }] },
        { title: "setCount(prev => prev + 1)", color: "#3fb950", items: [{ label: "prev = 1 → 2", active: true }] },
        { title: "setCount(prev => prev + 1)", color: "#3fb950", items: [{ label: "prev = 2 → 3", active: true }] },
      ],
      phase: "functional updater",
    },
  ],
  solution: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    // count is still the OLD value here (snapshot)
    console.log(count); // logs old value
  };

  // Fix: use functional updater for safe batched updates
  const handleBatchedClick = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // increments by 2 correctly
  };

  // Read updated state in useEffect after re-render:
  // useEffect(() => { console.log(count); }, [count]);

  return <button onClick={handleClick}>{count}</button>;
}`,
};
