import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "useEffect Hook",
  difficulty: "Medium",
  category: "React",
  problem: "Explain the `useEffect` dependency array. What does each of these run?\n\nuseEffect(() => {...});\nuseEffect(() => {...}, []);\nuseEffect(() => {...}, [count]);\nAlso explain cleanup functions and why you'd use them.",
  constraints: [
    "Without a dependency array, the effect runs after **every** render.",
    "Empty array `[]` means run once after mount (like `componentDidMount`).",
    "Return a **cleanup function** to run before the effect re-runs or on unmount.",
  ],
  explanation: [
    {
      heading: "The three dependency array patterns",
      body: "The dependency array tells React when to re-run the effect. React compares each value with the previous render's value using `Object.is`. If any value changed, the effect runs again.",
      items: [
        "**No array** — runs after every render. Use rarely — usually a missing dependency array that should have one.",
        "**`[]` (empty)** — runs once after the first render. For setup-once effects like subscribing to an external service.",
        "**`[dep1, dep2]`** — runs after first render AND whenever `dep1` or `dep2` changes.",
      ],
    },
    {
      heading: "Cleanup functions",
      body: "If your effect creates a subscription, timer, or listener, return a cleanup function. React calls it before running the effect again (with new deps) or when the component unmounts. Without cleanup, effects leak.",
      code: `useEffect(() => {
  const sub = eventBus.subscribe(handler);
  return () => sub.unsubscribe(); // cleanup before re-run / unmount
}, [handler]);

// Timer cleanup:
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id); // stop interval on unmount
}, []);`,
    },
    {
      heading: "Common mistake: missing dependencies",
      body: "If your effect uses a variable from the component (like `count`) but doesn't include it in the dependency array, you'll get a stale closure — the effect captures an old value of `count`. The ESLint rule `react-hooks/exhaustive-deps` catches this automatically.",
      code: `// Bug: effect uses 'count' but doesn't list it — stale value
useEffect(() => {
  console.log(count); // always logs the initial value
}, []); // ← missing 'count'

// Fix:
useEffect(() => {
  console.log(count);
}, [count]); // re-runs when count changes`,
    },
  ],
  visualizerSteps: [
    {
      description: "Component mounts. All three useEffect calls run after the first render completes.",
      panels: [
        { title: "After mount", color: "#61dafb", items: [{ label: "useEffect(fn) ✓", active: true }, { label: "useEffect(fn, []) ✓", active: true }, { label: "useEffect(fn, [count]) ✓", active: true }] },
        { title: "count = 0", color: "#3fb950", items: [{ label: "initial value" }] },
      ],
      phase: "mount",
    },
    {
      description: "count changes to 1. React re-renders. After render, effects with 'count' in deps run. Empty-dep effect does NOT run.",
      panels: [
        { title: "After render (count=1)", color: "#61dafb", items: [{ label: "useEffect(fn) ✓ (runs always)", active: true }, { label: "useEffect(fn, []) ✗ (no rerun)" }, { label: "useEffect(fn, [count]) ✓ (count changed)", active: true }] },
        { title: "count", color: "#3fb950", items: [{ label: "0 → 1", active: true }] },
      ],
      phase: "update",
    },
    {
      description: "Before running an effect again, React calls the previous render's cleanup. Cleanup prevents leaks.",
      panels: [
        { title: "cleanup (prev)", color: "#f85149", items: [{ label: "unsubscribe()", active: true }, { label: "clearTimeout()" }] },
        { title: "new effect", color: "#3fb950", items: [{ label: "subscribe() again", active: true }] },
      ],
      phase: "cleanup → re-run",
    },
    {
      description: "Component unmounts. React calls the final cleanup. Subscriptions, timers, and listeners are cleared.",
      panels: [
        { title: "On unmount", color: "#f85149", items: [{ label: "cleanup of all effects", active: true }] },
        { title: "Result", color: "#8b949e", items: [{ label: "no memory leaks" }] },
      ],
      phase: "unmount",
    },
  ],
  solution: `import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  // Runs once on mount, cleanup on unmount
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id); // cleanup
  }, []);

  // Runs on every render (no deps array)
  useEffect(() => {
    document.title = \`Timer: \${seconds}s\`;
  });

  // Runs when 'seconds' changes
  useEffect(() => {
    if (seconds === 60) console.log('1 minute!');
  }, [seconds]);

  return <p>{seconds}s</p>;
}`,
};
