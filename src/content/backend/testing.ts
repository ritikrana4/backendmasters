export const content = {
  title: "Testing Backend Systems",
  sections: [
    {
      heading: "The Testing Pyramid",
      body: `The **testing pyramid** describes the ideal distribution of test types. Many fast unit tests at the base, fewer integration tests in the middle, and a small number of end-to-end tests at the top. Inverting this (too many E2E tests) leads to slow, flaky test suites.`,
      items: [
        "**Unit tests** — test one function or class in isolation. Fast (milliseconds), no I/O, many of them. Mocks replace dependencies.",
        "**Integration tests** — test multiple components working together, usually with a real database. Slower, fewer of them.",
        "**API / contract tests** — test the full request/response cycle against real HTTP endpoints. Verify the contract that clients depend on.",
        "**End-to-end tests** — test the full system from UI to DB. Slowest, most brittle, fewest. Reserve for critical user journeys.",
        "**The goal**: a test suite that runs in under 5 minutes and gives you confidence to deploy. Speed and reliability matter as much as coverage.",
      ],
    },
    {
      heading: "Unit Testing with pytest",
      body: `**pytest** is the standard Python testing framework. It's simple, extensible, and has a rich ecosystem of plugins.`,
      code: `# tests/test_user_service.py
import pytest
from unittest.mock import MagicMock, patch
from services.user_service import UserService
from models import User

# Simple unit test — no I/O, fast
def test_get_user_by_email_found():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = User(
        id=1, email="alice@example.com", name="Alice"
    )
    service = UserService(db=mock_db)
    user = service.get_by_email("alice@example.com")
    assert user.name == "Alice"

def test_get_user_by_email_not_found():
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None
    service = UserService(db=mock_db)
    assert service.get_by_email("nobody@example.com") is None

# Parametrized tests — run the same test with multiple inputs
@pytest.mark.parametrize("email,valid", [
    ("alice@example.com", True),
    ("not-an-email", False),
    ("", False),
    ("@nodomain.com", False),
])
def test_email_validation(email, valid):
    assert is_valid_email(email) == valid

# Fixtures — reusable setup/teardown
@pytest.fixture
def user():
    return User(id=1, email="alice@example.com", name="Alice")

def test_user_display_name(user):
    assert user.display_name == "Alice"`,
    },
    {
      heading: "Integration Testing with a Real Database",
      body: `Integration tests should use a **real database** — not mocks. A mock DB verifies that your code calls the right methods; a real DB verifies that the queries actually work.`,
      code: `# conftest.py — shared fixtures
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base

TEST_DATABASE_URL = "postgresql://postgres:test@localhost:5432/testdb"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(engine)  # create tables
    yield engine
    Base.metadata.drop_all(engine)   # clean up

@pytest.fixture(scope="function")
def db(engine):
    # Each test gets a transaction that is rolled back at the end
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()  # undo all changes → clean state for next test
    connection.close()

# tests/test_user_repository.py
def test_create_user(db):
    user = User(email="alice@example.com", name="Alice")
    db.add(user)
    db.flush()  # get ID without committing

    fetched = db.query(User).filter_by(email="alice@example.com").first()
    assert fetched is not None
    assert fetched.name == "Alice"`,
    },
    {
      heading: "API Testing with TestClient",
      body: `Test your HTTP endpoints end-to-end, hitting the real application logic and database, without starting a real server.`,
      code: `# tests/test_api_users.py
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client(db):
    # Override DB dependency with test DB session
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

def test_create_user(client):
    response = client.post("/users", json={
        "name": "Alice",
        "email": "alice@example.com",
        "password": "securepassword123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert "password" not in data  # never leak passwords

def test_get_user_not_found(client):
    response = client.get("/users/99999")
    assert response.status_code == 404

def test_create_user_duplicate_email(client):
    client.post("/users", json={"email": "alice@example.com", "name": "Alice"})
    response = client.post("/users", json={"email": "alice@example.com", "name": "Alice2"})
    assert response.status_code == 409`,
    },
    {
      heading: "Test Doubles & What to Mock",
      body: `**Test doubles** (mocks, stubs, fakes) replace real dependencies in tests. Mock the right things — not too little (slow flaky tests), not too much (tests that don't catch real bugs).`,
      items: [
        "**Mock external HTTP calls** — real HTTP calls in tests are slow and break if the service is down. Use `httpretty`, `responses`, or `respx`.",
        "**Mock email/SMS senders** — never send real emails in tests. Use a fake SMTP server or mock the send function.",
        "**Don't mock the database** — integration tests should use a real test database. Mocking the DB only verifies your code, not your queries.",
        "**Don't mock your own code** — if you're mocking internal services/functions heavily, your architecture needs refactoring.",
        "**Fakes** — a real but lightweight implementation (in-memory dict instead of Redis). More realistic than mocks, less setup than real services.",
        "**Factories** — use `factory_boy` or `polyfactory` to generate test data with sensible defaults. Avoid manually constructing complex objects in every test.",
      ],
    },
  ],
};
