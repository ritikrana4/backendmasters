export const content = {
  title: "API Documentation & OpenAPI",
  sections: [
    {
      heading: "Why Document Your API?",
      body: `An undocumented API is a black box. Consumers (internal teams, external developers) have to read your source code, guess field names, or reverse-engineer behavior from network traffic. Good API documentation reduces onboarding time, support requests, and bugs caused by incorrect usage. **OpenAPI** (formerly Swagger) is the industry standard for machine-readable API specifications.`,
      items: [
        "**OpenAPI Specification** — a JSON/YAML file describing your API: endpoints, request/response schemas, auth, examples",
        "**Swagger UI** — interactive documentation generated from your OpenAPI spec. Lets developers test endpoints in the browser.",
        "**Code generation** — generate client SDKs (TypeScript, Python, Go) directly from the spec",
        "**Contract testing** — use the spec to validate that your implementation matches the spec",
        "**Design-first vs code-first** — design-first: write the spec first, then implement. Code-first: generate the spec from your code (annotations, decorators).",
      ],
    },
    {
      heading: "OpenAPI in FastAPI",
      body: `FastAPI generates OpenAPI specs automatically from type annotations and Pydantic models — one of its biggest advantages. No separate spec file to maintain.`,
      code: `from fastapi import FastAPI, Path, Query
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

app = FastAPI(
    title="My API",
    description="API for managing users and orders",
    version="1.0.0",
)

class UserCreate(BaseModel):
    name:  str          = Field(..., min_length=1, max_length=100, example="Alice Smith")
    email: EmailStr     = Field(..., example="alice@example.com")
    age:   Optional[int] = Field(None, ge=0, le=150, example=30)

class UserResponse(BaseModel):
    id:         int
    name:       str
    email:      str
    created_at: str

    class Config:
        from_attributes = True

@app.post(
    "/users",
    response_model=UserResponse,
    status_code=201,
    summary="Create a new user",
    description="Creates a user account. Email must be unique.",
    responses={
        409: {"description": "Email already registered"},
        422: {"description": "Validation error"},
    },
    tags=["Users"],
)
async def create_user(user: UserCreate) -> UserResponse:
    ...

# Auto-generated docs available at:
# /docs      → Swagger UI (interactive)
# /redoc     → ReDoc (clean read-only docs)
# /openapi.json → raw OpenAPI JSON`,
    },
    {
      heading: "Writing a Manual OpenAPI Spec",
      body: `For non-FastAPI apps, write the OpenAPI spec manually in YAML. This is the design-first approach: spec drives implementation.`,
      code: `# openapi.yaml
openapi: "3.1.0"
info:
  title: User API
  version: "1.0"
  description: Manage user accounts

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: http://localhost:8000
    description: Local

paths:
  /users/{user_id}:
    get:
      summary: Get a user by ID
      operationId: getUser
      tags: [Users]
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: integer
            example: 42
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "404":
          description: User not found

components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id:
          type: integer
          example: 42
        name:
          type: string
          example: Alice Smith
        email:
          type: string
          format: email
          example: alice@example.com

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []`,
    },
    {
      heading: "Keeping Docs in Sync",
      body: `The biggest challenge with API docs is keeping them in sync with the implementation. Stale docs are worse than no docs.`,
      items: [
        "**Auto-generate from code** (FastAPI, Springdoc, tsoa) — spec is always current, no manual sync",
        "**Spec validation in CI** — run `spectral lint openapi.yaml` in CI to enforce spec quality rules",
        "**Contract testing** — use the spec to verify the implementation matches: `schemathesis run openapi.yaml --url http://localhost:8000`",
        "**Versioned docs** — publish docs alongside the API version. `/v1/docs`, `/v2/docs`.",
        "**Changelog** — maintain a `CHANGELOG.md` with breaking changes, deprecations, and additions per version",
        "**Examples are critical** — add realistic `example` values to every field. Developers copy-paste examples, not descriptions.",
      ],
    },
  ],
};
