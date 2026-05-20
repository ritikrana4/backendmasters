import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "The Event Loop",
  difficulty: "Medium",
  category: "JavaScript",
  problem: "Explain how JavaScript's event loop works. Given the following code, what is the order of console.log outputs and why?\n\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
  constraints: [
    "JavaScript is **single-threaded** — only one thing runs at a time.",
    "setTimeout with 0ms delay does NOT run immediately — it goes through the callback queue.",
    "Promise `.then` callbacks go to the **microtask queue**, which has higher priority than the callback queue.",
  ],
  explanation: [
    {
      heading: "The three queues",
      body: "JavaScript has one **call stack** where code runs, and two task queues that feed it work when it's empty. Understanding the priority order of these queues explains all async behaviour.",
      items: [
        "**Call Stack** — where synchronous code executes, one frame at a time.",
        "**Microtask Queue** — holds Promise `.then`/`.catch`/`.finally` callbacks and `queueMicrotask()` calls. **Drained completely** before the next task runs.",
        "**Callback Queue** (Macrotask Queue) — holds `setTimeout`, `setInterval`, I/O, and UI event callbacks. One task is picked up per event loop tick.",
      ],
    },
    {
      heading: "The event loop algorithm",
      body: "The event loop runs one iteration ('tick') at a time. On each tick: execute the current call stack to completion, then drain ALL microtasks, then pick ONE macrotask (callback queue item) and execute it — which may queue more microtasks, which are drained again before the next macrotask.",
      code: `// Simplified event loop algorithm:
// 1. Execute script (synchronous code fills the call stack)
// 2. Stack empty? → drain ALL microtasks (Promise .then callbacks)
// 3. Pick ONE macrotask (setTimeout callback)
// 4. After that macrotask: drain ALL microtasks again
// 5. Repeat`,
    },
    {
      heading: "Tracing the example",
      body: "Step through the example line by line to see which queue each callback lands in.",
      items: [
        "**console.log('A')** — synchronous, runs immediately → prints `A`",
        "**setTimeout(fn, 0)** — registers a macrotask, the callback goes to the Callback Queue after ~0ms",
        "**Promise.resolve().then(fn)** — the promise is already resolved, the `.then` callback goes immediately to the Microtask Queue",
        "**console.log('D')** — synchronous, runs immediately → prints `D`",
        "**Stack is now empty** → event loop drains microtasks first → prints `C`",
        "**Microtask queue empty** → event loop picks the setTimeout callback → prints `B`",
        "**Final order: A, D, C, B**",
      ],
    },
  ],
  visualizerSteps: [
    {
      description: "Script starts. console.log('A') is pushed onto the call stack and executes. Output so far: A",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "console.log('A')", active: true }] },
        { title: "Microtask Queue", color: "#61dafb", items: [], note: "empty" },
        { title: "Callback Queue", color: "#f85149", items: [], note: "empty" },
      ],
      phase: "sync",
    },
    {
      description: "setTimeout(() => log('B'), 0) is called. The Web API registers a timer. The callback will arrive in the Callback Queue after the current script finishes.",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "setTimeout(fn, 0)", active: true }] },
        { title: "Microtask Queue", color: "#61dafb", items: [], note: "empty" },
        { title: "Callback Queue", color: "#f85149", items: [], note: "pending (timer)" },
      ],
      phase: "sync",
    },
    {
      description: "Promise.resolve().then(fn) — the promise resolves immediately. The .then callback is placed in the Microtask Queue right now.",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "Promise.resolve().then()", active: true }] },
        { title: "Microtask Queue", color: "#61dafb", items: [{ label: "() => log('C')", active: true }] },
        { title: "Callback Queue", color: "#f85149", items: [], note: "empty" },
      ],
      phase: "sync",
    },
    {
      description: "console.log('D') executes synchronously. Output so far: A, D. Call stack is now empty.",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "console.log('D')", active: true }] },
        { title: "Microtask Queue", color: "#61dafb", items: [{ label: "() => log('C')" }] },
        { title: "Callback Queue", color: "#f85149", items: [{ label: "() => log('B')" }] },
      ],
      phase: "sync",
    },
    {
      description: "Call stack is empty. Event loop checks microtasks FIRST. Drains the Promise .then callback → prints C. Output: A, D, C",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "() => log('C')", active: true }] },
        { title: "Microtask Queue", color: "#61dafb", items: [], note: "drained!" },
        { title: "Callback Queue", color: "#f85149", items: [{ label: "() => log('B')" }] },
      ],
      phase: "microtask",
    },
    {
      description: "Microtask queue is empty. Now the event loop picks ONE macrotask from the Callback Queue → the setTimeout callback runs → prints B. Final output: A, D, C, B",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "() => log('B')", active: true }] },
        { title: "Microtask Queue", color: "#61dafb", items: [], note: "empty" },
        { title: "Callback Queue", color: "#f85149", items: [], note: "drained!" },
      ],
      phase: "macrotask",
    },
  ],
  solution: `// Answer: A, D, C, B

console.log('A');                          // 1. Sync → prints A
setTimeout(() => console.log('B'), 0);    // 2. Macrotask → Callback Queue
Promise.resolve().then(() => console.log('C')); // 3. Microtask Queue
console.log('D');                          // 4. Sync → prints D
// Stack empty → drain microtasks → prints C
// Microtasks empty → pick macrotask → prints B

// Key rule: Microtasks always run before the next Macrotask.
// Even setTimeout(fn, 0) waits for ALL pending microtasks first.`,
  complexity: {
    time: "O(1)",
    space: "O(n)",
    note: "Not a traditional complexity question — but the microtask queue is drained completely (O(n) microtasks) before each macrotask, which is why deeply nested `.then` chains can starve I/O callbacks.",
  },
};
