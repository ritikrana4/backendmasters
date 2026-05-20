import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Custom Hooks",
  difficulty: "Medium",
  category: "React",
  problem: "What are custom hooks and why do they exist? Implement `useFetch(url)` that returns `{ data, loading, error }`. What are the rules of hooks and why do they exist?",
  constraints: [
    "Custom hooks are **regular JavaScript functions** that start with `use` and call other hooks.",
    "They let you **extract and share stateful logic** between components — not UI, just behaviour.",
    "Rules of hooks: only call hooks at the **top level** (not inside conditions/loops), and only from React functions.",
  ],
  explanation: [
    {
      heading: "Why custom hooks?",
      body: "Before hooks, sharing stateful logic required render props or HOCs — complex patterns that added extra component layers. Custom hooks let you extract `useState`/`useEffect`/`useContext` logic into a reusable function that any component can call. The hook owns the state — two components using the same hook get **independent** state.",
    },
    {
      heading: "The rules of hooks — and why",
      body: "React tracks which hook call corresponds to which state by their **call order** on each render. If you call hooks conditionally, the order can change between renders — React would assign the wrong state to the wrong hook.",
      items: [
        "**Only call hooks at the top level** — not inside `if`, `for`, or nested functions. This guarantees the same hooks run in the same order on every render.",
        "**Only call hooks from React functions** — components or other custom hooks. Not regular JS functions, class methods, or event listeners.",
      ],
    },
    {
      heading: "useFetch — a practical custom hook",
      body: "A common pattern: encapsulate `fetch` + loading/error state into a `useFetch` hook. The component just calls `useFetch(url)` and gets back the status — all the effect logic stays in the hook.",
      code: `function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; }; // prevent stale update
  }, [url]);

  return { data, loading, error };
}`,
    },
  ],
  visualizerSteps: [
    {
      description: "Without custom hook: both UserProfile and PostList duplicate the same fetch + loading + error logic.",
      panels: [
        { title: "UserProfile", color: "#f85149", items: [{ label: "useState(null)", active: true }, { label: "useState(true)", active: true }, { label: "useEffect(fetch...)" }] },
        { title: "PostList", color: "#f85149", items: [{ label: "useState(null)", active: true }, { label: "useState(true)", active: true }, { label: "useEffect(fetch...)" }] },
      ],
      phase: "duplicated logic",
    },
    {
      description: "With useFetch: logic lives once in the hook. Both components call useFetch(url) and get independent state.",
      panels: [
        { title: "useFetch (shared logic)", color: "#3fb950", items: [{ label: "data, loading, error", active: true }] },
        { title: "UserProfile", color: "#61dafb", items: [{ label: "useFetch('/user') ✓" }] },
        { title: "PostList", color: "#61dafb", items: [{ label: "useFetch('/posts') ✓" }] },
      ],
      phase: "custom hook",
    },
    {
      description: "useFetch('/user') is called. useEffect fires. Fetch starts. loading=true, data=null.",
      panels: [
        { title: "useFetch state", color: "#f0db4f", items: [{ label: "loading: true", active: true }, { label: "data: null" }, { label: "error: null" }] },
        { title: "Effect", color: "#8b949e", items: [{ label: "fetch('/user') in progress" }] },
      ],
      phase: "loading",
    },
    {
      description: "Fetch resolves. setData(result), setLoading(false). Component re-renders with data.",
      panels: [
        { title: "useFetch state", color: "#3fb950", items: [{ label: "loading: false" }, { label: "data: {name: 'Alice'}", active: true }, { label: "error: null" }] },
        { title: "Component", color: "#61dafb", items: [{ label: "renders user data ✓" }] },
      ],
      phase: "resolved",
    },
  ],
  solution: `import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Usage:
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(\`/api/users/\${userId}\`);
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <h1>{user.name}</h1>;
}`,
};
