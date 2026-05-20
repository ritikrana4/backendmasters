import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "var vs let vs const",
  difficulty: "Easy",
  category: "JavaScript",
  problem: "What are the differences between `var`, `let`, and `const`? Predict the output of each block and explain the scoping and hoisting rules for each.",
  constraints: [
    "`var` is **function-scoped** and is hoisted with value `undefined`.",
    "`let` and `const` are **block-scoped** and are hoisted but not initialised (Temporal Dead Zone).",
    "`const` requires an initial value and cannot be reassigned (but object properties can still change).",
  ],
  explanation: [
    {
      heading: "Scoping: function vs block",
      body: "`var` lives in the nearest **function** scope (or global). `let` and `const` live in the nearest **block** scope (`{}`, including `if`, `for`, and function bodies). This is why `var` leaks out of `for` loops but `let` does not.",
      code: `function example() {
  if (true) {
    var x = 1;   // function-scoped → visible outside if-block
    let y = 2;   // block-scoped → only inside this if-block
  }
  console.log(x); // 1 ✓
  console.log(y); // ReferenceError: y is not defined ✗
}`,
    },
    {
      heading: "Hoisting behaviour",
      body: "All three declarations are **hoisted** (moved to the top of their scope at compile time), but only `var` is initialised to `undefined`. `let` and `const` exist in the **Temporal Dead Zone** (TDZ) from the start of their scope until the declaration line — accessing them before that line throws a `ReferenceError`.",
      code: `console.log(a); // undefined  (var hoisted + initialised)
console.log(b); // ReferenceError (let in TDZ)

var a = 1;
let b = 2;`,
    },
    {
      heading: "const and object mutation",
      body: "`const` prevents **reassignment** of the variable binding — the pointer cannot change. But if the value is an object or array, the contents can still be mutated. Use `Object.freeze()` if you need deep immutability.",
      code: `const obj = { name: "Alice" };
obj.name = "Bob";    // ✓ mutation allowed — pointer didn't change
obj = {};            // TypeError: Assignment to constant variable

const arr = [1, 2];
arr.push(3);         // ✓ [1, 2, 3]
arr = [];            // TypeError`,
    },
  ],
  visualizerSteps: [
    {
      description: "var is hoisted to the top of the function scope and initialised to undefined. You can read it before its declaration line — you just get undefined.",
      panels: [
        { title: "var x", color: "#f85149", items: [{ label: "scope: function", active: true }, { label: "hoisted: undefined" }, { label: "TDZ: NO" }] },
        { title: "let y", color: "#f0db4f", items: [{ label: "scope: block" }, { label: "hoisted: TDZ" }, { label: "read before decl: Error" }] },
        { title: "const z", color: "#3fb950", items: [{ label: "scope: block" }, { label: "hoisted: TDZ" }, { label: "reassign: Error" }] },
      ],
      phase: "declaration",
    },
    {
      description: "Inside a for loop: var leaks out because it's function-scoped. let stays inside the loop block.",
      panels: [
        { title: "for (var i)", color: "#f85149", items: [{ label: "i visible after loop", active: true }, { label: "one shared i" }] },
        { title: "for (let j)", color: "#f0db4f", items: [{ label: "j not visible after", active: true }, { label: "new j per iteration" }] },
      ],
      phase: "scoping",
    },
    {
      description: "const: the binding (pointer) is frozen. The pointed-to object is not. Mutating a property is fine; reassigning the variable throws.",
      panels: [
        { title: "const obj = {}", color: "#3fb950", items: [{ label: "obj.x = 1  ✓", active: true }, { label: "obj = {} → TypeError" }] },
        { title: "Heap", color: "#8b949e", items: [{ label: "{ x: 1 } (mutable)" }] },
      ],
      phase: "const",
    },
    {
      description: "Summary: prefer const by default, use let when you need to reassign, avoid var in modern code.",
      panels: [
        { title: "Use const", color: "#3fb950", items: [{ label: "default choice", active: true }, { label: "signals no reassignment" }] },
        { title: "Use let", color: "#f0db4f", items: [{ label: "loop counters" }, { label: "reassignable values" }] },
        { title: "Avoid var", color: "#f85149", items: [{ label: "function scoping confuses" }, { label: "hoisting surprises" }] },
      ],
      phase: "summary",
    },
  ],
  solution: `// Scoping
function scope() {
  if (true) {
    var a = 1;  // function-scoped
    let b = 2;  // block-scoped
  }
  console.log(a); // 1
  // console.log(b); // ReferenceError
}

// Hoisting + TDZ
// console.log(x); // ReferenceError (TDZ)
let x = 5;

// const + mutation
const obj = { count: 0 };
obj.count++;         // fine
// obj = {};         // TypeError

// Loop: prefer let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}`,
};
