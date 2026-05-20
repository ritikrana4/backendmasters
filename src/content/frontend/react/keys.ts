import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

export const content: FrontendQuestionData = {
  title: "Keys in Lists",
  difficulty: "Easy",
  category: "React",
  problem: "Why does React need `key` props on list items? What happens when you use the array index as a key vs a stable ID? Give an example where using index as key causes a bug.",
  constraints: [
    "`key` must be **unique among siblings** and **stable** — it should not change between renders.",
    "Keys help React match elements across renders to determine what to **reuse, move, or destroy**.",
    "Index as key works only if the list never reorders, filters, or prepends items.",
  ],
  explanation: [
    {
      heading: "Why keys exist",
      body: "When React reconciles a list, it needs to know which element in the new list corresponds to which element in the old list. Without keys, React diffs by position — element at index 0 maps to index 0, etc. If an item is inserted at the beginning, every element shifts — React thinks everything changed and re-creates all DOM nodes and component state.",
    },
    {
      heading: "The index-as-key bug",
      body: "Consider a list of inputs where the user can type into each one. If you remove item 0, the old item 1 is now at index 0. React sees key=0 is still there — it keeps that DOM node (and the typed text!). The text that was in item 1 now appears in item 0's position. The user sees stale state in the wrong place.",
      code: `// Bug: index as key
{items.map((item, i) => (
  <input key={i} defaultValue={item.value} />
))}
// Remove index 0 → old index 1 becomes key=0
// React reuses the DOM node → stale input value appears

// Fix: stable unique ID as key
{items.map(item => (
  <input key={item.id} defaultValue={item.value} />
))}`,
    },
    {
      heading: "Keys must be unique among siblings, not globally",
      body: "Two different lists can have the same key values — keys only need to be unique **within** a list. React scopes key comparison to siblings in the same parent.",
    },
  ],
  visualizerSteps: [
    {
      description: "List [A, B, C] rendered with stable IDs as keys. React maps key='a' → <li>A, key='b' → <li>B, key='c' → <li>C.",
      panels: [
        { title: "Virtual DOM", color: "#61dafb", items: [{ label: "key='a' → A" }, { label: "key='b' → B" }, { label: "key='c' → C" }] },
        { title: "Real DOM", color: "#3fb950", items: [{ label: "li: A" }, { label: "li: B" }, { label: "li: C" }] },
      ],
      phase: "initial",
    },
    {
      description: "Item B is removed. New list: [A, C]. React matches key='a'→A (unchanged), key='c'→C (unchanged). Only B's DOM node is removed.",
      panels: [
        { title: "New Virtual DOM", color: "#f0db4f", items: [{ label: "key='a' → A" }, { label: "key='c' → C", active: true }] },
        { title: "DOM ops", color: "#3fb950", items: [{ label: "remove li:B only", active: true }] },
      ],
      phase: "stable key removal",
    },
    {
      description: "Bug: index as key. List [A, B, C]. Remove index 0 (A). New list [B, C]. Key=0 now maps to B, key=1 maps to C.",
      panels: [
        { title: "Old keys", color: "#8b949e", items: [{ label: "key=0 → A" }, { label: "key=1 → B" }, { label: "key=2 → C" }] },
        { title: "New keys", color: "#f85149", items: [{ label: "key=0 → B (was A!)", active: true }, { label: "key=1 → C (was B!)" }] },
      ],
      phase: "index key bug",
    },
    {
      description: "React sees key=0 still exists and UPDATES the existing DOM node. B's text replaces A's DOM node — input state (typed text) from A is incorrectly kept in B's node.",
      panels: [
        { title: "DOM (buggy)", color: "#f85149", items: [{ label: "li (A's node): shows B", active: true }, { label: "li (B's node): shows C" }] },
        { title: "Expected", color: "#3fb950", items: [{ label: "li: B" }, { label: "li: C" }] },
        { title: "State bug", color: "#f85149", items: [{ label: "A's input text → now on B's node!", active: true }] },
      ],
      phase: "bug consequence",
    },
  ],
  solution: `// Good: stable unique ID as key
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// When index-as-key is acceptable:
// - Static list that never reorders or filters
// - Items have no state (pure display)
// - No items are added/removed from the middle

// Generate stable IDs when you don't have them:
import { useId } from 'react'; // for form element IDs
// or use crypto.randomUUID() when creating list items`,
};
