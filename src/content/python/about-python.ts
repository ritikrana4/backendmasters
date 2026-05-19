export const content = {
  title: "About Python",
  sections: [
    {
      heading: "What is Python?",
      body: `**Python** is a general-purpose, high-level programming language created by **Guido van Rossum** and first released in 1991. Its core design philosophy is readability — Python code reads almost like plain English, and the language enforces clean formatting through indentation. Today it is consistently ranked as the world's most popular programming language.`,
      items: [
        "**General-purpose** — not specialised for one domain; used for web backends, data science, automation, AI, scripting, and more",
        "**High-level** — you work with abstractions like lists, dictionaries, and objects instead of managing memory or CPU registers",
        "**Dynamically typed** — you don't declare types; Python figures them out at runtime",
        "**Garbage-collected** — memory is managed for you; no manual `malloc`/`free` like C",
        "**Multi-paradigm** — supports object-oriented, procedural, and functional styles; use whatever fits",
      ],
    },
    {
      heading: "Why Python Became So Popular",
      body: `Python did not win by being the fastest language. It won by being the most **productive** — the time from idea to working code is shorter than almost any other language. A few design decisions made this possible.`,
      items: [
        "**Readable syntax** — `for item in list:` instead of `for (int i = 0; i < list.length; i++)`. Less syntax noise means fewer bugs and faster reading.",
        "**Batteries included** — the standard library covers file I/O, HTTP, JSON, CSV, regex, datetime, math, and hundreds of other tasks with no extra install",
        "**Massive ecosystem** — PyPI hosts over 500,000 packages: web frameworks (FastAPI, Django), data science (NumPy, pandas), ML (PyTorch, scikit-learn), and everything in between",
        "**Gentle learning curve** — beginners can write useful programs on day one; the same language scales to production systems",
        "**Community** — enormous community means answers to almost any question already exist on Stack Overflow, GitHub, and tutorials",
      ],
    },
    {
      heading: "What Python is Used For",
      body: `Python's versatility is one of its greatest strengths. The same language that teaches beginners is used by Google, Instagram, Spotify, NASA, and most major AI labs.`,
      items: [
        "**Web backends** — FastAPI and Django power production APIs serving millions of requests. Instagram's backend is Python.",
        "**Data science & analytics** — pandas, NumPy, Matplotlib, and Jupyter are the standard toolkit for data analysts worldwide",
        "**Machine learning & AI** — PyTorch and TensorFlow are Python-first. Almost all AI research code is written in Python.",
        "**Automation & scripting** — replacing manual tasks: renaming files, scraping websites, sending emails, interacting with APIs",
        "**DevOps & tooling** — Ansible, AWS CDK, and most CLI tools in the cloud ecosystem are Python",
        "**Scientific computing** — astronomy, genomics, climate modeling, and physics simulations all rely heavily on Python",
      ],
    },
    {
      heading: "Python's Design Philosophy",
      body: `Python has an explicit philosophy, summarised in the **Zen of Python** — a set of 19 aphorisms by Tim Peters. Run \`import this\` in any Python interpreter to read them. A few of the most important:`,
      code: `import this

# The Zen of Python (selected)
# -------------------------------------------------
# Beautiful is better than ugly.
# Explicit is better than implicit.
# Simple is better than complex.
# Complex is better than complicated.
# Readability counts.
# There should be one— and preferably only one —obvious way to do it.
# If the implementation is hard to explain, it's a bad idea.
# If the implementation is easy to explain, it may be a good idea.

# These aren't just poetry — they actively shape how the language is designed
# and how experienced Python developers write code.`,
    },
    {
      heading: "Python Versions",
      body: `Python 2 and Python 3 are not compatible. Python 2 reached end-of-life in January 2020. Always use Python 3.`,
      items: [
        "**Python 3** — the only version you should use. Current stable release is 3.12+.",
        "**Python 2** — dead since 2020. If you see Python 2 tutorials, ignore them.",
        "**CPython** — the reference implementation, written in C. What you install from python.org.",
        "**Version management** — use `pyenv` to install and switch between Python versions on your machine",
        "Check your version: `python3 --version` or `python --version` in your terminal",
      ],
    },
  ],
  starterCode: `# Python says hello
print("Hello, world!")

# Python reads like English
name = "Alice"
age  = 30

if age >= 18:
    print(f"{name} is an adult")
else:
    print(f"{name} is a minor")

# The Zen of Python — uncomment to read
# import this
`,
};
