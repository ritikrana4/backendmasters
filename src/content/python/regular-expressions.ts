export const content = {
  title: "Regular Expressions",
  sections: [
    {
      heading: "What are Regular Expressions?",
      body: `A regular expression (regex) is a pattern that describes a set of strings. Python's \`re\` module lets you search, match, extract, and replace text using these patterns. Always use raw strings (\`r"..."\`) for patterns — they prevent Python from interpreting backslashes before the regex engine sees them.`,
      code: `import re

text = "The price is $42.99 and the code is ABC-123."

# re.search — find first match anywhere in the string
match = re.search(r"\\d+\\.\\d+", text)
if match:
    print("Found:", match.group())   # 42.99

# re.findall — return all non-overlapping matches as a list
numbers = re.findall(r"\\d+", text)
print("All numbers:", numbers)   # ['42', '99', '123']`,
    },
    {
      heading: "Core Pattern Syntax",
      body: `Regex patterns are built from special characters and quantifiers:`,
      items: [
        "`\\\\d` — any digit (0–9); `\\\\D` — non-digit",
        "`\\\\w` — any word character (letters, digits, `_`); `\\\\W` — non-word",
        "`\\\\s` — any whitespace (space, tab, newline); `\\\\S` — non-whitespace",
        "`.` — any character except newline",
        "`^` — start of string; `$` — end of string",
        "`*` — 0 or more; `+` — 1 or more; `?` — 0 or 1",
        "`{n}` — exactly n; `{n,m}` — between n and m",
        "`[abc]` — any of a, b, or c; `[a-z]` — range; `[^a]` — not a",
        "`|` — alternation (OR): `cat|dog` matches either",
      ],
      code: `import re

# Match a UK postcode pattern: letters, digits, space, letters, digits
postcode_pattern = r"[A-Z]{1,2}\\d[\\dA-Z]?\\s\\d[A-Z]{2}"

texts = ["London SW1A 1AA", "not a postcode", "Edinburgh EH1 1YZ"]
for t in texts:
    match = re.search(postcode_pattern, t)
    print(f"{t!r}: {'found: ' + match.group() if match else 'no match'}")`,
    },
    {
      heading: "Groups and Capture",
      body: `Wrap part of a pattern in \`()\` to create a capture group. \`match.group(0)\` is the full match; \`match.group(1)\`, \`group(2)\`, etc. are the captured groups. Named groups (\`(?P<name>...)\`) make code more readable.`,
      code: `import re

# Named groups: capture date parts
pattern = r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})"
date_str = "Today is 2026-05-18."

m = re.search(pattern, date_str)
if m:
    print("Full match:", m.group(0))   # 2026-05-18
    print("Year:",  m.group("year"))    # 2026
    print("Month:", m.group("month"))   # 05
    print("Day:",   m.group("day"))     # 18

# findall with groups returns list of tuples
log = "Error at 12:34:56. Warning at 09:01:23."
times = re.findall(r"(\\d{2}):(\\d{2}):(\\d{2})", log)
print(times)   # [('12', '34', '56'), ('09', '01', '23')]`,
    },
    {
      heading: "Substitution with re.sub",
      body: `\`re.sub(pattern, replacement, string)\` replaces all matches. The replacement can be a string (with \`\\\\1\` backreferences to groups) or a callable that receives the match object and returns a string.`,
      code: `import re

text = "Hello   world.  Too   many  spaces."

# Collapse multiple spaces into one
cleaned = re.sub(r"\\s+", " ", text)
print(cleaned)   # Hello world. Too many spaces.

# Reformat dates from MM/DD/YYYY to YYYY-MM-DD
dates = "Born 05/18/1990, married 06/15/2015"
reformatted = re.sub(
    r"(\\d{2})/(\\d{2})/(\\d{4})",
    r"\\3-\\1-\\2",
    dates
)
print(reformatted)
# Born 1990-05-18, married 2015-06-15`,
    },
    {
      heading: "Compiling Patterns",
      body: `If you use the same pattern many times, compile it with \`re.compile()\` for a small performance gain and improved readability. The compiled object has all the same methods (\`search\`, \`findall\`, \`sub\`, etc.).`,
      code: `import re

EMAIL = re.compile(
    r"[a-zA-Z0-9._%+-]+"   # local part
    r"@"
    r"[a-zA-Z0-9.-]+"      # domain
    r"\\.[a-zA-Z]{2,}"     # TLD
)

texts = [
    "Contact us at hello@example.com or support@panel.dev",
    "Not an email: user@",
    "Also valid: first.last+tag@sub.domain.org",
]

for t in texts:
    found = EMAIL.findall(t)
    if found:
        print(f"Emails in {t!r}:")
        for email in found:
            print(f"  {email}")`,
    },
  ],
  starterCode: `# Regular Expressions practice
import re

# Sample text to analyse
text = """
Alice Johnson (alice@example.com) — joined 2023-03-15
Bob Smith (bob.smith@company.co.uk) — joined 2022-11-01
Charlie Brown (charlie@test.org) — joined 2024-07-22
"""

# 1. Extract all email addresses
emails = re.findall(r"[\\w.%+-]+@[\\w.-]+\\.[a-zA-Z]{2,}", text)
print("Emails found:")
for e in emails:
    print(f"  {e}")

# 2. Extract all dates (YYYY-MM-DD) with named groups
date_pattern = re.compile(r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})")
print("\\nJoin dates:")
for m in date_pattern.finditer(text):
    print(f"  {m.group('day')}/{m.group('month')}/{m.group('year')}")

# 3. Extract names (Title Case words before parentheses)
names = re.findall(r"([A-Z][a-z]+ [A-Z][a-z]+) \\(", text)
print("\\nNames:", names)
`,
};
