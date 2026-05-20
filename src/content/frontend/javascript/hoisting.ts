import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Hoisting",
  difficulty: "Easy",
  category: "JavaScript",
  problem: "What is hoisting? Predict the output of this code and explain why:\n\nconsole.log(foo());\nconsole.log(bar);\nconsole.log(baz);\n\nfunction foo() { return 42; }\nvar bar = 'hello';\nlet baz = 'world';",
  constraints: [
    "**Function declarations** are fully hoisted — the function body is available anywhere in the scope.",
    "**`var`** declarations are hoisted and initialised to `undefined`.",
    "**`let`/`const`** declarations are hoisted but sit in the **Temporal Dead Zone** until the declaration line.",
  ],
  explanation: [
    {
      heading: "What the compiler does before running your code",
      body: "Before executing any code, the JavaScript engine does a **compilation pass** over the current scope. It finds all declarations (`function`, `var`, `let`, `const`) and 'hoists' them to the top of their scope. The difference is in **how** they're hoisted.",
    },
    {
      heading: "Function declarations are fully hoisted",
      body: "A `function` declaration is moved to the top of its scope **with its full body**. This is why you can call `foo()` before the `function foo` line appears in the source code — the function already exists by the time any code runs.",
      code: `// What you write:
console.log(greet()); // "hello" — works!
function greet() { return "hello"; }

// What the engine effectively sees:
function greet() { return "hello"; }  // hoisted to top
console.log(greet());`,
    },
    {
      heading: "var is hoisted — but only the declaration, not the assignment",
      body: "With `var bar = 'hello'`, the declaration (`var bar`) is hoisted but the assignment (`= 'hello'`) stays in place. Before the assignment line, `bar` is `undefined`.",
      code: `console.log(bar); // undefined  (not ReferenceError)
var bar = 'hello';
console.log(bar); // 'hello'

// Engine sees:
var bar;           // hoisted — undefined
console.log(bar);  // undefined
bar = 'hello';     // assignment stays here
console.log(bar);  // 'hello'`,
    },
    {
      heading: "let/const — hoisted into the Temporal Dead Zone",
      body: "The engine knows `baz` exists (it was hoisted) but accessing it before the declaration line causes a `ReferenceError`. This protected zone is called the **Temporal Dead Zone (TDZ)**. It exists to catch bugs where you use a variable before it's initialised.",
    },
  ],
  visualizerSteps: [
    {
      description: "Compilation pass: the engine scans the file and hoists all declarations before any code runs.",
      panels: [
        { title: "Fully hoisted", color: "#3fb950", items: [{ label: "function foo() {...}", active: true }] },
        { title: "Hoisted (undefined)", color: "#f0db4f", items: [{ label: "var bar = undefined", active: true }] },
        { title: "In TDZ", color: "#f85149", items: [{ label: "let baz (no value)", active: true }] },
      ],
      phase: "compilation",
    },
    {
      description: "Line 1: console.log(foo()). foo is already fully initialised — the function exists. Returns 42.",
      panels: [
        { title: "Call Stack", color: "#3fb950", items: [{ label: "foo() → 42", active: true }] },
        { title: "Memory", color: "#8b949e", items: [{ label: "foo: [Function]" }, { label: "bar: undefined" }, { label: "baz: TDZ" }] },
      ],
      phase: "runtime",
    },
    {
      description: "Line 2: console.log(bar). var bar was hoisted but not yet assigned. Prints: undefined (NOT a ReferenceError).",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "log(bar) → undefined", active: true }] },
        { title: "Memory", color: "#8b949e", items: [{ label: "foo: [Function]" }, { label: "bar: undefined", active: true }, { label: "baz: TDZ" }] },
      ],
      phase: "runtime",
    },
    {
      description: "Line 3: console.log(baz). baz is in the TDZ — the engine knows it exists but throws ReferenceError because it's not yet initialised.",
      panels: [
        { title: "Call Stack", color: "#f85149", items: [{ label: "log(baz) → ERROR", active: true }] },
        { title: "Memory", color: "#8b949e", items: [{ label: "baz: TDZ (inaccessible)", active: true }] },
        { title: "Output", color: "#e3b341", items: [{ label: "ReferenceError!", active: true }] },
      ],
      phase: "TDZ error",
    },
  ],
  solution: `// Output:
// 42           (foo is fully hoisted)
// undefined    (bar is hoisted, assignment not yet run)
// ReferenceError: Cannot access 'baz' before initialization

console.log(foo());  // 42 ✓
console.log(bar);    // undefined ✓
// console.log(baz); // ReferenceError ✗

function foo() { return 42; }
var bar = 'hello';
let baz = 'world';

// After the declarations:
console.log(bar); // 'hello'
console.log(baz); // 'world'`,
};
