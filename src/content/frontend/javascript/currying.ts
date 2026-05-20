import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Currying",
  difficulty: "Medium",
  category: "JavaScript",
  problem: "What is currying? Implement a `curry` function that transforms `add(a, b, c)` into `add(a)(b)(c)`. Also write a general `curry(fn)` that works for any function.",
  constraints: [
    "Currying transforms `f(a, b, c)` into `f(a)(b)(c)` — each call returns a function until all args are collected.",
    "A curried function returns a new function (or the final result) based on whether enough arguments have been provided.",
    "Use `fn.length` to get the function's declared arity (number of expected parameters).",
  ],
  explanation: [
    {
      heading: "What is currying?",
      body: "Currying is the technique of transforming a function that takes **multiple arguments** into a sequence of functions that each take **one argument**. Named after mathematician Haskell Curry. It enables **partial application** — fixing some arguments upfront and supplying the rest later.",
      code: `// Normal function:
const add = (a, b, c) => a + b + c;
add(1, 2, 3); // 6

// Curried version:
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3); // 6
curriedAdd(1)(2);    // returns a function waiting for c
const addOne = curriedAdd(1); // partial application`,
    },
    {
      heading: "Implementing a general curry function",
      body: "A general `curry(fn)` wrapper should collect arguments across calls and invoke `fn` once it has enough. We check `fn.length` (the arity) against how many args have been collected so far.",
      code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);          // all args collected — invoke
    }
    return function(...moreArgs) { // not enough yet — collect more
      return curried(...args, ...moreArgs);
    };
  };
}

const add = curry((a, b, c) => a + b + c);
add(1)(2)(3);    // 6
add(1, 2)(3);    // 6  ← partial calls can take multiple args
add(1)(2, 3);    // 6
add(1, 2, 3);    // 6`,
    },
    {
      heading: "Real-world use: partial application",
      body: "Currying enables **partial application** — pre-loading some arguments to create specialised functions. This is very common in functional programming and utility libraries like lodash/fp.",
      code: `const multiply = curry((factor, n) => factor * n);
const double = multiply(2);    // pre-load factor=2
const triple = multiply(3);    // pre-load factor=3

[1, 2, 3, 4].map(double); // [2, 4, 6, 8]
[1, 2, 3, 4].map(triple); // [3, 6, 9, 12]`,
    },
  ],
  visualizerSteps: [
    {
      description: "curry(fn) wraps the original function. It returns 'curried', which collects arguments.",
      panels: [
        { title: "curry(add)", color: "#f0db4f", items: [{ label: "fn = (a,b,c)=>...", active: true }, { label: "fn.length = 3" }] },
        { title: "Returns", color: "#3fb950", items: [{ label: "curried(...args)" }] },
      ],
      phase: "wrapping",
    },
    {
      description: "add(1) — args=[1], fn.length=3. Not enough. Returns a new function that closes over args=[1].",
      panels: [
        { title: "args collected", color: "#f0db4f", items: [{ label: "[1]", active: true }] },
        { title: "needed", color: "#8b949e", items: [{ label: "fn.length = 3" }] },
        { title: "decision", color: "#f85149", items: [{ label: "1 < 3 → return fn", active: true }] },
      ],
      phase: "collecting",
    },
    {
      description: "add(1)(2) — args=[1,2], still not 3. Returns another function closing over [1,2].",
      panels: [
        { title: "args collected", color: "#f0db4f", items: [{ label: "[1, 2]", active: true }] },
        { title: "needed", color: "#8b949e", items: [{ label: "fn.length = 3" }] },
        { title: "decision", color: "#f85149", items: [{ label: "2 < 3 → return fn", active: true }] },
      ],
      phase: "collecting",
    },
    {
      description: "add(1)(2)(3) — args=[1,2,3]. args.length >= fn.length. Call the original fn(1,2,3) and return 6.",
      panels: [
        { title: "args collected", color: "#3fb950", items: [{ label: "[1, 2, 3]", active: true }] },
        { title: "needed", color: "#8b949e", items: [{ label: "fn.length = 3" }] },
        { title: "result", color: "#3fb950", items: [{ label: "fn(1,2,3) = 6", active: true }] },
      ],
      phase: "invoke",
    },
  ],
  solution: `// Simple manual curry for 3 args:
const add = a => b => c => a + b + c;
console.log(add(1)(2)(3)); // 6

// General curry function:
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
}

const multiply = curry((a, b) => a * b);
const double = multiply(2);
console.log(double(5));  // 10
console.log(double(10)); // 20

const add3 = curry((a, b, c) => a + b + c);
console.log(add3(1)(2)(3));    // 6
console.log(add3(1, 2)(3));    // 6
console.log(add3(1)(2, 3));    // 6`,
};
