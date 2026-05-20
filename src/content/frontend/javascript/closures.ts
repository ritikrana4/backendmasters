import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Closures",
  difficulty: "Medium",
  category: "JavaScript",
  problem: "What is a closure? Explain what the following code prints and why. Then fix the classic loop bug:\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n// prints: 3, 3, 3 — why?",
  constraints: [
    "A closure is a function that **remembers** the variables from its outer scope even after that scope has exited.",
    "`var` is function-scoped, not block-scoped — all three callbacks share the **same** `i`.",
    "Fix using `let` (block-scoped) or an IIFE to capture the current value.",
  ],
  explanation: [
    {
      heading: "What is a closure?",
      body: "A closure is formed when a function is defined inside another scope and **retains a live reference** to variables in that outer scope — not a copy of the value, but the variable itself. When the outer function returns, the inner function still holds a reference to that environment.",
      code: `function makeCounter() {
  let count = 0;           // 'count' lives in makeCounter's scope
  return function() {
    count++;               // inner fn closes over 'count'
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2  ← same 'count' variable, not a copy`,
    },
    {
      heading: "Why the loop prints 3, 3, 3",
      body: "The three `setTimeout` callbacks all close over the **same `i`** variable (because `var` is function-scoped). The callbacks don't run until the loop has already finished — by then `i === 3`. They all read the final value.",
      items: [
        "`var i` is hoisted to function scope — there is only **one** `i` for all three iterations.",
        "The `setTimeout` callbacks are scheduled for later (event loop), after the loop completes.",
        "Loop finishes with `i === 3`. All three callbacks then run, each reading `i` → `3`.",
      ],
    },
    {
      heading: "Two fixes",
      body: "Either use `let` (which creates a new binding per iteration) or an IIFE to capture the current value of `i`.",
      code: `// Fix 1: let — each iteration gets its own block-scoped 'i'
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2 ✓
}

// Fix 2: IIFE — immediately captures the current value as parameter j
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 0); // 0, 1, 2 ✓
  })(i);
}`,
    },
  ],
  visualizerSteps: [
    {
      description: "makeCounter() is called. A new scope is created with count = 0. The inner function is returned and assigned to 'counter'.",
      panels: [
        { title: "makeCounter scope", color: "#f0db4f", items: [{ label: "count = 0", active: true }] },
        { title: "Returned function", color: "#3fb950", items: [{ label: "closes over: count", active: true }] },
        { title: "outer scope", color: "#8b949e", items: [{ label: "counter = fn" }] },
      ],
      phase: "closure created",
    },
    {
      description: "makeCounter() has returned and its stack frame is gone — but count still exists in memory because counter holds a reference to it.",
      panels: [
        { title: "makeCounter scope", color: "#f0db4f", items: [{ label: "count = 0 (heap)" }] },
        { title: "counter fn", color: "#3fb950", items: [{ label: "[[Scope]] → count", active: true }] },
        { title: "outer scope", color: "#8b949e", items: [{ label: "counter = fn" }] },
      ],
      phase: "scope survives",
    },
    {
      description: "counter() is called. The inner function increments count (now 1) and returns 1. The closure mutates the shared variable.",
      panels: [
        { title: "makeCounter scope", color: "#f0db4f", items: [{ label: "count = 1", active: true }] },
        { title: "counter fn", color: "#3fb950", items: [{ label: "count++ → returns 1", active: true }] },
        { title: "outer scope", color: "#8b949e", items: [{ label: "counter = fn" }] },
      ],
      phase: "mutation",
    },
    {
      description: "counter() called again. count increments to 2 — same variable. This is the key: closures share a live reference, not a snapshot.",
      panels: [
        { title: "makeCounter scope", color: "#f0db4f", items: [{ label: "count = 2", active: true }] },
        { title: "counter fn", color: "#3fb950", items: [{ label: "count++ → returns 2", active: true }] },
        { title: "outer scope", color: "#8b949e", items: [{ label: "counter = fn" }] },
      ],
      phase: "mutation",
    },
    {
      description: "The loop bug: var i is ONE variable shared across all iterations. All 3 setTimeout callbacks close over the SAME i.",
      panels: [
        { title: "var i (shared)", color: "#f85149", items: [{ label: "i = 3 (after loop)", active: true }] },
        { title: "callback 1", color: "#8b949e", items: [{ label: "reads i → 3" }] },
        { title: "callback 2", color: "#8b949e", items: [{ label: "reads i → 3" }] },
        { title: "callback 3", color: "#8b949e", items: [{ label: "reads i → 3" }] },
      ],
      phase: "bug",
    },
    {
      description: "Fix with let: each iteration creates a NEW binding for i. Each callback closes over its own copy of i.",
      panels: [
        { title: "let i=0 (iter 0)", color: "#3fb950", items: [{ label: "callback reads 0", active: true }] },
        { title: "let i=1 (iter 1)", color: "#3fb950", items: [{ label: "callback reads 1", active: true }] },
        { title: "let i=2 (iter 2)", color: "#3fb950", items: [{ label: "callback reads 2", active: true }] },
      ],
      phase: "fixed",
    },
  ],
  solution: `// Classic closure: counter factory
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2

// Loop bug fix using let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2

}

// Loop bug fix using IIFE (ES5 compatible)
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 0))(i); // 0, 1, 2
}`,
};
