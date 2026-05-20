import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Implement Event Emitter",
  difficulty: "Medium",
  category: "Machine Coding",
  problem: "Implement an `EventEmitter` class with `on(event, listener)`, `off(event, listener)`, and `emit(event, ...args)` methods. Optionally add `once(event, listener)` that fires only on the first emission.",
  constraints: [
    "`on` registers a listener for an event (multiple listeners per event allowed).",
    "`off` removes a specific listener. If the listener isn't found, do nothing.",
    "`emit` calls all listeners registered for the event with the provided arguments.",
  ],
  explanation: [
    {
      heading: "The pub/sub pattern",
      body: "An EventEmitter implements the **observer** (publish/subscribe) pattern. Components/modules can subscribe to named events and be notified asynchronously when those events happen — decoupling the emitter from the subscribers. This pattern is central to Node.js (EventEmitter), the browser (addEventListener), and most UI frameworks.",
    },
    {
      heading: "Internal data structure",
      body: "The core is a `Map<string, Set<Function>>` (or plain object with arrays). Each event name maps to a list of listener functions. `on` adds to the list, `off` removes from it, `emit` iterates and calls all of them.",
      code: `class EventEmitter {
  constructor() {
    this.listeners = new Map(); // event name → Set of callbacks
  }

  on(event, listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(listener);
    return this; // allow chaining
  }

  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  emit(event, ...args) {
    this.listeners.get(event)?.forEach(listener => listener(...args));
    return this;
  }
}`,
    },
    {
      heading: "once — fire and forget",
      body: "Implement `once` by wrapping the listener in a proxy that removes itself from the event after the first call.",
      code: `once(event, listener) {
  const wrapper = (...args) => {
    listener(...args);
    this.off(event, wrapper); // self-remove after first call
  };
  return this.on(event, wrapper);
}`,
    },
  ],
  visualizerSteps: [
    {
      description: "emitter.on('data', handlerA) and emitter.on('data', handlerB). The internal map has 'data' → [handlerA, handlerB].",
      panels: [
        { title: "listeners map", color: "#f0db4f", items: [{ label: "'data' →", active: true }, { label: "  handlerA" }, { label: "  handlerB" }] },
        { title: "other events", color: "#8b949e", items: [{ label: "(none yet)" }] },
      ],
      phase: "on",
    },
    {
      description: "emitter.emit('data', 42). All listeners for 'data' are called with 42.",
      panels: [
        { title: "emit('data', 42)", color: "#3fb950", items: [{ label: "handlerA(42) ✓", active: true }, { label: "handlerB(42) ✓", active: true }] },
        { title: "other events", color: "#8b949e", items: [{ label: "(not called)" }] },
      ],
      phase: "emit",
    },
    {
      description: "emitter.off('data', handlerA). Only handlerA is removed. handlerB stays.",
      panels: [
        { title: "listeners map", color: "#f0db4f", items: [{ label: "'data' →" }, { label: "  handlerA ✗ removed", active: true }, { label: "  handlerB ✓ kept" }] },
      ],
      phase: "off",
    },
    {
      description: "once example: wrapper fires handlerC, then removes itself. Second emit('open') does nothing for handlerC.",
      panels: [
        { title: "first emit('open')", color: "#3fb950", items: [{ label: "handlerC() called ✓", active: true }, { label: "wrapper removes itself" }] },
        { title: "second emit('open')", color: "#8b949e", items: [{ label: "handlerC NOT called (removed)" }] },
      ],
      phase: "once",
    },
  ],
  solution: `class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
    return this;
  }

  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  emit(event, ...args) {
    this.listeners.get(event)?.forEach(fn => fn(...args));
    return this;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

// Tests:
const emitter = new EventEmitter();
const handler = (msg) => console.log('received:', msg);

emitter.on('message', handler);
emitter.emit('message', 'hello'); // received: hello
emitter.off('message', handler);
emitter.emit('message', 'world'); // (nothing)

emitter.once('connect', () => console.log('connected!'));
emitter.emit('connect'); // connected!
emitter.emit('connect'); // (nothing — already removed)`,
};
