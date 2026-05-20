import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Promises & Async/Await",
  difficulty: "Medium",
  category: "JavaScript",
  problem: "Explain the three states of a Promise. What does the following code print, and how does `async/await` relate to Promises under the hood?\n\nasync function fetchData() {\n  const result = await Promise.resolve(42);\n  console.log(result);\n}\nfetchData();\nconsole.log('after call');",
  constraints: [
    "A Promise can be **pending**, **fulfilled**, or **rejected** — and state changes are one-way.",
    "`async/await` is syntactic sugar over Promises — the function returns a Promise and `await` unwraps it.",
    "Code after an `await` runs as a microtask, so `'after call'` prints before `42`.",
  ],
  explanation: [
    {
      heading: "The three Promise states",
      body: "A Promise represents a value that may not be available yet. It starts `pending` and transitions exactly once — either to `fulfilled` (with a value) or `rejected` (with a reason). Once settled, it never changes.",
      items: [
        "**pending** — initial state; the async operation hasn't completed yet",
        "**fulfilled** — the operation succeeded; the promise has a resolved value",
        "**rejected** — the operation failed; the promise has a rejection reason",
      ],
    },
    {
      heading: "async/await is syntactic sugar",
      body: "An `async` function always returns a Promise. The `await` keyword pauses execution of the async function and resumes it as a microtask when the awaited promise settles. Code AFTER `fetchData()` — the `console.log('after call')` — runs synchronously before the awaited Promise callback fires.",
      code: `// async/await desugars roughly to:
function fetchData() {
  return Promise.resolve(42).then(result => {
    console.log(result); // runs as microtask
  });
}
fetchData();             // starts the promise chain
console.log('after call'); // runs synchronously first

// Output:
// 'after call'
// 42`,
    },
    {
      heading: "Error handling",
      body: "Rejected promises not caught with `.catch()` or `try/catch` become unhandled rejections. In async functions, use `try/catch` around `await`.",
      code: `// Promise chain style
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// async/await style (same thing)
async function loadData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}`,
    },
  ],
  visualizerSteps: [
    {
      description: "fetchData() is called. The async function starts running synchronously until it hits the first await.",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "fetchData()", active: true }, { label: "Promise.resolve(42)" }] },
        { title: "Microtask Queue", color: "#61dafb", items: [], note: "empty" },
        { title: "Promise state", color: "#3fb950", items: [{ label: "pending → fulfilled(42)", active: true }] },
      ],
      phase: "starting",
    },
    {
      description: "await pauses fetchData. The continuation (code after await) is queued as a microtask. Control returns to the caller.",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "(fetchData paused)" }] },
        { title: "Microtask Queue", color: "#61dafb", items: [{ label: "fetchData resume (result=42)", active: true }] },
        { title: "Promise state", color: "#3fb950", items: [{ label: "fulfilled(42)" }] },
      ],
      phase: "await pauses",
    },
    {
      description: "Back in the outer script: console.log('after call') runs synchronously. Output so far: 'after call'",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "console.log('after call')", active: true }] },
        { title: "Microtask Queue", color: "#61dafb", items: [{ label: "fetchData resume" }] },
        { title: "Output", color: "#8b949e", items: [{ label: "'after call'", active: true }] },
      ],
      phase: "sync continues",
    },
    {
      description: "Stack empty. Event loop drains microtasks. fetchData resumes with result=42. console.log(42) runs. Final output: 'after call', 42",
      panels: [
        { title: "Call Stack", color: "#f0db4f", items: [{ label: "fetchData (resumed)", active: true }, { label: "console.log(42)" }] },
        { title: "Microtask Queue", color: "#61dafb", items: [], note: "drained" },
        { title: "Output", color: "#8b949e", items: [{ label: "'after call'" }, { label: "42", active: true }] },
      ],
      phase: "microtask runs",
    },
  ],
  solution: `// Output: 'after call', then 42
async function fetchData() {
  const result = await Promise.resolve(42);
  console.log(result); // runs as microtask
}
fetchData();
console.log('after call'); // runs synchronously first

// Promise.all — run multiple promises concurrently
async function loadAll() {
  const [user, posts] = await Promise.all([
    fetch('/user').then(r => r.json()),
    fetch('/posts').then(r => r.json()),
  ]);
  return { user, posts };
}

// Error handling
async function safe() {
  try {
    const data = await fetchData();
    return data;
  } catch (err) {
    console.error('Failed:', err);
    return null;
  }
}`,
};
