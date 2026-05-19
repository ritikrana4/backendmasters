export const content = {
  title: "Concurrency & Parallelism",
  sections: [
    {
      heading: "Concurrency vs Parallelism vs the GIL",
      body: `**Concurrency** means dealing with multiple things at once (interleaving tasks). **Parallelism** means doing multiple things simultaneously (true multi-core execution). Python has the **Global Interpreter Lock (GIL)** — a mutex that prevents multiple threads from executing Python bytecode at the same time. This means threading gives you concurrency but not CPU parallelism. For CPU parallelism, use \`multiprocessing\`.`,
      items: [
        "`threading` — concurrent, shares memory, GIL limits CPU parallelism — best for I/O-bound work",
        "`multiprocessing` — true parallelism, separate memory per process — best for CPU-bound work",
        "`asyncio` — single-threaded concurrency via event loop — best for high-volume I/O",
        "`concurrent.futures` — high-level API over both threading and multiprocessing",
      ],
    },
    {
      heading: "threading — I/O-bound concurrency",
      body: `The \`threading\` module lets you run functions in separate threads. The GIL is released during I/O operations (network, file reads, \`time.sleep\`), so threading gives real speedup for I/O-bound work even with the GIL.`,
      code: `import threading
import time

results = {}

def fetch(name: str, delay: float):
    time.sleep(delay)   # GIL released during sleep
    results[name] = f"{name} done in {delay}s"

# Sequential: 0.1 + 0.2 + 0.15 = 0.45s
# Threaded:   max(0.1, 0.2, 0.15) = 0.20s

threads = [
    threading.Thread(target=fetch, args=("task-A", 0.1)),
    threading.Thread(target=fetch, args=("task-B", 0.2)),
    threading.Thread(target=fetch, args=("task-C", 0.15)),
]

start = time.perf_counter()
for t in threads: t.start()
for t in threads: t.join()   # wait for all to finish
elapsed = time.perf_counter() - start

for name, result in sorted(results.items()):
    print(result)
print(f"Total: {elapsed:.2f}s")`,
    },
    {
      heading: "Thread Safety and Locks",
      body: `Threads share memory — if two threads modify the same variable simultaneously, you get a **race condition**. Use \`threading.Lock()\` to ensure only one thread enters a critical section at a time. Always acquire the lock with \`with lock:\` (not manual \`.acquire()/.release()\`).`,
      code: `import threading

counter = 0
lock = threading.Lock()

def increment(n: int):
    global counter
    for _ in range(n):
        with lock:        # only one thread here at a time
            counter += 1

threads = [threading.Thread(target=increment, args=(1000,)) for _ in range(5)]
for t in threads: t.start()
for t in threads: t.join()

print(f"Counter: {counter}")   # always 5000 with lock`,
    },
    {
      heading: "concurrent.futures — the High-Level API",
      body: `\`concurrent.futures\` provides \`ThreadPoolExecutor\` (I/O work) and \`ProcessPoolExecutor\` (CPU work) with the same interface. \`executor.map(fn, items)\` is the simplest form — like \`map()\` but runs concurrently. \`submit()\` gives you a \`Future\` for more control.`,
      code: `from concurrent.futures import ThreadPoolExecutor
import time

def slow_square(n: int) -> int:
    time.sleep(0.05)   # simulate I/O
    return n ** 2

numbers = list(range(1, 9))

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(slow_square, numbers))
elapsed = time.perf_counter() - start

print(results)
print(f"Time: {elapsed:.2f}s")  # ~0.10s (2 batches of 4)`,
    },
    {
      heading: "multiprocessing — CPU-bound parallelism",
      body: `For CPU-intensive work (number crunching, image processing, ML inference), \`multiprocessing\` spawns separate Python processes — each with its own GIL, truly running in parallel across CPU cores. Note: process startup has overhead, so it's only worth it for heavy tasks.`,
      code: `from multiprocessing import Pool
import os

def cpu_work(n: int) -> int:
    """Simulate CPU-bound computation."""
    return sum(i * i for i in range(n))

if __name__ == "__main__":   # required on Windows/macOS
    tasks = [500_000] * 4

    # Single process
    import time
    start = time.perf_counter()
    seq = [cpu_work(t) for t in tasks]
    print(f"Sequential: {time.perf_counter() - start:.2f}s")

    # Multiple processes
    start = time.perf_counter()
    with Pool(processes=4) as pool:
        par = pool.map(cpu_work, tasks)
    print(f"Parallel:   {time.perf_counter() - start:.2f}s")`,
    },
    {
      heading: "Choosing the Right Tool",
      body: `The decision tree for Python concurrency:`,
      items: [
        "**I/O-bound + simple**: `asyncio` — single thread, thousands of concurrent tasks",
        "**I/O-bound + existing sync code**: `ThreadPoolExecutor` — easy to add concurrency to sync functions",
        "**CPU-bound**: `ProcessPoolExecutor` or `multiprocessing.Pool`",
        "**Mixed workload**: run async event loop + `run_in_executor()` for blocking calls",
        "**Rule of thumb**: if it spends time *waiting*, use threads or async. If it spends time *computing*, use processes.",
      ],
    },
  ],
  starterCode: `import threading
import time
from concurrent.futures import ThreadPoolExecutor

# Simulate a web scraper fetching multiple pages concurrently
PAGES = {
    "/home":    0.20,
    "/about":   0.05,
    "/products":0.30,
    "/contact": 0.10,
    "/blog":    0.25,
}

def fetch_page(path: str) -> dict:
    start = time.perf_counter()
    time.sleep(PAGES[path])   # simulated network latency
    return {"path": path, "time": time.perf_counter() - start}

# Sequential
print("Sequential:")
start = time.perf_counter()
seq_results = [fetch_page(p) for p in PAGES]
seq_total = time.perf_counter() - start
for r in seq_results:
    print(f"  {r['path']:12s} {r['time']:.2f}s")
print(f"  Total: {seq_total:.2f}s\\n")

# Concurrent (ThreadPoolExecutor)
print("Concurrent:")
start = time.perf_counter()
with ThreadPoolExecutor(max_workers=5) as ex:
    con_results = list(ex.map(fetch_page, PAGES))
con_total = time.perf_counter() - start
for r in con_results:
    print(f"  {r['path']:12s} {r['time']:.2f}s")
print(f"  Total: {con_total:.2f}s")
print(f"  Speedup: {seq_total / con_total:.1f}x")
`,
};
