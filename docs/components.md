# Components

## `<Header>`

**File:** `src/components/Header.tsx`  
**Type:** Client Component (`"use client"`)

Fixed top bar. Uses `usePathname()` to highlight the active nav link.

**No props.** Reads current route internally.

**What it renders:**
- Logo (links to `/`)
- Nav link: "Learn" (active when path starts with `/learn`)
- GitHub icon link (right side)

**To add a nav link:** add a `<NavLink>` call inside the `<nav>` block. The `NavLink` internal component handles active styling.

---

## `<Sidebar>`

**File:** `src/components/Sidebar.tsx`  
**Type:** Client Component (`"use client"`)

Fixed left panel. Renders two sections: a course tab strip at the top, and the topic list for the active course below.

| Prop | Type | Description |
|---|---|---|
| `courses` | `Course[]` | Full course list from `lib/courses.ts` |
| `activeCourse` | `string` (optional) | Slug of the currently open course |

**Usage in layouts:**
```tsx
// src/app/learn/python/layout.tsx
import { courses } from "@/lib/courses";

<Sidebar courses={courses} activeCourse="python" />
```

Pass `courses` from `lib/courses.ts` — never construct a partial list. The sidebar needs the full list to render the course tab strip correctly (including disabled courses).

---

## `<TopicContent>`

**File:** `src/components/TopicContent.tsx`  
**Type:** Server Component

Renders a complete topic page: the `<h1>` title, all theory sections, and the "Try it yourself" editor panel. Dynamically imports `<CodeEditor>` with `ssr: false`.

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Page heading |
| `sections` | `Section[]` | Theory content (see below) |
| `starterCode` | `string` | Initial code in the editor |

**`Section` shape:**
```ts
{
  heading: string
  body: string       // inline `code` spans rendered as <code>
  code?: string      // rendered in a <pre><code> block
  items?: string[]   // rendered as <ul>, each item supports inline `code`
}
```

**Never** import `<CodeEditor>` directly from a Server Component. Always go through `<TopicContent>` or replicate the `dynamic()` import.

---

## `<CodeEditor>`

**File:** `src/components/CodeEditor.tsx`  
**Type:** Client Component (`"use client"`)  
**Import:** Only via `dynamic(() => import(...), { ssr: false })`

Monaco-based code editor with an integrated Pyodide Python runtime. Displays stdout/stderr in an output panel below the editor.

| Prop | Type | Default | Description |
|---|---|---|---|
| `initialCode` | `string` | required | Starting code (reset target) |
| `language` | `string` | `"python"` | Monaco language mode |

**Pyodide lifecycle:**
1. On mount, injects the Pyodide CDN `<script>` into `<head>` (once per page session).
2. Calls `window.loadPyodide()` — sets `pyodideReady = true` when resolved.
3. Run button is disabled until ready (shows "Loading…" spinner).
4. Each "Run" call intercepts stdout/stderr via `py.setStdout` / `py.setStderr` and streams lines to the output panel.
5. "Reset" restores `code` state to `initialCode` and clears output.

**To change the Pyodide version:** update the CDN URL in the `loadPy` effect. Version is currently `v0.26.2`.

---

## Shared types

Defined in `src/lib/courses.ts` and re-exported for component use:

```ts
export interface Course {
  slug: string
  name: string
  icon: string
  description: string
  disabled: boolean
  topics: Topic[]
}

export interface Topic {
  slug: string
  title: string
  description: string
}
```

Helper functions:
- `getCourse(slug)` → `Course | undefined`
- `getTopic(courseSlug, topicSlug)` → `Topic | undefined`
