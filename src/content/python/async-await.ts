export const content = {
  title: "Async / Await",
  sections: [
    {
      heading: "Synchronous vs Asynchronous",
      body: `In synchronous code, each operation blocks until it completes — if you fetch a URL, the whole program waits. In asynchronous code, while one operation is waiting (for a network response, a file read, a timer), Python can run other work. \`asyncio\` is Python's built-in async runtime, based on a single-threaded **event loop**.`,
      code: `import asyncio
import time

# Synchronous — total time = sum of all sleeps
def sync_version():
    start = time.perf_counter()
    time.sleep(0.1)   # simulate slow I/O
    time.sleep(0.1)
    time.sleep(0.1)
    print(f"Sync: {time.perf_counter() - start:.2f}s")  # ~0.30s

# Async — total time = max of all sleeps (they overlap)
async def async_version():
    start = time.perf_counter()
    await asyncio.gather(
        asyncio.sleep(0.1),
        asyncio.sleep(0.1),
        asyncio.sleep(0.1),
    )
    print(f"Async: {time.perf_counter() - start:.2f}s")  # ~0.10s

sync_version()
asyncio.run(async_version())`,
    },
    {
      heading: "async def and await",
      body: `Define a coroutine with \`async def\`. Inside it, use \`await\` to pause execution until the awaited operation completes — handing control back to the event loop so other coroutines can run. A coroutine is not executed until you \`await\` it or schedule it.`,
      code: `import asyncio

async def fetch_data(name: str, delay: float) -> str:
    print(f"  [{name}] starting...")
    await asyncio.sleep(delay)      # non-blocking pause
    print(f"  [{name}] done after {delay}s")
    return f"{name} result"

async def main():
    # Sequential — second waits for first
    r1 = await fetch_data("A", 0.2)
    r2 = await fetch_data("B", 0.1)
    print(r1, r2)

asyncio.run(main())`,
    },
    {
      heading: "asyncio.gather() — run concurrently",
      body: `\`asyncio.gather(*coroutines)\` schedules all coroutines to run concurrently on the same event loop and waits for all of them to finish. The results are returned in the same order as the inputs.`,
      code: `import asyncio
import time

async def fetch(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name} ({delay}s)"

async def main():
    start = time.perf_counter()

    # All three run concurrently — total ≈ slowest one (0.3s)
    results = await asyncio.gather(
        fetch("Users API",    0.3),
        fetch("Products API", 0.1),
        fetch("Orders API",   0.2),
    )

    elapsed = time.perf_counter() - start
    for r in results:
        print(" ", r)
    print(f"Total: {elapsed:.2f}s")   # ≈ 0.30s, not 0.60s

asyncio.run(main())`,
    },
    {
      heading: "asyncio.create_task() — fire and forget",
      body: `\`asyncio.create_task(coro)\` schedules a coroutine to run in the background immediately, without waiting for it. This is useful when you want to kick off work but continue doing other things. Await the task later when you need the result.`,
      code: `import asyncio

async def background_job(label: str, delay: float):
    await asyncio.sleep(delay)
    print(f"  {label} finished")
    return label.upper()

async def main():
    # Create tasks — they start running immediately
    task1 = asyncio.create_task(background_job("download", 0.3))
    task2 = asyncio.create_task(background_job("compress", 0.1))

    print("Tasks created, doing other work...")
    await asyncio.sleep(0.05)
    print("Still doing other work...")

    # Now wait for results
    r1 = await task1
    r2 = await task2
    print(f"Results: {r1}, {r2}")

asyncio.run(main())`,
    },
    {
      heading: "async for and async with",
      body: `Context managers and iterators can also be async. \`async with\` is used with resources that need async setup/teardown (database connections, HTTP sessions). \`async for\` iterates over async generators — sequences where each value requires an async operation to produce.`,
      code: `import asyncio

# Async generator — yields values with async pauses in between
async def async_range(n: int, delay: float = 0.05):
    for i in range(n):
        await asyncio.sleep(delay)
        yield i

async def main():
    total = 0
    async for value in async_range(5):
        print(f"  received: {value}")
        total += value
    print(f"Total: {total}")

asyncio.run(main())`,
    },
    {
      heading: "When to Use async",
      body: `Async is not always the right tool. Use it when your bottleneck is **I/O** — waiting for network requests, database queries, or file reads. For CPU-heavy work (number crunching, image processing), use \`multiprocessing\` instead.`,
      items: [
        "✅ Web servers handling many simultaneous requests (FastAPI, aiohttp)",
        "✅ Fetching data from multiple APIs at once",
        "✅ Chat applications, WebSockets, live dashboards",
        "❌ Numerical computation — use `numpy` + `multiprocessing`",
        "❌ Simple scripts with no I/O — regular functions are clearer",
        "❌ CPU-bound work — the event loop is single-threaded, async won't help",
      ],
    },
  ],
  starterCode: `import asyncio
import time

# Simulate async tasks with different "response times"
async def api_call(endpoint: str, latency: float) -> dict:
    await asyncio.sleep(latency)
    return {"endpoint": endpoint, "latency": latency, "ok": True}

async def main():
    endpoints = [
        ("/users",    0.3),
        ("/products", 0.1),
        ("/orders",   0.2),
        ("/stats",    0.15),
    ]

    start = time.perf_counter()

    # Sequential — sum of all latencies
    print("Sequential:")
    for path, lat in endpoints:
        r = await api_call(path, lat)
        print(f"  {r['endpoint']}")
    print(f"  Time: {time.perf_counter() - start:.2f}s\\n")

    # Concurrent — max of all latencies
    start = time.perf_counter()
    print("Concurrent (gather):")
    results = await asyncio.gather(*[api_call(p, l) for p, l in endpoints])
    for r in results:
        print(f"  {r['endpoint']}")
    print(f"  Time: {time.perf_counter() - start:.2f}s")

asyncio.run(main())
`,
};
