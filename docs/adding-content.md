# Adding Content

## Quick path: use the skills

```bash
# Add a new topic to Python
/add-topic python functions "Functions"

# Add a new course (disabled/coming-soon by default)
/add-course rust "Rust" "🦀"

# Audit SEO across all pages
/check-seo
```

---

## Manual path: adding a topic

### Step 1 — Register the topic in `lib/courses.ts`

Find the course and append to its `topics` array:

```ts
{
  slug: "functions",
  title: "Functions",
  description: "Define reusable blocks of code with def, parameters, return values, and scope.",
},
```

The `slug` must:
- Be lowercase, hyphen-separated (kebab-case)
- Match the directory name you create in Step 3
- Be unique within the course

### Step 2 — Create the content file

Create `src/content/python/functions.ts`:

```ts
export const content = {
  title: "Functions",
  sections: [
    {
      heading: "Defining a Function",
      body: `Use the \`def\` keyword followed by the function name and parentheses.`,
      code: `def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("Alice")  # Hello, Alice!`,
    },
    {
      heading: "Return Values",
      body: `Functions can return a value using the \`return\` statement.`,
      code: `def add(a, b):\n    return a + b\n\nresult = add(3, 4)\nprint(result)  # 7`,
    },
  ],
  starterCode: `# Define a function called square that returns n * n
def square(n):
    # your code here
    pass

print(square(5))   # should print 25
print(square(10))  # should print 100
`,
};
```

**Content writing rules:**
- Use `` `backticks` `` in `body` and `items` strings — they're rendered as `<code>` automatically.
- Escape backticks in template literals with `\``.
- Keep `starterCode` runnable as-is — the user's first run should produce meaningful output.
- Keep code block strings free of trailing whitespace — Monaco will show squiggles.
- 3–6 sections per topic is ideal. More than 8 becomes too long for one page.

### Step 3 — Create the page

Create `src/app/learn/python/functions/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/functions";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Functions — Python",
  description:
    "Learn to define reusable Python functions with def, parameters, and return values. Interactive exercises included.",
  keywords: ["python functions", "def keyword", "python tutorial"],
};

export default function FunctionsPage() {
  const topic = getTopic("python", "functions");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
```

**Metadata guidelines:**
- `title`: `"<Topic Name> — <Course Name>"` format.
- `description`: 120–160 characters. Include the topic name naturally in the first sentence.
- `keywords`: 3–6 terms. Start with the most specific (`"python functions"`) then broaden.

### Step 4 — Verify

```bash
npm run type-check   # catch any TypeScript errors
npm run build        # confirm the route is statically generated
```

The build output should show your new route under `Route (app)`.

---

## Manual path: adding a course

### Step 1 — Register in `lib/courses.ts`

```ts
{
  slug: "rust",
  name: "Rust",
  icon: "🦀",
  description: "Systems programming without memory bugs. Ownership, borrowing, and fearless concurrency.",
  disabled: true,      // keep true until content is ready
  topics: [],
},
```

Set `disabled: true` initially — the card shows in the course picker as "Coming soon" and the sidebar entry is greyed out/non-clickable.

### Step 2 — Create the app structure

```
src/app/learn/rust/
├── layout.tsx    # copy from python/layout.tsx, change activeCourse to "rust"
├── page.tsx      # course index page
```

### Step 3 — Create the content directory

```
src/content/rust/
```

Add `.gitkeep` if empty, or go straight to Step 4.

### Step 4 — Add topics

Follow the "adding a topic" steps above. When the first topic is ready, flip `disabled: false` in `lib/courses.ts`.

---

## Content quality checklist

Before merging a new topic:

- [ ] `starterCode` runs without errors in the editor
- [ ] Every `section.code` block is valid, runnable Python
- [ ] `metadata.description` is 120–160 characters
- [ ] Topic is listed in `lib/courses.ts` with matching slug
- [ ] Page calls `notFound()` as the guard
- [ ] `npm run build` completes with no errors
- [ ] `/check-seo` reports no issues for the new page
