export const content = {
  title: "pathlib",
  sections: [
    {
      heading: "Path Objects vs os.path",
      body: `Before \`pathlib\` (Python 3.4+), file paths were plain strings manipulated with \`os.path\`. This works but is verbose and error-prone. \`pathlib.Path\` treats paths as objects with methods — more readable, chainable, and consistent across Windows, macOS, and Linux.`,
      code: `from pathlib import Path

# Create a Path object — just a description, nothing on disk yet
p = Path("/tmp/myproject/data.csv")

print(p.name)        # data.csv
print(p.stem)        # data  (filename without extension)
print(p.suffix)      # .csv
print(p.parent)      # /tmp/myproject
print(p.parts)       # ('/', 'tmp', 'myproject', 'data.csv')

# Path arithmetic with /
base = Path("/tmp")
project = base / "myproject" / "src"
print(project)       # /tmp/myproject/src`,
    },
    {
      heading: "Checking and Inspecting Paths",
      body: `Path objects have methods to query the filesystem without executing anything. These return booleans or metadata — no I/O side effects.`,
      code: `from pathlib import Path

home = Path.home()          # current user's home directory
cwd  = Path.cwd()           # current working directory

print(home.exists())        # True
print((home / "nonexistent").exists())   # False

# exists(), is_file(), is_dir()
tmp = Path("/tmp")
print(tmp.is_dir())    # True
print(tmp.is_file())   # False

# Stat — size, modification time
p = Path("/tmp")
stat = p.stat()
print(f"Size:     {stat.st_size} bytes")
print(f"Modified: {stat.st_mtime:.0f}")`,
    },
    {
      heading: "Reading and Writing Files",
      body: `Path objects have \`read_text()\`, \`write_text()\`, \`read_bytes()\`, and \`write_bytes()\` — convenient one-liners that open, read/write, and close the file automatically. For more control (append mode, line iteration), use \`open()\` on the Path object.`,
      code: `from pathlib import Path

tmp = Path("/tmp")

# Write and read text
config = tmp / "config.txt"
config.write_text("host=localhost\\nport=5432\\n")
print(config.read_text())

# Append using open()
with config.open("a") as f:
    f.write("debug=true\\n")

# Read lines
lines = config.read_text().splitlines()
for line in lines:
    print(" ", line)

# Write and read bytes
data = tmp / "data.bin"
data.write_bytes(b"\\x00\\x01\\x02\\x03")
print(data.read_bytes())`,
    },
    {
      heading: "Creating, Moving, Deleting",
      body: `Path objects provide intuitive methods for filesystem operations. \`mkdir(parents=True, exist_ok=True)\` is the safe way to create a directory tree — no crashes if it already exists or if parent dirs are missing.`,
      code: `from pathlib import Path

base = Path("/tmp/pathlib_demo")

# Create directory tree
(base / "src" / "utils").mkdir(parents=True, exist_ok=True)
(base / "tests").mkdir(parents=True, exist_ok=True)

# Create files
(base / "src" / "main.py").write_text("print('hello')")
(base / "README.md").write_text("# Demo")

# Rename / move
old = base / "README.md"
new = base / "docs" / "README.md"
new.parent.mkdir(exist_ok=True)
old.rename(new)

# Delete
(base / "src" / "main.py").unlink()   # delete a file

# List directory
for item in base.rglob("*"):
    indent = "  " * (len(item.parts) - len(base.parts) - 1)
    print(f"{indent}{item.name}{'/' if item.is_dir() else ''}")`,
    },
    {
      heading: "Globbing — Finding Files by Pattern",
      body: `\`path.glob(pattern)\` returns matching files in a directory. \`path.rglob(pattern)\` does the same recursively (equivalent to \`glob("**/ pattern")\`). These return generators — lazy and memory-efficient.`,
      code: `from pathlib import Path

# Set up some demo files
base = Path("/tmp/glob_demo")
base.mkdir(exist_ok=True)
for name in ["a.py", "b.py", "c.txt", "d.py", "e.md"]:
    (base / name).write_text(f"# {name}")
sub = base / "sub"
sub.mkdir(exist_ok=True)
(sub / "f.py").write_text("# f.py")

# All .py files in this directory (not recursive)
py_files = list(base.glob("*.py"))
print("*.py:", [p.name for p in py_files])

# All .py files recursively
all_py = list(base.rglob("*.py"))
print("**/*.py:", [p.name for p in all_py])

# Largest file
biggest = max(base.rglob("*"), key=lambda p: p.stat().st_size if p.is_file() else 0)
print(f"Largest: {biggest.name}")`,
    },
  ],
  starterCode: `from pathlib import Path

# Build a small project directory and analyse it
project = Path("/tmp/my_project")

# Create structure
for folder in ["src", "tests", "docs", "data"]:
    (project / folder).mkdir(parents=True, exist_ok=True)

# Create some files
files = {
    "src/main.py":    "def main(): pass",
    "src/utils.py":   "def helper(): pass\\n" * 10,
    "tests/test_main.py": "import unittest\\n" * 5,
    "docs/README.md": "# My Project\\nA demo project.",
    "data/sample.csv":"name,age\\nAlice,30\\nBob,25\\n",
}
for path, content in files.items():
    (project / path).write_text(content)

# Analyse the project
print(f"Project: {project}")
print(f"Total files: {sum(1 for _ in project.rglob('*') if _.is_file())}")
print()

by_ext: dict[str, list] = {}
for f in project.rglob("*"):
    if f.is_file():
        by_ext.setdefault(f.suffix, []).append(f)

for ext, files_list in sorted(by_ext.items()):
    total_bytes = sum(f.stat().st_size for f in files_list)
    print(f"{ext or '(no ext)':8s}: {len(files_list)} files, {total_bytes} bytes")
`,
};
