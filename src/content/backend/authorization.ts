export const content = {
  title: "Authorization & RBAC",
  sections: [
    {
      heading: "Authentication vs Authorization",
      body: `**Authentication** answers "who are you?" — verifying identity with credentials. **Authorization** answers "what are you allowed to do?" — checking permissions for a verified identity. They always work together but are distinct concerns that should be implemented separately.`,
      items: [
        "**401 Unauthorized** — actually means unauthenticated: identity not established",
        "**403 Forbidden** — authenticated but not authorized: we know who you are, you just can't do this",
        "Authorization should happen at the **handler level** (route guards) AND at the **data level** (row-level security)",
        "Never let authorization logic leak into the database layer — check permissions before querying",
      ],
    },
    {
      heading: "Role-Based Access Control (RBAC)",
      body: `**RBAC** assigns permissions to roles, and roles to users. Users inherit the permissions of their roles. Simple, auditable, and sufficient for most applications.`,
      code: `# Role hierarchy example
# guest   → can read public content
# user    → can read + create own content
# editor  → can edit any content
# admin   → full access

# Database schema
CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE  -- 'user', 'editor', 'admin'
);

CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permissions (
  id       SERIAL PRIMARY KEY,
  resource TEXT NOT NULL,  -- 'post', 'user', 'billing'
  action   TEXT NOT NULL   -- 'read', 'create', 'update', 'delete'
);

CREATE TABLE role_permissions (
  role_id       INTEGER REFERENCES roles(id),
  permission_id INTEGER REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

# Python: check permission in handler
def require_permission(resource: str, action: str):
    def decorator(func):
        async def wrapper(request, current_user, *args, **kwargs):
            if not user_has_permission(current_user, resource, action):
                raise HTTPException(403, "Forbidden")
            return await func(request, current_user, *args, **kwargs)
        return wrapper
    return decorator

@router.delete("/posts/{post_id}")
@require_permission("post", "delete")
async def delete_post(post_id: int, current_user: User):
    ...`,
    },
    {
      heading: "Attribute-Based Access Control (ABAC)",
      body: `**ABAC** makes access decisions based on attributes of the user, the resource, and the environment — not just roles. More flexible than RBAC, but more complex to implement and audit.`,
      code: `# ABAC example: a user can edit a post only if they are the author
# AND the post is not published AND they have the 'editor' role

def can_edit_post(user: User, post: Post) -> bool:
    # Attribute: is the user the author?
    if user.id == post.author_id:
        return True
    # Attribute: does the user have editor role?
    if "editor" in user.roles:
        return True
    return False

# Row-level security: filter data based on who's asking
def get_posts(db, current_user: User):
    if "admin" in current_user.roles:
        return db.query(Post).all()  # admins see everything
    return (
        db.query(Post)
        .filter(
            (Post.author_id == current_user.id) |  # own posts
            (Post.is_published == True)            # or published posts
        )
        .all()
    )

# PostgreSQL Row-Level Security (enforced at DB level)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_select_policy ON posts
  FOR SELECT
  USING (
    is_published = true
    OR author_id = current_setting('app.current_user_id')::int
  );`,
    },
    {
      heading: "Protecting Routes",
      body: `Authorization should be enforced at multiple layers: the API gateway (coarse-grained), route middleware (role checks), and the service layer (ownership checks). Defense in depth.`,
      code: `# FastAPI: dependency injection for auth + authorization

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)) -> User:
    payload = verify_token(token.credentials)
    user = db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(401, "Invalid credentials")
    return user

def require_role(*roles: str):
    async def checker(user: User = Depends(get_current_user)):
        if not any(r in user.roles for r in roles):
            raise HTTPException(403, "Insufficient permissions")
        return user
    return checker

# Route-level protection
@router.get("/admin/users")
async def list_all_users(user: User = Depends(require_role("admin"))):
    return db.query(User).all()

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user)
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(404)
    # Ownership check — not just role check
    if post.author_id != current_user.id and "admin" not in current_user.roles:
        raise HTTPException(403)
    db.delete(post)`,
    },
    {
      heading: "OAuth Scopes",
      body: `In OAuth 2.0, **scopes** are a form of authorization — they define what access an application is granted on behalf of a user. Fine-grained scopes prevent over-permission.`,
      items: [
        "**Scopes** are strings that represent specific permissions: `read:users`, `write:posts`, `billing:read`",
        "When a user authorizes an OAuth app, they approve a specific set of scopes — the app can only do what those scopes allow",
        "**Principle of least privilege**: request only the scopes you need. Never request admin scopes unless absolutely required.",
        "**Scope enforcement**: your API validates that the token's scopes match the required scope for each endpoint",
        "Example scopes: `profile` (read user info), `email` (access email), `repo` (GitHub: access repos), `read_write` (Stripe: charge cards)",
        "**API keys with scopes**: assign permissions to API keys too — a read-only key shouldn't be able to delete data even if leaked",
      ],
    },
  ],
};
