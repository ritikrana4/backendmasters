import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Controlled vs Uncontrolled",
  difficulty: "Easy",
  category: "React",
  problem: "What is the difference between a controlled and uncontrolled component in React? When would you use each? Show an example of each with a text input.",
  constraints: [
    "**Controlled**: React state is the single source of truth. Input value is set by `value` prop and updated via `onChange`.",
    "**Uncontrolled**: The DOM manages its own state. You read the value via a `ref` when you need it.",
    "Controlled components give React full control — validation, conditional disable, and derived UI are easy. Uncontrolled components are simpler for one-off reads.",
  ],
  explanation: [
    {
      heading: "Controlled components",
      body: "A controlled input has its `value` prop driven by React state. Every keystroke fires `onChange`, which updates state, which re-renders the input with the new value. React is the **single source of truth** — the DOM input always reflects the state.",
      code: `function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}
// value is always in sync with React state
// can validate, transform, derive UI from it at any time`,
    },
    {
      heading: "Uncontrolled components",
      body: "An uncontrolled input lets the **DOM manage its own state**. You use a `ref` to read the value when you need it (typically on form submit). The input has `defaultValue` (not `value`) to set the initial value without controlling it.",
      code: `function UncontrolledInput() {
  const inputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value); // read on submit
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="initial" />
      <button type="submit">Submit</button>
    </form>
  );
}`,
    },
    {
      heading: "When to use each",
      body: "Use **controlled** when you need to: validate input on every keystroke, conditionally disable the submit button, enforce input formatting, or derive other UI from the input value. Use **uncontrolled** when you only need the value once (on submit) and don't need per-keystroke feedback — simpler, less boilerplate.",
    },
  ],
  visualizerSteps: [
    {
      description: "Controlled: user types 'H'. onChange fires → setValue('H') → re-render → input.value = 'H'. React owns the truth.",
      panels: [
        { title: "User types 'H'", color: "#f0db4f", items: [{ label: "onChange fires", active: true }] },
        { title: "React state", color: "#61dafb", items: [{ label: "value: 'H'", active: true }] },
        { title: "DOM input", color: "#3fb950", items: [{ label: "value='H' (from state)", active: true }] },
      ],
      phase: "controlled",
    },
    {
      description: "Controlled: validation is easy. If value doesn't match a rule, show an error or disable submit — React sees every character.",
      panels: [
        { title: "value = 'ab'", color: "#f0db4f", items: [{ label: "length < 3" }] },
        { title: "Derived UI", color: "#3fb950", items: [{ label: "submit disabled", active: true }, { label: "error: 'too short'" }] },
      ],
      phase: "validation",
    },
    {
      description: "Uncontrolled: DOM manages the input. React doesn't track keystrokes. On submit, ref.current.value reads the current DOM value.",
      panels: [
        { title: "User types", color: "#8b949e", items: [{ label: "DOM updates itself" }] },
        { title: "React", color: "#8b949e", items: [{ label: "no re-renders", active: true }] },
        { title: "On submit", color: "#3fb950", items: [{ label: "ref.current.value", active: true }] },
      ],
      phase: "uncontrolled",
    },
    {
      description: "defaultValue vs value: defaultValue sets initial DOM state and then lets the DOM take over. value={...} means React stays in control every render.",
      panels: [
        { title: "defaultValue='x'", color: "#f0db4f", items: [{ label: "initial DOM value = x" }, { label: "DOM controls updates" }] },
        { title: "value='x'", color: "#61dafb", items: [{ label: "React controls updates", active: true }, { label: "need onChange or input freezes" }] },
      ],
      phase: "default vs controlled",
    },
  ],
  solution: `import { useState, useRef } from 'react';

// Controlled — React owns the value
function ControlledForm() {
  const [email, setEmail] = useState('');
  const isValid = email.includes('@');

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button disabled={!isValid}>Submit</button>
      {!isValid && <span>Enter a valid email</span>}
    </form>
  );
}

// Uncontrolled — DOM owns the value, read on submit
function UncontrolledForm() {
  const nameRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(nameRef.current.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}`,
};
