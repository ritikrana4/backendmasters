export const content = {
  title: "Authentication & Authorization",
  sections: [
    {
      heading: "Authentication vs Authorization",
      body: `These two concepts are always used together but mean different things. **Authentication** answers "who are you?" — verifying identity. **Authorization** answers "what are you allowed to do?" — checking permissions. You must authenticate before you can be authorized.`,
      items: [
        "**401 Unauthorized** — actually means *unauthenticated*: we don't know who you are",
        "**403 Forbidden** — authenticated but not *authorized*: we know who you are, but you can't do this",
        "A logged-in user getting 403 on `/admin` is authorization failure",
        "A request with no token getting 401 is authentication failure",
      ],
    },
    {
      heading: "API Keys",
      body: `The simplest form of API authentication: a long random string issued to a client, sent with every request. No expiry, no refresh — just revoke and reissue when compromised. Common for server-to-server communication and developer tools.`,
      code: `# API key in header (preferred)
GET /api/data HTTP/1.1
X-API-Key: sk_live_abc123def456xyz789

# API key as query parameter (avoid — keys appear in logs and browser history)
GET /api/data?api_key=sk_live_abc123def456xyz789

# API key in Authorization header
GET /api/data HTTP/1.1
Authorization: ApiKey sk_live_abc123def456xyz789

# Best practices:
# - Never commit API keys to source control
# - Use environment variables: os.environ['API_KEY']
# - Rotate keys regularly
# - Use separate keys for dev/staging/production
# - Scope keys to minimum permissions (read-only, write, admin)`,
    },
    {
      heading: "JWT — JSON Web Tokens",
      body: `A **JWT** (pronounced "jot") is a compact, self-contained token that encodes claims (user ID, roles, expiry) and is cryptographically signed. The server doesn't need to look up the token in a database — it can verify the signature and read the claims directly. This makes JWTs **stateless** and great for distributed systems.`,
      code: `# A JWT has three base64url-encoded parts, separated by dots:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header
.
eyJzdWIiOiI0MiIsIm5hbWUiOiJBbGljZSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcxNjA3MzYwMH0
                                         ← Payload (claims)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                                         ← Signature

# Decoded payload:
{
  "sub": "42",           ← subject (user ID)
  "name": "Alice",
  "role": "admin",
  "iat": 1716000000,     ← issued at
  "exp": 1716086400      ← expires at (24hrs later)
}

# Usage in requests:
Authorization: Bearer eyJhbGci...

# The server:
# 1. Splits the token at dots
# 2. Verifies the signature using its secret key
# 3. Checks exp claim hasn't passed
# 4. Reads claims — no DB lookup needed`,
    },
    {
      heading: "OAuth 2.0",
      body: `**OAuth 2.0** is an authorization framework that allows an application to access resources on behalf of a user, without the user giving their password to the app. It introduces four roles and several "flows" (grant types) for different scenarios.`,
      code: `# The Authorization Code Flow (most common for web apps)

# Step 1: App redirects user to authorization server
https://accounts.google.com/oauth/authorize
  ?client_id=your_client_id
  &redirect_uri=https://yourapp.com/callback
  &scope=profile email
  &response_type=code
  &state=random_csrf_token

# Step 2: User logs in and approves access
# Authorization server redirects back:
https://yourapp.com/callback?code=AUTH_CODE_HERE&state=random_csrf_token

# Step 3: App exchanges code for tokens (server-to-server)
POST https://oauth2.googleapis.com/token
{
  "code": "AUTH_CODE_HERE",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "authorization_code"
}
→ { "access_token": "...", "refresh_token": "...", "expires_in": 3600 }

# Step 4: App uses access token
GET https://api.google.com/userinfo
Authorization: Bearer ACCESS_TOKEN`,
    },
    {
      heading: "Refresh Tokens and Token Expiry",
      body: `Short-lived access tokens (15 minutes to 1 hour) limit damage if leaked. **Refresh tokens** are long-lived tokens used to get new access tokens without re-authentication. Store refresh tokens securely — they're essentially passwords.`,
      code: `# Token lifecycle
POST /auth/login
→ { "access_token": "...", "expires_in": 900, "refresh_token": "..." }
#                              ↑ 15 minutes

# When access token expires, client gets 401:
GET /api/me
Authorization: Bearer expired_token
← 401 Unauthorized

# Client silently refreshes:
POST /auth/refresh
{ "refresh_token": "long_lived_refresh_token" }
→ { "access_token": "new_token", "expires_in": 900 }

# If refresh token is also expired — force re-login

# Storage recommendations:
# access_token  → memory (JS variable) or short-lived cookie
# refresh_token → httpOnly, Secure, SameSite=Strict cookie
#               → NEVER localStorage (vulnerable to XSS)`,
    },
  ],
};
