import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Implement Throttle",
  difficulty: "Medium",
  category: "Machine Coding",
  problem: "Implement a `throttle(fn, interval)` function. A throttled function fires **at most once per `interval` milliseconds**, regardless of how many times it's called during that window.",
  constraints: [
    "The first call should fire immediately (leading edge).",
    "Subsequent calls within the interval are **ignored** (not queued).",
    "Common use cases: scroll event handler, window resize, mousemove tracking.",
  ],
  explanation: [
    {
      heading: "Throttle vs Debounce — the key difference",
      body: "**Debounce** collapses a burst into ONE call that fires after the burst ends — you always wait. **Throttle** fires at a fixed maximum rate — the first call is immediate, then one call per interval. Good when you need regular feedback during a continuous action (scroll position, drag coordinates).",
    },
    {
      heading: "Implementation using a flag",
      body: "Track whether we're 'waiting' with a boolean flag. When the function is called and not waiting, invoke `fn` immediately and set `waiting = true`. After `interval` milliseconds, reset `waiting = false` so the next call can fire.",
      code: `function throttle(fn, interval) {
  let waiting = false;
  return function(...args) {
    if (!waiting) {
      fn.apply(this, args);        // fire immediately
      waiting = true;
      setTimeout(() => {
        waiting = false;           // allow next call
      }, interval);
    }
    // calls while waiting are silently dropped
  };
}`,
    },
    {
      heading: "Throttle with trailing call",
      body: "The basic implementation drops calls in the waiting window. A more complete implementation also fires once at the **trailing edge** — using the last call's arguments. This ensures the final state (e.g., the scroll position at rest) is processed.",
    },
  ],
  visualizerSteps: [
    {
      description: "First scroll event fires. waiting=false → call fn immediately, set waiting=true, start 200ms cooldown.",
      panels: [
        { title: "Call #1 (t=0ms)", color: "#3fb950", items: [{ label: "waiting: false → true", active: true }] },
        { title: "fn called", color: "#3fb950", items: [{ label: "updateScrollPos()", active: true }] },
        { title: "Cooldown", color: "#e3b341", items: [{ label: "200ms timer running" }] },
      ],
      phase: "fires",
    },
    {
      description: "Scroll events fire at t=50ms, 100ms, 150ms. All dropped because waiting=true.",
      panels: [
        { title: "Calls #2-4 (t=50-150ms)", color: "#f85149", items: [{ label: "waiting: true", active: true }] },
        { title: "fn called?", color: "#f85149", items: [{ label: "NO — dropped", active: true }] },
        { title: "Cooldown", color: "#e3b341", items: [{ label: "200ms timer still running" }] },
      ],
      phase: "throttled",
    },
    {
      description: "t=200ms: timer fires, waiting=false. Next scroll event can now call fn.",
      panels: [
        { title: "Timer expires", color: "#3fb950", items: [{ label: "waiting = false", active: true }] },
        { title: "Ready", color: "#3fb950", items: [{ label: "next call will fire", active: true }] },
      ],
      phase: "cooldown ends",
    },
    {
      description: "Summary: scroll fires many times, fn fires at most once per 200ms interval. Regular updates, not excessive.",
      panels: [
        { title: "Events (many)", color: "#f0db4f", items: [{ label: "~60 per second during scroll", active: true }] },
        { title: "fn calls (few)", color: "#3fb950", items: [{ label: "max 5 per second (200ms)", active: true }] },
        { title: "Savings", color: "#3fb950", items: [{ label: "12x fewer DOM updates" }] },
      ],
      phase: "summary",
    },
  ],
  solution: `// Basic throttle (leading edge only)
function throttle(fn, interval) {
  let waiting = false;
  return function(...args) {
    if (!waiting) {
      fn.apply(this, args);
      waiting = true;
      setTimeout(() => { waiting = false; }, interval);
    }
  };
}

// Throttle with trailing call (fires on leading AND trailing edge)
function throttleWithTrailing(fn, interval) {
  let lastCallTime = 0;
  let timerId = null;

  return function(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastCallTime);

    if (remaining <= 0) {
      if (timerId) { clearTimeout(timerId); timerId = null; }
      lastCallTime = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        lastCallTime = Date.now();
        timerId = null;
        fn.apply(this, args); // trailing edge
      }, remaining);
    }
  };
}

// Usage:
const onScroll = throttle(() => {
  console.log('scroll position:', window.scrollY);
}, 200);
window.addEventListener('scroll', onScroll);`,
  complexity: {
    time: "O(1)",
    space: "O(1)",
    note: "One boolean flag and one timer ID — constant space and time per call.",
  },
};
