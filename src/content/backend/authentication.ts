export const content = {
  title: "Authentication — Sessions & Tokens",
  sections: [
    {
      heading: "Session-Based Authentication",
      body: `**Session-based auth** stores session state server-side. When a user logs in, the server creates a session record in a database or Redis, generates a random session ID, and sends it to the client as a cookie. On each request, the browser sends the cookie and the server looks up the session.`,
      code: `# Login flow
POST /auth/login
{ "email": "alice@example.com", "password": "secret" }

# Server:
# 1. Look up user by email
# 2. Verify password against stored hash (bcrypt/argon2)
# 3. Create session record in Redis or DB
# 4. Return session ID as a cookie

Set-Cookie: session_id=abc123xyz; HttpOnly; Secure; SameSite=Strict; Path=/

# Subsequent requests
GET /api/me
Cookie: session_id=abc123xyz

# Server:
# 1. Extract session_id from cookie
# 2. Look up session in Redis → get user_id
# 3. Load user from DB

# Logout: delete the session record
DELETE /auth/logout
# Server: redis.delete("session:abc123xyz")

# Python example (FastAPI + Redis)
import secrets
import redis

r = redis.Redis()

def create_session(user_id: int) -> str:
    session_id = secrets.token_urlsafe(32)
    r.setex(f"session:{session_id}", 86400, str(user_id))  # 24hr TTL
    return session_id

def get_session_user(session_id: str) -> int | None:
    val = r.get(f"session:{session_id}")
    return int(val) if val else None`,
    },
    {
      heading: "JWT-Based Authentication",
      body: `**JWT (JSON Web Token)** auth is stateless — the token contains user claims and is cryptographically signed. The server validates the signature on every request without a database lookup. Ideal for distributed systems and microservices.`,
      code: `# JWT structure: header.payload.signature (base64url encoded)
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzE2MDkwMDAwfQ.SIG

# Decoded payload
{ "sub": "42", "role": "user", "exp": 1716090000, "iat": 1716003600 }

# Login: server issues access token + refresh token
POST /auth/login
→ {
    "access_token": "eyJ...",      # short-lived: 15 minutes
    "refresh_token": "eyJ...",     # long-lived: 30 days
    "token_type": "Bearer"
  }

# Authenticated request
GET /api/me
Authorization: Bearer eyJ...

# Server:
# 1. Split token at dots
# 2. Verify signature with secret key
# 3. Check exp claim hasn't passed
# 4. Read claims (sub, role) — no DB query needed

# Python with PyJWT
import jwt
from datetime import datetime, timedelta, timezone

SECRET = "your-secret-key"

def create_access_token(user_id: int, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=["HS256"])  # raises on invalid/expired`,
    },
    {
      heading: "Refresh Token Rotation",
      body: `Short-lived access tokens limit damage if leaked. **Refresh tokens** are long-lived tokens that silently issue new access tokens. **Rotation** means each use of a refresh token invalidates it and issues a new one — detecting theft if a stolen token is used.`,
      code: `# Token rotation flow:

# 1. Login — issue both tokens
POST /auth/login
→ { "access_token": "AT1", "refresh_token": "RT1" }

# 2. Access token expires (15 min) → client uses refresh token
POST /auth/refresh
{ "refresh_token": "RT1" }
→ {
    "access_token": "AT2",   # new access token
    "refresh_token": "RT2"   # RT1 is now INVALID — one-time use
  }

# 3. If an attacker steals RT1 and tries to use it after RT2 was issued:
POST /auth/refresh
{ "refresh_token": "RT1" }   # RT1 already used
→ 401 — AND invalidate ALL tokens for this user (reuse detection)

# Secure storage
# access_token  → JavaScript memory (not localStorage — XSS risk)
# refresh_token → HttpOnly, Secure, SameSite=Strict cookie
#                 (not accessible by JavaScript)

# Refresh token storage in DB
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,   -- store hash, not plaintext
  family     UUID NOT NULL,          -- for reuse detection: same family = same session
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);`,
    },
    {
      heading: "Session vs JWT — When to Use Which",
      body: `The choice affects your architecture significantly. Most applications should start with sessions unless they have a specific need for stateless tokens.`,
      items: [
        "**Sessions**: easy to invalidate (just delete from Redis), lower token size in cookies, requires Redis/DB for lookup on every request, great for traditional web apps",
        "**JWT**: stateless (no DB lookup per request), ideal for microservices and mobile APIs, hard to invalidate before expiry — requires a denylist or short TTL",
        "**JWT gotchas**: you cannot log a user out immediately — the token remains valid until expiry. Mitigate with short access token TTLs (15 min) + refresh token rotation.",
        "**Never store tokens in localStorage** — vulnerable to XSS. Use HttpOnly cookies for refresh tokens, memory for access tokens.",
        "**Password hashing**: always use bcrypt or argon2. Never MD5/SHA1. Never store plaintext passwords.",
        "**Rate-limit login endpoints** — prevent brute force attacks. Lock account after N failed attempts.",
      ],
    },
    {
      heading: "Multi-Factor Authentication (MFA)",
      body: `MFA requires a second verification step beyond password. It dramatically reduces account takeover risk — a stolen password alone is not enough.`,
      items: [
        "**TOTP (Time-based One-Time Password)** — apps like Google Authenticator generate a 6-digit code every 30s based on a shared secret (RFC 6238)",
        "**SMS OTP** — one-time code sent via text message. Better than nothing, but vulnerable to SIM-swapping attacks",
        "**Passkeys / WebAuthn** — hardware keys or device biometrics. Phishing-resistant, passwordless, the modern standard",
        "**Backup codes** — one-time recovery codes issued at setup. Store hashed, allow single use only",
        "**Implementation**: after password verification, issue a short-lived 'MFA pending' token. Exchange it for a full session token after the second factor is verified.",
      ],
    },
  ],
};
