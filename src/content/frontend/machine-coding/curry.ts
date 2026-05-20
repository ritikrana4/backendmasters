import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Implement Curry",
  difficulty: "Hard",
  category: "Machine Coding",
  problem: "Implement a `curry(fn)` function that transforms a multi-argument function into a chain of single-argument functions. `curry(add)(1)(2)(3)` should equal `add(1, 2, 3)`. Support partial application: `curry(add)(1, 2)(3)` should also work.",
  constraints: [
    "Use `fn.length` to determine the expected arity (number of arguments).",
    "Return a result once `args.length >= fn.length`; otherwise return a new function collecting more args.",
    "Support calling with **multiple arguments at once** at any step (partial application).",
  ],
  explanation: [
    {
      heading: "Core implementation",
      body: "Return a recursive `curried` function that collects arguments. If we have enough (≥ `fn.length`), call `fn`. Otherwise, return a new function that merges the new args with collected ones and calls `curried` again.",
      code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}`,
    },
    {
      heading: "Partial application vs currying",
      body: "**Currying** strictly transforms `f(a, b, c)` into `f(a)(b)(c)`. **Partial application** pre-fills some arguments, leaving the rest. Our implementation above supports both, because we accept any number of args at each step.",
      code: `const add = curry((a, b, c) => a + b + c);

// Curried (one at a time):
add(1)(2)(3); // 6

// Partial application (multiple at once):
add(1, 2)(3); // 6
add(1)(2, 3); // 6
add(1, 2, 3); // 6 — same as calling original

// Pre-load for reuse:
const addTen = add(10);
addTen(5)(2);  // 17
addTen(20)(1); // 31`,
    },
    {
      heading: "Limitations of fn.length",
      body: "`fn.length` does not count rest parameters (`...args`) or parameters with default values. If your function uses those, you'll need to pass the arity manually: `curry(fn, 3)`.",
    },
  ],
  visualizerSteps: [
    {
      description: "curry(fn) is called with fn = (a,b,c) => a+b+c. fn.length = 3. Returns 'curried' function.",
      panels: [
        { title: "curry call", color: "#a371f7", items: [{ label: "fn.length = 3", active: true }] },
        { title: "Returns", color: "#3fb950", items: [{ label: "curried()" }] },
      ],
      phase: "wrapping",
    },
    {
      description: "add(1) — curried([1]). args.length=1 < fn.length=3. Returns a new function closing over [1].",
      panels: [
        { title: "args", color: "#f0db4f", items: [{ label: "[1]", active: true }] },
        { title: "1 < 3?", color: "#e3b341", items: [{ label: "yes → return fn", active: true }] },
        { title: "closure", color: "#8b949e", items: [{ label: "remembers [1]" }] },
      ],
      phase: "collect",
    },
    {
      description: "add(1)(2) — curried([1, 2]). args.length=2 < 3. Returns function closing over [1, 2].",
      panels: [
        { title: "args", color: "#f0db4f", items: [{ label: "[1, 2]", active: true }] },
        { title: "2 < 3?", color: "#e3b341", items: [{ label: "yes → return fn", active: true }] },
        { title: "closure", color: "#8b949e", items: [{ label: "remembers [1, 2]" }] },
      ],
      phase: "collect",
    },
    {
      description: "add(1)(2)(3) — curried([1, 2, 3]). args.length=3 === fn.length=3. Call fn(1,2,3) → 6.",
      panels: [
        { title: "args", color: "#3fb950", items: [{ label: "[1, 2, 3]", active: true }] },
        { title: "3 >= 3?", color: "#3fb950", items: [{ label: "yes → call fn!", active: true }] },
        { title: "result", color: "#3fb950", items: [{ label: "fn(1,2,3) = 6", active: true }] },
      ],
      phase: "invoke",
    },
  ],
  solution: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

// Arrow function version (more concise):
const curry2 = fn => {
  const curried = (...args) =>
    args.length >= fn.length
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  return curried;
};

// Tests:
const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3));   // 6
console.log(add(1, 2)(3));   // 6
console.log(add(1)(2, 3));   // 6
console.log(add(1, 2, 3));   // 6

// Partial application / reuse:
const add5 = add(5);
console.log(add5(3)(2));     // 10
console.log(add5(10)(1));    // 16`,
  complexity: {
    time: "O(n²)",
    space: "O(n)",
    note: "Each call creates a new args array by concatenation: O(n) copies across n calls = O(n²) total copy work. Space is O(n) for the accumulated args array. In practice n is tiny (function arity), so this is negligible.",
  },
};
