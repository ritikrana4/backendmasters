export const content = {
  title: "Decorators",
  sections: [
    {
      heading: "What is a Decorator?",
      body: `A decorator is a function that takes a function as input, wraps it with extra behaviour, and returns the new wrapped function. The \`@decorator\` syntax is shorthand for \`fn = decorator(fn)\` — it's applied at definition time.`,
      code: `def shout(fn):
    def wrapper(*args, **kwargs):
        result = fn(*args, **kwargs)
        return str(result).upper()
    return wrapper

def greet(name):
    return f"hello, {name}"

# Manual application
loud_greet = shout(greet)
print(loud_greet("alice"))   # HELLO, ALICE

# Exactly the same with @ syntax
@shout
def greet2(name):
    return f"hello, {name}"

print(greet2("bob"))   # HELLO, BOB`,
    },
    {
      heading: "Preserving Metadata with functools.wraps",
      body: `Wrapping a function hides its original \`__name__\` and \`__doc__\`. Use \`@functools.wraps(fn)\` inside your wrapper to copy those attributes through. This is important for debugging, logging, and documentation tools.`,
      code: `import functools

def decorator(fn):
    @functools.wraps(fn)   # copies __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

@decorator
def add(a, b):
    """Return the sum of a and b."""
    return a + b

print(add.__name__)   # add   (not 'wrapper')
print(add.__doc__)    # Return the sum of a and b.`,
    },
    {
      heading: "Practical Example: Timing",
      body: `One of the most common real-world uses for decorators is measuring how long a function takes to run — without modifying the function itself.`,
      code: `import functools
import time

def timer(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{fn.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_sum(n):
    return sum(range(n))

@timer
def fast_sum(n):
    return n * (n - 1) // 2

slow_sum(1_000_000)
fast_sum(1_000_000)`,
    },
    {
      heading: "Practical Example: Retry",
      body: `Decorators shine for cross-cutting concerns — behaviour you want to apply to many functions consistently. A retry decorator is a great example: it wraps a function so it automatically retries on failure.`,
      code: `import functools
import random

def retry(times=3):
    """Decorator factory: retry the function up to \`times\` attempts."""
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    print(f"  Attempt {attempt} failed: {e}")
            raise RuntimeError(f"{fn.__name__} failed after {times} retries")
        return wrapper
    return decorator

@retry(times=3)
def flaky_service():
    """Simulates an unreliable external call."""
    if random.random() < 0.7:   # fails 70% of the time
        raise ConnectionError("Service unavailable")
    return "Success!"

try:
    result = flaky_service()
    print(result)
except RuntimeError as e:
    print(e)`,
    },
    {
      heading: "Stacking Decorators",
      body: `Multiple decorators can be applied to one function. They stack from bottom to top — the decorator closest to the function runs first (innermost), the outermost runs last.`,
      code: `import functools

def bold(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return f"**{fn(*args, **kwargs)}**"
    return wrapper

def uppercase(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs).upper()
    return wrapper

@bold         # applied second (outer)
@uppercase    # applied first (inner)
def greet(name):
    return f"hello, {name}"

# equivalent to: greet = bold(uppercase(greet))
print(greet("world"))   # **HELLO, WORLD**`,
    },
  ],
  starterCode: `# Decorators practice
import functools
import time

def log_calls(fn):
    """Log every call: arguments in, return value out."""
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        args_repr = ", ".join(repr(a) for a in args)
        kwargs_repr = ", ".join(f"{k}={v!r}" for k, v in kwargs.items())
        all_args = ", ".join(filter(None, [args_repr, kwargs_repr]))
        result = fn(*args, **kwargs)
        print(f"{fn.__name__}({all_args}) -> {result!r}")
        return result
    return wrapper

def memoize(fn):
    """Cache results — never compute the same input twice."""
    cache = {}
    @functools.wraps(fn)
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    return wrapper

@log_calls
@memoize
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Only uncached calls get logged
print(fibonacci(6))
print(fibonacci(4))   # already cached, no log
`,
};
