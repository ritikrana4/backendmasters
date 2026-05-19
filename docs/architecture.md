# Architecture

## Overview

Panel is a statically-generated learning platform. Every page is pre-rendered to HTML at build time — no server, no database, no API. Python code runs in the user's browser via Pyodide (Python compiled to WebAssembly).

```
Browser
  │
  ├── Static HTML/CSS/JS (served from CDN)
  │     └── Next.js App Router — all pages SSG
  │
  └── In-browser runtime
        ├── Monaco Editor (VS Code editing engine)
        └── Pyodide (Python 3 → WebAssembly, loaded from CDN on demand)
```

---

## Directory Map

```
Panel/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root HTML shell + global metadata
│   │   ├── globals.css             # Tailwind base + custom CSS vars
│   │   ├── page.tsx                # / — landing page
│   │   └── learn/
│   │       ├── page.tsx            # /learn — course picker
│   │       └── python/
│   │           ├── layout.tsx      # Shared shell for all Python pages
│   │           ├── page.tsx        # /learn/python — topic list
│   │           ├── variables/page.tsx
│   │           └── control-flow/page.tsx
│   │
│   ├── components/
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── Sidebar.tsx             # Course + topic navigation
│   │   ├── TopicContent.tsx        # Theory renderer + editor host
│   │   └── CodeEditor.tsx          # Monaco + Pyodide (client-only)
│   │
│   ├── content/
│   │   └── python/
│   │       ├── variables.ts        # Topic 1 content data
│   │       └── control-flow.ts     # Topic 2 content data
│   │
│   └── lib/
│       └── courses.ts              # Course/topic metadata registry
│
├── docs/                           # Developer documentation
├── .claude/skills/                 # Claude Code slash commands
├── CLAUDE.md                       # Claude working instructions
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Rendering Model

All pages use **Static Site Generation (SSG)**. Next.js pre-renders every route at `npm run build` — no runtime server needed.

| Route | Strategy | Reason |
|---|---|---|
| `/` | Static | Pure HTML, no dynamic data |
| `/learn` | Static | Course list is hardcoded in `lib/courses.ts` |
| `/learn/python` | Static | Topic list comes from `lib/courses.ts` |
| `/learn/python/[topic]` | Static | Content comes from `src/content/` |

When a new topic or course is added, the build automatically picks it up — no `generateStaticParams` needed because routes are explicit (not dynamic segments).

---

## Component Rendering Boundary

```
layout.tsx (Server)
  └── Header (Client — needs usePathname)
  └── Sidebar (Client — needs usePathname)
  └── page.tsx (Server)
        └── TopicContent (Server — renders theory HTML)
              └── CodeEditor (dynamic, ssr:false — Client)
                    ├── Monaco Editor (browser only)
                    └── Pyodide (browser only, lazy CDN load)
```

The critical rule: **CodeEditor must never be imported directly in a Server Component.** It uses `window`, `document`, and dynamic CDN loading — all illegal server-side. The `dynamic(() => import(...), { ssr: false })` boundary in `TopicContent` is the firewall.

---

## Content Data Model

```ts
// lib/courses.ts
Course {
  slug: string          // URL segment: "python"
  name: string          // Display: "Python"
  icon: string          // Emoji: "🐍"
  description: string
  disabled: boolean     // Hides from navigation, shows "Coming soon"
  topics: Topic[]
}

Topic {
  slug: string          // URL segment: "variables"
  title: string         // Display: "Variables & Data Types"
  description: string   // One-line summary shown in course index
}
```

```ts
// content/[course]/[topic].ts
{
  title: string
  sections: Array<{
    heading: string
    body: string          // Inline `code` spans supported
    code?: string         // Optional code block (pre/code)
    items?: string[]      // Optional bullet list (inline `code` supported)
  }>
  starterCode: string     // Pre-filled code in the editor
}
```

The `Topic` in `courses.ts` stores only what's needed for navigation. The actual learning content lives in `content/` and is only loaded when that specific page is rendered.

---

## Pyodide Integration

Pyodide is a 10 MB+ download. It is loaded **lazily and only once**:

1. On first mount of `CodeEditor`, a `<script>` tag pointing to the Pyodide CDN is injected into `<head>`.
2. `window.loadPyodide()` is called with the CDN `indexURL`.
3. The result is stored in a component-level `useRef` — shared across re-renders without re-loading.
4. The Run button is disabled (shows "Loading…") until `pyodideReady` state becomes `true`.

This means the first click of a code editor on any topic page triggers the download. Subsequent topics on the same page session reuse the already-loaded runtime from the ref.

---

## SEO Strategy

- **Static HTML** — search engines get fully rendered content, no JS needed to index.
- **Next.js Metadata API** — each `page.tsx` exports a `metadata` object with `title`, `description`, `keywords`, and OpenGraph fields.
- **Title template** — root layout defines `title.template = "%s | Panel"` so each page only needs to provide the page-specific title.
- **Semantic HTML** — `<header>`, `<aside>`, `<main>`, `<section>`, `<h1>`–`<h3>` used correctly.
- **No client-side routing for content** — each topic is a real URL with its own HTML file, making it directly indexable and shareable.
