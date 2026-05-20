import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "The this Keyword",
  difficulty: "Medium",
  category: "JavaScript",
  problem: "What does `this` refer to in each of these contexts? Predict each output:\n\nconst obj = {\n  name: 'Alice',\n  greet() { console.log(this.name); },\n  greetArrow: () => console.log(this.name),\n};\nobj.greet();\nobj.greetArrow();\nconst fn = obj.greet;\nfn();",
  constraints: [
    "`this` is determined at **call time**, not at definition time (except for arrow functions).",
    "Arrow functions **do not have their own `this`** — they inherit it from the enclosing lexical scope.",
    "In non-strict mode, a standalone function call sets `this` to the global object. In strict mode, it's `undefined`.",
  ],
  explanation: [
    {
      heading: "The four binding rules",
      body: "There are four rules that determine what `this` is. They apply in priority order: new binding > explicit binding (.call/.apply/.bind) > implicit binding (method call) > default binding.",
      items: [
        "**Default binding** — standalone `fn()` call → `this` is `globalThis` (or `undefined` in strict mode)",
        "**Implicit binding** — `obj.method()` call → `this` is the object to the left of the dot (`obj`)",
        "**Explicit binding** — `fn.call(ctx)`, `fn.apply(ctx)`, `fn.bind(ctx)` → `this` is `ctx`",
        "**new binding** — `new Fn()` → `this` is the newly created object",
      ],
    },
    {
      heading: "Arrow functions — lexical this",
      body: "Arrow functions are special: they **capture `this` from the enclosing lexical scope** at definition time. `greetArrow` is defined at the top level of the module (or global scope), so its `this` is the module's `this` (which is `undefined` in ES modules, or `globalThis` in scripts). It does NOT get `obj` as `this` even when called as `obj.greetArrow()`.",
    },
    {
      heading: "Lost context — the detached method bug",
      body: "When you assign `const fn = obj.greet` and then call `fn()`, the function is detached from `obj`. The call site has no object prefix, so `this` falls back to default binding — `globalThis.name` (probably `undefined`) or a `TypeError` in strict mode.",
      code: `const obj = { name: 'Alice', greet() { console.log(this.name); } };

obj.greet();                    // 'Alice' — implicit binding
const fn = obj.greet;
fn();                           // undefined — default binding (lost context)
fn.call(obj);                   // 'Alice' — explicit binding restored
const bound = obj.greet.bind(obj);
bound();                        // 'Alice' — permanently bound`,
    },
  ],
  visualizerSteps: [
    {
      description: "obj.greet() — implicit binding. The call site has 'obj' to the left of the dot. this = obj. Prints 'Alice'.",
      panels: [
        { title: "Call site", color: "#f0db4f", items: [{ label: "obj.greet()", active: true }] },
        { title: "this inside greet", color: "#3fb950", items: [{ label: "this = obj", active: true }, { label: "this.name = 'Alice'" }] },
        { title: "Output", color: "#8b949e", items: [{ label: "'Alice'" }] },
      ],
      phase: "implicit binding",
    },
    {
      description: "obj.greetArrow() — arrow function. this is NOT determined by the call site. It was captured when defined: the enclosing scope is the module/global level, not obj.",
      panels: [
        { title: "Call site", color: "#f0db4f", items: [{ label: "obj.greetArrow()", active: true }] },
        { title: "this inside greetArrow", color: "#f85149", items: [{ label: "this = lexical scope", active: true }, { label: "= undefined / global" }] },
        { title: "Output", color: "#8b949e", items: [{ label: "undefined" }] },
      ],
      phase: "arrow (lexical this)",
    },
    {
      description: "const fn = obj.greet; fn() — detached method. No object prefix at call site → default binding. this = globalThis (or undefined in strict mode).",
      panels: [
        { title: "Call site", color: "#f0db4f", items: [{ label: "fn()", active: true }] },
        { title: "this inside greet", color: "#f85149", items: [{ label: "this = globalThis", active: true }, { label: "globalThis.name → undefined" }] },
        { title: "Output", color: "#8b949e", items: [{ label: "undefined" }] },
      ],
      phase: "default binding",
    },
    {
      description: "Fix with .bind(obj) — permanently locks this to obj regardless of how the function is called later.",
      panels: [
        { title: "fn.bind(obj)", color: "#3fb950", items: [{ label: "returns new bound fn", active: true }] },
        { title: "bound()", color: "#3fb950", items: [{ label: "this = obj (always)", active: true }] },
        { title: "Output", color: "#8b949e", items: [{ label: "'Alice'" }] },
      ],
      phase: "explicit binding",
    },
  ],
  solution: `const obj = {
  name: 'Alice',
  greet() { console.log(this.name); },
  greetArrow: () => console.log(this?.name),
};

obj.greet();       // 'Alice'   — implicit binding (this = obj)
obj.greetArrow();  // undefined — arrow, lexical this (not obj)
const fn = obj.greet;
fn();              // undefined — default binding (lost context)

// Fixes:
fn.call(obj);                          // 'Alice'
const bound = obj.greet.bind(obj);
bound();                               // 'Alice'

// Class methods have the same issue — use arrow or bind in constructor:
class Foo {
  name = 'Bob';
  greet = () => console.log(this.name); // arrow: safe to detach
}`,
};
