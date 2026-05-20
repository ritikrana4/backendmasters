import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Implement Debounce",
  difficulty: "Medium",
  category: "Machine Coding",
  problem: "Implement a `debounce(fn, delay)` function. A debounced function delays calling `fn` until after `delay` milliseconds have passed since the **last** time it was invoked. Repeated calls within the delay window reset the timer.",
  constraints: [
    "The returned function should have the same `this` context and arguments as the original.",
    "Each call must **cancel the previous pending timeout** and start a fresh one.",
    "Common use cases: search input (wait until user stops typing), window resize handler.",
  ],
  explanation: [
    {
      heading: "What debounce does",
      body: "Without debounce, a search input fires an API call on every keystroke. With debounce, you only call the API after the user has stopped typing for N milliseconds. Rapid calls 'collapse' into one — only the **last** one in the burst actually fires.",
    },
    {
      heading: "The implementation",
      body: "The key insight: the returned wrapper function closes over a `timerId` variable. On every call, it clears the previous timer and starts a new one. Only if `delay` passes without another call will `fn` actually run.",
      code: `function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);           // cancel previous timer
    timerId = setTimeout(() => {
      fn.apply(this, args);          // call with correct context
    }, delay);
  };
}

const search = debounce((query) => fetchResults(query), 300);
input.addEventListener('input', e => search(e.target.value));
// User types: 'r', 'e', 'a', 'c', 't' rapidly
// Only fires: fetchResults('react') 300ms after last keystroke`,
    },
    {
      heading: "Debounce vs Throttle",
      body: "**Debounce** waits for a quiet period — it fires AFTER the burst ends. **Throttle** fires at a fixed rate — it fires AT MOST once per interval, regardless of how many calls happen. Use debounce for 'wait until done' (search), use throttle for 'limit rate' (scroll handler).",
    },
  ],
  visualizerSteps: [
    {
      description: "User types 'r'. debounce starts a 300ms timer. fn is NOT called yet.",
      panels: [
        { title: "Calls", color: "#f0db4f", items: [{ label: "search('r')", active: true }] },
        { title: "Timer", color: "#e3b341", items: [{ label: "id=1: 300ms", active: true }] },
        { title: "fn called?", color: "#8b949e", items: [{ label: "no" }] },
      ],
      phase: "typing",
    },
    {
      description: "User types 'e' before 300ms. Previous timer cancelled. New 300ms timer starts.",
      panels: [
        { title: "Calls", color: "#f0db4f", items: [{ label: "search('r')" }, { label: "search('re')", active: true }] },
        { title: "Timer", color: "#e3b341", items: [{ label: "id=1: CANCELLED", active: true }, { label: "id=2: 300ms" }] },
        { title: "fn called?", color: "#8b949e", items: [{ label: "no" }] },
      ],
      phase: "reset",
    },
    {
      description: "User types 'react' rapidly — each keystroke cancels the last timer. Only the final timer survives.",
      panels: [
        { title: "Calls", color: "#f0db4f", items: [{ label: "search('r')" }, { label: "search('re')" }, { label: "... 3 more" }, { label: "search('react')", active: true }] },
        { title: "Timer", color: "#e3b341", items: [{ label: "all previous: cancelled" }, { label: "final id=5: 300ms", active: true }] },
        { title: "fn called?", color: "#8b949e", items: [{ label: "not yet" }] },
      ],
      phase: "burst",
    },
    {
      description: "User stops typing. 300ms passes without a new call. Timer fires! fetchResults('react') is finally called.",
      panels: [
        { title: "Timer", color: "#3fb950", items: [{ label: "id=5: FIRED", active: true }] },
        { title: "fn called", color: "#3fb950", items: [{ label: "fetchResults('react')", active: true }] },
        { title: "API call", color: "#3fb950", items: [{ label: "1 request (not 5)", active: true }] },
      ],
      phase: "fires",
    },
  ],
  solution: `function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Usage with search input:
const handleSearch = debounce((query) => {
  console.log('Fetching:', query);
  // fetch('/api/search?q=' + query)...
}, 300);

document.getElementById('search').addEventListener('input', function(e) {
  handleSearch(e.target.value);
});

// With leading option (fire immediately, then debounce):
function debounceLeading(fn, delay) {
  let timerId;
  return function(...args) {
    if (!timerId) fn.apply(this, args);  // fire on leading edge
    clearTimeout(timerId);
    timerId = setTimeout(() => { timerId = null; }, delay);
  };
}`,
  complexity: {
    time: "O(1)",
    space: "O(1)",
    note: "The debounce wrapper itself is O(1) per call — it just manages one timer ID. The space is O(1) for the closure variables.",
  },
};
