import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Context API",
  difficulty: "Medium",
  category: "React",
  problem: "What is the React Context API and when should you use it? Implement a theme toggle using Context. What is the performance concern with Context and how do you mitigate it?",
  constraints: [
    "Context lets you pass data through the component tree **without prop drilling** at every level.",
    "Any component that calls `useContext(MyContext)` will **re-render whenever the context value changes** — even if the part it reads didn't change.",
    "Context is best for **infrequently changing global data**: theme, locale, auth user. Not for high-frequency updates like mouse position.",
  ],
  explanation: [
    {
      heading: "The prop drilling problem",
      body: "When many levels of nested components all need the same data (e.g., current user), you'd have to pass it as a prop through every intermediate component — even ones that don't use it directly. Context eliminates this by making the value available to any descendant that opts in.",
    },
    {
      heading: "How Context works",
      body: "You create a context with `createContext(defaultValue)`. Wrap a subtree with `<Context.Provider value={...}>`. Any descendant can call `useContext(Context)` to read the current value. When the Provider's `value` changes, all consumers re-render.",
      code: `const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}

function Button() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}`,
    },
    {
      heading: "Performance concern — split your contexts",
      body: "If you put both `theme` and `user` in one context, a user-profile update forces all theme consumers to re-render too. The fix: use separate contexts for separate concerns. Each component only subscribes to what it needs.",
    },
  ],
  visualizerSteps: [
    {
      description: "Without Context: data must be passed through every intermediate component, even those that don't need it (prop drilling).",
      panels: [
        { title: "App (has user)", color: "#f85149", items: [{ label: "user={...}", active: true }] },
        { title: "Layout (passes it)", color: "#f85149", items: [{ label: "user={user}", active: true }] },
        { title: "Sidebar (passes it)", color: "#f85149", items: [{ label: "user={user}", active: true }] },
        { title: "Avatar (uses it)", color: "#3fb950", items: [{ label: "user.name ✓" }] },
      ],
      phase: "prop drilling",
    },
    {
      description: "With Context: Provider wraps the tree. Avatar calls useContext and gets the value directly — no intermediaries.",
      panels: [
        { title: "UserContext.Provider", color: "#3fb950", items: [{ label: "value={user}", active: true }] },
        { title: "Layout", color: "#8b949e", items: [{ label: "(no user prop needed)" }] },
        { title: "Sidebar", color: "#8b949e", items: [{ label: "(no user prop needed)" }] },
        { title: "Avatar (consumer)", color: "#3fb950", items: [{ label: "useContext → user ✓", active: true }] },
      ],
      phase: "context",
    },
    {
      description: "Performance issue: ONE context value changes → ALL consumers re-render. ThemeContext + UserContext in one object: user update re-renders theme consumers.",
      panels: [
        { title: "Combined context", color: "#f85149", items: [{ label: "value={theme, user}", active: true }] },
        { title: "Theme consumer", color: "#f85149", items: [{ label: "re-renders on user change (unnecessary!)", active: true }] },
      ],
      phase: "performance problem",
    },
    {
      description: "Fix: split contexts. Theme consumers only re-render when theme changes. User consumers only re-render on user changes.",
      panels: [
        { title: "ThemeContext", color: "#3fb950", items: [{ label: "value={theme}" }] },
        { title: "UserContext", color: "#3fb950", items: [{ label: "value={user}" }] },
        { title: "Components", color: "#3fb950", items: [{ label: "subscribe only to what they need", active: true }] },
      ],
      phase: "fix: split contexts",
    },
  ],
  solution: `import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Usage in any descendant:
function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header style={{ background: theme === 'dark' ? '#000' : '#fff' }}>
      <button onClick={toggle}>Toggle Theme</button>
    </header>
  );
}`,
};
