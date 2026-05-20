import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Implement Promise.all",
  difficulty: "Hard",
  category: "Machine Coding",
  problem: "Implement `myPromiseAll(promises)` that mirrors `Promise.all` behaviour: resolves with an array of results when all promises fulfill (preserving order), and rejects immediately with the first rejection reason.",
  constraints: [
    "Results must be in the **same order** as the input array, regardless of which promise resolves first.",
    "If **any** promise rejects, reject immediately with that reason (don't wait for others).",
    "Handle edge case: empty array should resolve with `[]`.",
  ],
  explanation: [
    {
      heading: "What Promise.all does",
      body: "`Promise.all(promises)` runs all promises **concurrently** (they all start immediately) and waits for ALL of them to fulfill. If they all succeed, it resolves with an array of results in the same order as the input. If any one rejects, the whole thing rejects immediately.",
    },
    {
      heading: "Implementation strategy",
      body: "Return a new Promise. Track how many have resolved with a counter. When a promise at index `i` resolves, store the result in `results[i]` (not `results.push` — that would lose order). When the counter reaches the total, resolve. On any rejection, reject immediately.",
      code: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);

    const results = new Array(promises.length);
    let resolved = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p).then(value => {  // handle non-promise values
        results[i] = value;               // preserve order
        resolved++;
        if (resolved === promises.length) resolve(results);
      }).catch(reject);                   // fail fast
    });
  });
}`,
    },
    {
      heading: "Promise.allSettled vs Promise.all",
      body: "`Promise.allSettled` waits for ALL promises regardless of outcome and gives you `{ status, value/reason }` for each. Use it when you want results from all promises even if some fail.",
    },
  ],
  visualizerSteps: [
    {
      description: "myPromiseAll([p1, p2, p3]) starts. All three promises begin executing concurrently. resolved=0, results=[_,_,_].",
      panels: [
        { title: "p1", color: "#f0db4f", items: [{ label: "pending", active: true }] },
        { title: "p2", color: "#f0db4f", items: [{ label: "pending", active: true }] },
        { title: "p3", color: "#f0db4f", items: [{ label: "pending", active: true }] },
        { title: "results", color: "#8b949e", items: [{ label: "[_, _, _]" }] },
      ],
      phase: "all pending",
    },
    {
      description: "p2 resolves first with 'B'. results[1]='B', resolved=1. Not done yet (need 3).",
      panels: [
        { title: "p1", color: "#f0db4f", items: [{ label: "pending" }] },
        { title: "p2", color: "#3fb950", items: [{ label: "resolved: 'B'", active: true }] },
        { title: "p3", color: "#f0db4f", items: [{ label: "pending" }] },
        { title: "results", color: "#8b949e", items: [{ label: "[_, 'B', _]", active: true }] },
      ],
      phase: "partial",
    },
    {
      description: "p1 and p3 resolve. results=['A','B','C'], resolved=3. resolved===length → resolve(['A','B','C']). Order preserved!",
      panels: [
        { title: "p1", color: "#3fb950", items: [{ label: "resolved: 'A'" }] },
        { title: "p2", color: "#3fb950", items: [{ label: "resolved: 'B'" }] },
        { title: "p3", color: "#3fb950", items: [{ label: "resolved: 'C'" }] },
        { title: "result", color: "#3fb950", items: [{ label: "['A','B','C']", active: true }] },
      ],
      phase: "all resolved",
    },
    {
      description: "Rejection scenario: if p2 rejects, reject() is called immediately. p1 and p3's results are discarded.",
      panels: [
        { title: "p1", color: "#f0db4f", items: [{ label: "pending" }] },
        { title: "p2", color: "#f85149", items: [{ label: "rejected: 'Error'", active: true }] },
        { title: "p3", color: "#f0db4f", items: [{ label: "pending (ignored)" }] },
        { title: "result", color: "#f85149", items: [{ label: "rejects: 'Error'", active: true }] },
      ],
      phase: "fail fast",
    },
  ],
  solution: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);

    const results = new Array(promises.length);
    let resolved = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;  // preserve order with index, not push
          resolved++;
          if (resolved === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);  // reject immediately on first failure
    });
  });
}

// Tests:
myPromiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(console.log); // [1, 2, 3]

myPromiseAll([
  Promise.resolve(1),
  Promise.reject('oops'),
  Promise.resolve(3),
]).catch(console.error); // 'oops'

myPromiseAll([]).then(console.log); // []`,
  complexity: {
    time: "O(n)",
    space: "O(n)",
    note: "We store one result per promise. All n promises run concurrently — total wall time is the time of the slowest promise.",
  },
};
