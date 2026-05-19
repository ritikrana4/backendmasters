export const content = {
  title: "Context Managers",
  sections: [
    {
      heading: "The with Statement",
      body: `The \`with\` statement guarantees that setup and teardown code runs correctly — even if an exception occurs in the middle. You already use it with \`open()\`. The object returned by the expression is a **context manager**: it has \`__enter__\` and \`__exit__\` methods that Python calls automatically.`,
      code: `# Without with — you must remember to close manually
f = open("notes.txt", "w")
try:
    f.write("Important note\\n")
finally:
    f.close()   # what if write() raises?

# With 'with' — __exit__ closes the file automatically
with open("notes.txt", "w") as f:
    f.write("Important note\\n")
# File is always closed here, exception or not

# Multiple context managers in one line
with open("a.txt", "w") as a, open("b.txt", "w") as b:
    a.write("File A")
    b.write("File B")`,
    },
    {
      heading: "The Protocol: __enter__ and __exit__",
      body: `Any class with \`__enter__\` and \`__exit__\` is a context manager. \`__enter__\` runs when the \`with\` block starts (its return value is bound to the \`as\` name). \`__exit__\` runs when the block exits — it receives exception info if an error occurred.`,
      code: `class ManagedConnection:
    def __init__(self, host):
        self.host = host

    def __enter__(self):
        print(f"Connecting to {self.host}...")
        return self   # available as the 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Closing connection to {self.host}")
        if exc_type:
            print(f"  (exception: {exc_val})")
        return False  # False = don't suppress the exception

with ManagedConnection("db.example.com") as conn:
    print(f"  Using connection: {conn.host}")
    # raise ValueError("test")  ← try uncommenting this`,
    },
    {
      heading: "contextlib.contextmanager",
      body: `Writing a full class for a simple context manager is verbose. The \`@contextmanager\` decorator lets you write one as a generator: everything before \`yield\` is the setup (like \`__enter__\`), the \`yield\` value is the \`as\` variable, and everything after (or in \`finally\`) is the teardown (like \`__exit__\`).`,
      code: `from contextlib import contextmanager
import time

@contextmanager
def timer(label=""):
    start = time.perf_counter()
    try:
        yield   # control passes to the with block here
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer("sum of squares"):
    result = sum(x**2 for x in range(1_000_000))
    print(f"Result: {result:,}")`,
    },
    {
      heading: "Suppressing Exceptions",
      body: `\`contextlib.suppress(*exceptions)\` silently swallows specific exception types. This is cleaner than a bare \`try/except: pass\` when you genuinely want to ignore certain errors.`,
      code: `from contextlib import suppress
import os

# Delete a file if it exists — don't care if it doesn't
with suppress(FileNotFoundError):
    os.remove("temp_file.txt")
print("Done — no crash even if file didn't exist")

# Ignore KeyError when accessing nested dicts
data = {"user": {"name": "Alice"}}
with suppress(KeyError):
    role = data["user"]["role"]   # KeyError — silently ignored
    print(f"Role: {role}")        # never runs

print("Continued after suppressed error")`,
    },
    {
      heading: "Practical: Temporary Directory",
      body: `\`tempfile.TemporaryDirectory()\` is a built-in context manager that creates a temporary directory, lets you use it, and automatically deletes it — and all its contents — when the block exits.`,
      code: `import tempfile
import os
import json

with tempfile.TemporaryDirectory() as tmpdir:
    print(f"Working in: {tmpdir}")

    # Create files inside
    config_path = os.path.join(tmpdir, "config.json")
    with open(config_path, "w") as f:
        json.dump({"debug": True}, f)

    # Read them back
    with open(config_path) as f:
        config = json.load(f)
    print("Config:", config)

    files = os.listdir(tmpdir)
    print("Files in tmpdir:", files)

# tmpdir and all its files are now deleted
print("Temp dir cleaned up automatically")`,
    },
  ],
  starterCode: `# Context Managers practice
from contextlib import contextmanager

@contextmanager
def transaction(name: str):
    """Simulate a database transaction with commit/rollback."""
    print(f"BEGIN {name}")
    operations = []
    try:
        yield operations   # caller appends operations here
        # If we reach here, no exception — commit
        print(f"COMMIT {name} ({len(operations)} operations)")
        for op in operations:
            print(f"  ✓ {op}")
    except Exception as e:
        print(f"ROLLBACK {name} — {e}")
        raise

# Successful transaction
print("--- Successful transaction ---")
with transaction("order-1") as ops:
    ops.append("INSERT order row")
    ops.append("DECREMENT stock")
    ops.append("SEND confirmation email")

# Failed transaction
print("\\n--- Failed transaction ---")
try:
    with transaction("order-2") as ops:
        ops.append("INSERT order row")
        raise ValueError("Payment declined")
except ValueError:
    pass
`,
};
