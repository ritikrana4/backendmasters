export const content = {
  title: "Virtual Environments & pip",
  sections: [
    {
      heading: "Why Virtual Environments?",
      body: `When you install a Python package with \`pip install\`, it goes into your system-wide Python installation — shared by every project. This causes "dependency hell": Project A needs \`requests==2.28\` while Project B needs \`requests==2.31\`. A **virtual environment** is an isolated Python installation per project, with its own packages, solving this completely.`,
      items: [
        "Each project gets its own isolated package directory",
        "Different projects can use different versions of the same package",
        "You can delete a venv and start fresh without touching your system Python",
        "Other developers can recreate your exact environment from `requirements.txt`",
      ],
    },
    {
      heading: "Creating and Activating a venv",
      body: `Python 3 ships with \`venv\` built in — no install needed. Create one inside your project directory, then activate it. After activation, \`python\` and \`pip\` point to the isolated environment, not the system Python.`,
      code: `# 1. Create a virtual environment (run once per project)
python -m venv .venv

# 2. Activate it
# macOS / Linux:
source .venv/bin/activate

# Windows (Command Prompt):
# .venv\\Scripts\\activate.bat

# Windows (PowerShell):
# .venv\\Scripts\\Activate.ps1

# 3. Your prompt changes — you're inside the venv now:
# (.venv) $

# 4. Deactivate when done
deactivate`,
    },
    {
      heading: "pip — Installing Packages",
      body: `With your venv active, \`pip install\` puts packages inside it. Use \`pip list\` to see installed packages and \`pip show\` to inspect one. Always activate the venv first — otherwise you'll install into the wrong place.`,
      code: `# Install a package
pip install requests

# Install a specific version
pip install "requests==2.31.0"

# Install multiple at once
pip install flask sqlalchemy pytest

# Upgrade a package
pip install --upgrade requests

# Uninstall
pip uninstall requests

# List all installed packages
pip list

# Show details about a package
pip show requests`,
    },
    {
      heading: "requirements.txt",
      body: `\`requirements.txt\` is a plain text file that lists your project's dependencies. It allows any developer to recreate the exact same environment. Commit it to version control — but never commit the \`.venv/\` directory itself.`,
      code: `# Freeze current environment into requirements.txt
pip freeze > requirements.txt

# requirements.txt looks like:
# certifi==2024.2.2
# charset-normalizer==3.3.2
# idna==3.7
# requests==2.31.0
# urllib3==2.2.1

# Install everything from requirements.txt (new machine / new clone)
pip install -r requirements.txt

# For development extras, many projects use:
# requirements.txt        — production dependencies
# requirements-dev.txt    — + testing, linting, type checking tools`,
    },
    {
      heading: "Modern Alternatives",
      body: `\`venv\` + \`pip\` is the standard, built-in workflow. Several modern tools improve on it:`,
      items: [
        "`pipenv` — combines venv + pip + a lock file (`Pipfile.lock`) for reproducible installs",
        "`poetry` — dependency management, packaging, and publishing in one tool; uses `pyproject.toml`",
        "`uv` — drop-in replacement for pip written in Rust; 10–100× faster installs; gaining fast adoption",
        "`conda` — common in data science; manages Python versions and non-Python binary dependencies",
        "`pyproject.toml` — the modern standard for declaring project metadata and dependencies (replaces `setup.py`)",
      ],
    },
    {
      heading: "The .gitignore Rule",
      body: `Your \`.venv\` folder can contain thousands of files. Never commit it to git — it can be recreated from \`requirements.txt\`. Add it to \`.gitignore\`. Also ignore \`__pycache__\` and \`*.pyc\` files, which Python generates automatically.`,
      code: `# .gitignore — add these entries
.venv/
venv/
env/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/

# Check what git would track (run this before first commit)
git status

# Confirm .venv is ignored
git check-ignore -v .venv`,
    },
  ],
};
