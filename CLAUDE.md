# CLAUDE.md — Panel

Panel is an interactive programming learning platform. Users read theory, then run real code in the browser (Python via Pyodide/WebAssembly, no backend). This file is the authoritative guide for all code work in this repo.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15+ (App Router) | SSG for SEO, file-based routing |
| Language | TypeScript (strict) | Type-safe content model |
| UI | Primer Brand (`@primer/react-brand`) | Design system |
| Code editor | `@monaco-editor/react` | VS Code experience in browser |
| Python runtime | Pyodide (CDN, lazy-loaded) | Real Python, no backend |
| Styling | Inline styles + Tailwind utilities | Primer Brand requires inline for layout |

---

## Architecture

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root — SEO metadata base, Primer CSS import
│   ├── page.tsx                # Landing page
│   └── learn/
│       ├── page.tsx            # Course picker
│       └── [course]/
│           ├── layout.tsx      # Injects Header + Sidebar for ALL topics in course
│           ├── page.tsx        # Course index (topic list)
│           └── [topic]/
│               └── page.tsx    # Topic page — imports from content/ and renders TopicContent
├── components/
│   ├── Header.tsx              # Fixed top bar — "use client" for active link detection
│   ├── Sidebar.tsx             # Fixed left sidebar — "use client" for active topic state
│   ├── CodeEditor.tsx          # Monaco + Pyodide runner — "use client", lazy-loaded
│   └── TopicContent.tsx        # Theory + editor shell — dynamically imports CodeEditor
├── content/
│   └── [course]/
│       └── [topic].ts          # Topic theory sections + starter code (pure data, no JSX)
└── lib/
    └── courses.ts              # Single source of truth for all course/topic metadata
```

### Data flow

1. `lib/courses.ts` defines every course and topic (slug, title, description, disabled flag).
2. `content/[course]/[topic].ts` holds the actual learning content (sections, code snippets, starter code).
3. A topic `page.tsx` imports from both, passes data to `<TopicContent>`.
4. `TopicContent` renders theory as HTML and dynamically imports `<CodeEditor>` (SSR: false).
5. `CodeEditor` loads Pyodide from CDN on first mount, then runs user code in-browser.

---

## Code Patterns

### Server vs Client components

- **Default to Server Components.** Pages, layouts, and `TopicContent` are all Server Components.
- Only add `"use client"` when the component needs browser APIs, hooks, or event handlers:
  - `Header.tsx` — `usePathname()` for active nav state
  - `Sidebar.tsx` — `usePathname()` for active topic highlight
  - `CodeEditor.tsx` — Monaco editor, Pyodide, useState/useEffect
- **Never** put `"use client"` on a layout — it forces every child to be a client component.

### Dynamic imports for heavy browser-only code

```tsx
// TopicContent.tsx — always do this for CodeEditor
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
```

This keeps the initial HTML payload small and avoids SSR hydration mismatches.

### Content files (`src/content/`)

Content files are **pure TypeScript data** — no JSX, no React imports.

```ts
// src/content/python/my-topic.ts
export const content = {
  title: "Topic Title",
  sections: [
    {
      heading: "Section Heading",
      body: "Explanation text. Use `backticks` for inline code.",
      code: `print("optional code block")`,   // optional
      items: ["`item` — description"],         // optional bullet list
    },
  ],
  starterCode: `# User-editable starter code\nprint("hello")\n`,
};
```

- Use backtick spans (`` `code` ``) in `body` and `items` — `TopicContent` renders them as `<code>`.
- Keep `starterCode` runnable on its own with no extra imports.
- No JSX or React in content files — they're data, not components.

### Styling conventions

- **Layout and positioning** → inline `style` objects (consistent with Primer Brand patterns).
- **Tailwind** → only for utility classes that don't conflict with Primer (`sidebar-scroll`, responsive grid helpers).
- **Never** use Tailwind for colors or typography on content that uses Primer Brand tokens — the two systems will fight.
- Dark mode is set globally via `data-color-mode="dark"` on `<html>` — don't re-declare it per component.

### Course model

`lib/courses.ts` is the single source of truth. Adding a topic requires:
1. Add the topic entry to the `topics` array of the correct course in `lib/courses.ts`.
2. Create `src/content/[course]/[topic-slug].ts`.
3. Create `src/app/learn/[course]/[topic-slug]/page.tsx`.

Use the `/add-topic` skill to do this automatically.

---

## SEO Requirements

Every `page.tsx` must export a `metadata` object. Minimum required fields:

```ts
export const metadata: Metadata = {
  title: "Page Title",          // fills the %s template: "Page Title | Panel"
  description: "...",           // 120–160 chars, includes the keyword naturally
  keywords: ["keyword1", ...],  // 3–6 relevant terms
};
```

Topic pages additionally benefit from structured breadcrumbs (future). Never skip metadata on a page — the build will still succeed, but the tab title and SEO will be wrong.

---

## Adding Content

Use the skills:
- `/add-topic <course-slug> <topic-slug> "<Topic Title>"` — scaffolds all three files
- `/add-course <course-slug> "<Course Name>" "<emoji>"` — scaffolds a new course
- `/check-seo` — audits every page for missing or thin metadata

See `docs/adding-content.md` for the manual process and content writing guide.

---

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (also validates static generation)
npm run type-check   # TypeScript check without building
npm run lint         # ESLint
```

---

## What NOT to Do

- **No backend.** All logic runs in the browser. No API routes, no server actions that touch external services.
- **No `"use client"` on layouts.** It propagates down and kills static generation.
- **Don't import `CodeEditor` directly** in a Server Component — always go through the `dynamic()` wrapper in `TopicContent`.
- **Don't add content directly in `page.tsx`.** Content belongs in `src/content/`. Pages are thin wrappers.
- **Don't create new Tailwind color classes** for things already covered by inline styles — it creates two sources of truth for colors.
- **Don't skip `notFound()`** in topic pages when `getTopic()` returns undefined — it generates a proper 404 instead of a blank page.
- **Don't modify `lib/courses.ts`** without creating the corresponding content and page files — broken links will appear in the sidebar.
