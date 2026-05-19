export const content = {
  title: "Interpreted vs Compiled",
  sections: [
    {
      heading: "How Compiled Languages Work",
      body: `In a **compiled language** (C, Go, Rust), your source code is transformed directly into machine code — binary instructions the CPU can execute natively. This happens once before the program runs. The output is a standalone executable file.`,
      code: `# C program lifecycle
hello.c  →  [compiler: gcc]  →  hello (binary)  →  CPU executes directly

# Compile once, run fast
gcc hello.c -o hello
./hello          # runs at native CPU speed, ~1–10ns per instruction

# Pros: very fast execution, no runtime needed on the target machine
# Cons: compile step required, must recompile for each target OS/CPU`,
    },
    {
      heading: "How Python is Executed",
      body: `Python is commonly called an **interpreted language**, but the full picture is slightly more nuanced. When you run a Python file, two things happen: your source code is first compiled to **bytecode**, then that bytecode is executed by the **Python Virtual Machine (PVM)** — line by line.`,
      code: `# Python program lifecycle
hello.py  →  [CPython compiler]  →  hello.pyc (bytecode)  →  [PVM] executes

# Step 1: CPython compiles .py to .pyc (Python bytecode)
# .pyc files are stored in __pycache__/ — you'll see this folder appear
# This step is automatic — you never invoke it manually

# Step 2: The Python Virtual Machine (PVM) interprets the bytecode
# The PVM is a C program that reads each bytecode instruction and executes it
# This is what "python hello.py" actually does

python hello.py
# → reads hello.py
# → compiles to bytecode (or loads cached .pyc if unchanged)
# → PVM executes bytecode instruction by instruction`,
    },
    {
      heading: "Bytecode — the Middle Layer",
      body: `**Bytecode** is a compact, platform-neutral set of instructions designed for the Python Virtual Machine — not for your CPU directly. It's faster to execute than parsing raw source text, but slower than native machine code because the PVM still interprets each instruction at runtime.`,
      code: `import dis   # built-in disassembler — shows bytecode

def add(a, b):
    return a + b

dis.dis(add)
# Output:
#   2  RESUME          0
#   3  LOAD_FAST       0 (a)
#      LOAD_FAST       1 (b)
#      BINARY_OP       0 (+)
#      RETURN_VALUE

# Each line is one bytecode instruction
# The PVM executes these in a loop — this loop runs inside C code

# See the .pyc cache in action
import py_compile
py_compile.compile("hello.py")   # creates __pycache__/hello.cpython-312.pyc`,
    },
    {
      heading: "CPython — The Reference Implementation",
      body: `**CPython** is the official, most-used Python interpreter — written in C. When people say "Python", they almost always mean CPython. There are other implementations with different performance trade-offs.`,
      items: [
        "**CPython** — the default. Interprets bytecode. Written in C. What you get from python.org.",
        "**PyPy** — an alternative Python interpreter with a JIT (Just-In-Time) compiler. Often 5–10× faster than CPython for long-running code, but not always compatible with C extensions like NumPy.",
        "**Jython** — Python running on the Java Virtual Machine (JVM). Compiles to Java bytecode.",
        "**MicroPython** — a tiny Python implementation for microcontrollers (Raspberry Pi Pico, ESP32).",
        "**Cython** — not an interpreter but a superset of Python that compiles to C. Used to write Python extensions that run at near-C speed.",
      ],
    },
    {
      heading: "Why Python is Slower Than C — and Why It Doesn't Matter",
      body: `Python is typically 10–100× slower than C or Go for CPU-intensive computation. This sounds alarming, but in practice it rarely matters — and when it does, there are solutions.`,
      items: [
        "**Most programs aren't CPU-bound** — web APIs spend 99% of their time waiting for databases and networks. Python's speed is irrelevant there.",
        "**Heavy lifting happens in C** — NumPy, pandas, TensorFlow, and OpenCV are Python interfaces to C/C++/CUDA libraries. The Python code just orchestrates; the number-crunching is native.",
        "**Speed is rarely the bottleneck** — developer time, readability, and correctness usually matter far more than execution speed.",
        "**When speed matters**: use PyPy, write a C extension, use Cython, or offload to a compiled service. But measure first — premature optimisation is the root of all evil.",
        "**The GIL** — CPython has a Global Interpreter Lock that prevents true parallel thread execution. For parallelism, Python uses multiprocessing (multiple processes) or async I/O (cooperative concurrency). This is covered in the Concurrency topic.",
      ],
    },
  ],
  starterCode: `import dis

# See the bytecode Python compiles your code into
def greet(name):
    return "Hello, " + name

print("--- Bytecode for greet() ---")
dis.dis(greet)

# Python compiles and caches bytecode automatically
# Check your __pycache__ folder after running any .py file

# Timing: see how fast Python is for simple operations
import time

start = time.perf_counter()
total = sum(range(1_000_000))
elapsed = time.perf_counter() - start

print(f"\\nsum(1..1M) = {total}")
print(f"Time: {elapsed*1000:.2f} ms")
`,
};
