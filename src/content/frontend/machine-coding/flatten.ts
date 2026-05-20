import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Flatten Nested Array",
  difficulty: "Easy",
  category: "Machine Coding",
  problem: "Implement `flatten(arr, depth)` that flattens a nested array up to the given depth. `flatten([1,[2,[3,[4]]]], 1)` → `[1, 2, [3, [4]]]`. Also implement a fully recursive version that flattens all levels.",
  constraints: [
    "At each level, iterate through items. If an item is an Array and `depth > 0`, recurse with `depth - 1`.",
    "If an item is not an array (or depth is 0), push it as-is.",
    "Infinite depth: replace depth check with `Array.isArray` check only.",
  ],
  explanation: [
    {
      heading: "Recursive approach",
      body: "For each element in the array: if it's an array AND we still have depth remaining, flatten it recursively with `depth - 1`. Otherwise, add it to the result directly. This naturally handles arbitrary nesting up to the specified depth.",
      code: `function flatten(arr, depth = 1) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

flatten([1, [2, [3]]]);          // [1, 2, [3]]  depth=1
flatten([1, [2, [3]]], 2);       // [1, 2, 3]
flatten([1, [2, [3]]], Infinity); // [1, 2, 3]`,
    },
    {
      heading: "Using reduce (functional style)",
      body: "The same logic can be written with `reduce` and `concat`. Slightly less readable but a common interview pattern to know.",
      code: `const flatten = (arr, depth = 1) =>
  depth === 0 ? arr.slice() :
  arr.reduce((acc, item) =>
    acc.concat(Array.isArray(item) ? flatten(item, depth - 1) : item), []);`,
    },
    {
      heading: "Built-in Array.prototype.flat",
      body: "Modern JavaScript has `Array.prototype.flat(depth)` built in. `arr.flat()` flattens one level, `arr.flat(Infinity)` fully flattens. Always mention this in an interview, then implement from scratch.",
    },
  ],
  visualizerSteps: [
    {
      description: "Input: [1, [2, [3, [4]]]], depth=2. Start iterating.",
      panels: [
        { title: "Input", color: "#f0db4f", items: [{ label: "1", active: true }, { label: "[2, [3, [4]]]" }] },
        { title: "result", color: "#3fb950", items: [], note: "[]" },
        { title: "depth", color: "#8b949e", items: [{ label: "2" }] },
      ],
      phase: "start",
    },
    {
      description: "Item 1: not an array → push 1. result=[1].",
      panels: [
        { title: "Current item", color: "#f0db4f", items: [{ label: "1 (not array)", active: true }] },
        { title: "result", color: "#3fb950", items: [{ label: "1", active: true }] },
        { title: "action", color: "#8b949e", items: [{ label: "push directly" }] },
      ],
      phase: "depth 2",
    },
    {
      description: "Item [2, [3, [4]]]: is array, depth=2 > 0. Recurse with depth=1.",
      panels: [
        { title: "Current item", color: "#f0db4f", items: [{ label: "[2, [3, [4]]]", active: true }] },
        { title: "action", color: "#e3b341", items: [{ label: "recurse(depth=1)", active: true }] },
        { title: "result", color: "#3fb950", items: [{ label: "1" }] },
      ],
      phase: "recurse",
    },
    {
      description: "At depth=1: item 2 pushed. Item [3,[4]] is array, depth=1>0 → recurse with depth=0.",
      panels: [
        { title: "depth=1 level", color: "#f0db4f", items: [{ label: "2 → push", active: true }, { label: "[3,[4]] → recurse(0)", active: true }] },
        { title: "result so far", color: "#3fb950", items: [{ label: "1, 2" }] },
      ],
      phase: "depth 1",
    },
    {
      description: "At depth=0: [3,[4]] is an array but depth=0 → push AS-IS. Final result: [1, 2, [3, [4]]].",
      panels: [
        { title: "depth=0 level", color: "#f0db4f", items: [{ label: "[3,[4]] (depth=0)", active: true }, { label: "push as-is" }] },
        { title: "Final result", color: "#3fb950", items: [{ label: "[1, 2, [3, [4]]]", active: true }] },
      ],
      phase: "done",
    },
  ],
  solution: `// Recursive implementation:
function flatten(arr, depth = 1) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

// Tests:
console.log(flatten([1, [2, 3]]));              // [1, 2, 3]
console.log(flatten([1, [2, [3, [4]]]], 1));    // [1, 2, [3, [4]]]
console.log(flatten([1, [2, [3, [4]]]], 2));    // [1, 2, 3, [4]]
console.log(flatten([1, [2, [3, [4]]]], Infinity)); // [1, 2, 3, 4]
console.log(flatten([]));                        // []

// Functional style with reduce:
const flatReduce = (arr, depth = 1) =>
  depth === 0 ? [...arr] :
  arr.reduce((acc, x) =>
    acc.concat(Array.isArray(x) ? flatReduce(x, depth - 1) : x), []);

// Built-in (always mention this):
[1, [2, [3]]].flat();         // [1, 2, [3]] depth=1
[1, [2, [3]]].flat(Infinity); // [1, 2, 3]`,
  complexity: {
    time: "O(n)",
    space: "O(n)",
    note: "We visit each element once: O(n) where n is the total number of elements across all nesting levels. Space is O(n) for the result array plus O(d) call stack depth where d is the nesting depth.",
  },
};
