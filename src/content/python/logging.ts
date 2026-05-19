export const content = {
  title: "Logging",
  sections: [
    {
      heading: "Why Not print()?",
      body: `\`print()\` works for quick debugging but has serious drawbacks in production code: you can't easily turn it off, there's no severity level, no timestamps, no file output, and no way to filter by module. Python's built-in \`logging\` module solves all of this. It's the standard in any serious codebase.`,
      items: [
        "`print()` — always outputs, no context, hard to silence",
        "`logging` — configurable levels, timestamps, sources, handlers",
        "You can set the level once and all `DEBUG` messages disappear in production",
        "Multiple handlers can write to console AND file simultaneously",
        "Libraries use `logging` — you can control their output too",
      ],
    },
    {
      heading: "Log Levels",
      body: `Every log message has a **level** indicating its severity. The logger filters out messages below the configured minimum level. The hierarchy from lowest to highest:`,
      code: `import logging

# Configure basic output to see all levels
logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)-8s %(message)s"
)

logging.debug("Detailed diagnostic info — dev only")
logging.info("Normal operation — server started, user logged in")
logging.warning("Unexpected but recoverable — config file missing, using defaults")
logging.error("Something failed — couldn't write to disk")
logging.critical("System is about to go down — database unreachable")`,
    },
    {
      heading: "Getting a Named Logger",
      body: `Rather than using the root logger directly, each module should create its own logger with \`logging.getLogger(__name__)\`. This gives log messages their source module name, and lets you control verbosity per module independently.`,
      code: `import logging

# Best practice: one logger per module
logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)

def load_config(path: str) -> dict:
    logger.info("Loading config from %s", path)
    try:
        # Simulate config loading
        config = {"host": "localhost", "port": 5432}
        logger.debug("Config loaded: %s", config)
        return config
    except Exception as e:
        logger.error("Failed to load config: %s", e)
        return {}

config = load_config("/etc/app/config.json")
logger.info("App started with %d settings", len(config))`,
    },
    {
      heading: "Handlers and Formatters",
      body: `A **handler** decides where log records go (console, file, HTTP endpoint). A **formatter** controls what the output looks like. One logger can have multiple handlers — e.g., DEBUG to a file and WARNING+ to the console.`,
      code: `import logging

logger = logging.getLogger("myapp")
logger.setLevel(logging.DEBUG)

# Console handler — WARNING and above
console = logging.StreamHandler()
console.setLevel(logging.WARNING)
console.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))

# In-memory handler to capture all messages (simulates a file handler)
memory = logging.handlers.MemoryHandler(capacity=100, flushLevel=logging.CRITICAL)
memory.setLevel(logging.DEBUG)

import logging.handlers
logger.addHandler(console)

# Log at different levels
logger.debug("debug detail")      # only goes to 'file'
logger.info("server started")     # only goes to 'file'
logger.warning("disk space low")  # goes to BOTH
logger.error("connection refused")# goes to BOTH`,
    },
    {
      heading: "Structured Logging and Best Practices",
      body: `In production, structured logging (JSON lines) makes logs machine-readable — easier to search in tools like Datadog, Grafana, or CloudWatch. A few key conventions to follow:`,
      items: [
        "Use `logger.info('msg %s', var)` not `logger.info(f'msg {var}')` — lazy formatting skips string building if level is filtered",
        "Always use `logger = logging.getLogger(__name__)` — never the root logger in library code",
        "Don't use `logging.basicConfig()` in library code — only in application entry points",
        "Use `logger.exception(msg)` inside `except` blocks — it auto-appends the full traceback",
        "Set `propagate = False` on a logger to stop messages reaching the root logger",
      ],
      code: `import logging
import json

class JSONFormatter(logging.Formatter):
    """Format log records as JSON lines."""
    def format(self, record):
        log_obj = {
            "level": record.levelname,
            "msg":   record.getMessage(),
            "name":  record.name,
        }
        if record.exc_info:
            log_obj["exc"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

logger = logging.getLogger("api")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

logger.info("Request received")
logger.warning("Rate limit approaching")
try:
    1 / 0
except ZeroDivisionError:
    logger.exception("Unexpected error")`,
    },
  ],
  starterCode: `import logging

# Set up a logger with timestamp and level
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("panel.demo")

class UserService:
    def __init__(self):
        self.users = {}
        self._log = logging.getLogger(f"{__name__}.UserService")

    def create(self, username: str, email: str) -> dict:
        if username in self.users:
            self._log.warning("Duplicate username: %s", username)
            raise ValueError(f"User '{username}' already exists")
        user = {"username": username, "email": email, "active": True}
        self.users[username] = user
        self._log.info("Created user: %s", username)
        return user

    def deactivate(self, username: str) -> None:
        if username not in self.users:
            self._log.error("User not found: %s", username)
            raise KeyError(username)
        self.users[username]["active"] = False
        self._log.info("Deactivated user: %s", username)

svc = UserService()
svc.create("alice", "alice@example.com")
svc.create("bob",   "bob@example.com")
svc.deactivate("alice")

try:
    svc.create("alice", "again@example.com")
except ValueError as e:
    logger.debug("Caught expected error: %s", e)
`,
};
