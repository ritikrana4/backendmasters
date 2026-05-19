export const content = {
  title: "Transactions & ACID",
  sections: [
    {
      heading: "What is a Transaction?",
      body: `A **transaction** is a group of SQL statements that execute as a single unit — either all succeed or all fail together. Without transactions, a crash midway through a multi-step operation (like transferring money) could leave data in an inconsistent state.`,
      code: `-- Transfer $100 from Alice to Bob
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE user_id = 1; -- Alice
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2; -- Bob

-- If both succeed:
COMMIT;   -- make changes permanent

-- If something went wrong:
ROLLBACK; -- undo everything back to before BEGIN

-- Example with error handling in Python (psycopg2):
try:
    conn.execute("UPDATE accounts SET balance = balance - 100 WHERE user_id = 1")
    conn.execute("UPDATE accounts SET balance = balance + 100 WHERE user_id = 2")
    conn.commit()
except Exception:
    conn.rollback()   # both updates are undone`,
    },
    {
      heading: "ACID Properties",
      body: `**ACID** defines the four guarantees that make database transactions reliable. Every production database that claims to be transactional must satisfy all four.`,
      items: [
        "**Atomicity** — all statements in a transaction succeed together, or none of them do. No partial commits.",
        "**Consistency** — a transaction brings the database from one valid state to another. All constraints, foreign keys, and rules are enforced.",
        "**Isolation** — concurrent transactions don't interfere with each other. Each transaction sees a consistent snapshot of the data.",
        "**Durability** — once committed, data survives crashes. Changes are written to durable storage (WAL / write-ahead log).",
      ],
    },
    {
      heading: "Isolation Levels",
      body: `**Isolation levels** control how much one transaction can see the in-progress work of other concurrent transactions. Higher isolation = more consistency, more locking. Lower isolation = better performance, more anomalies.`,
      code: `-- Set isolation level for the current transaction
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- The four standard isolation levels (weakest to strongest):

-- 1. READ UNCOMMITTED (rarely used)
--    Can read uncommitted changes from other transactions (dirty reads)
--    Most DBs don't implement this; PostgreSQL maps it to READ COMMITTED

-- 2. READ COMMITTED (PostgreSQL default)
--    Only sees committed data. Can see different data on re-reads within the same tx.
--    Prevents: dirty reads
--    Allows: non-repeatable reads, phantom reads

-- 3. REPEATABLE READ
--    Same query returns same rows within the transaction.
--    Prevents: dirty reads, non-repeatable reads
--    Allows: phantom reads (new rows added by other tx may appear)

-- 4. SERIALIZABLE (strongest)
--    Transactions appear to execute one at a time (serial order).
--    Prevents all anomalies. Highest contention.
--    Use for: financial transfers, inventory deduction, anything requiring strong consistency

BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT balance FROM accounts WHERE user_id = 1;
-- ... application logic ...
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
COMMIT;`,
    },
    {
      heading: "Concurrency Anomalies",
      body: `Each isolation level prevents a different set of anomalies. Understanding these is essential for backend interviews.`,
      items: [
        "**Dirty read** — reading uncommitted data from another transaction. If that transaction rolls back, you read data that never existed.",
        "**Non-repeatable read** — reading the same row twice within one transaction gets different values because another transaction committed an update between reads.",
        "**Phantom read** — running the same range query twice within one transaction returns different rows because another transaction inserted/deleted rows between reads.",
        "**Lost update** — two transactions both read a value, both modify it, one overwrites the other's change. Classic with `balance = balance + X` patterns.",
        "**Write skew** — two transactions read overlapping data, each makes a decision based on what they read, and together their writes violate a constraint that neither violated alone.",
      ],
    },
    {
      heading: "Deadlocks & SAVEPOINTs",
      body: `A **deadlock** occurs when two transactions each hold a lock the other needs — both wait forever. Databases detect and break deadlocks by aborting one transaction. **SAVEPOINTs** let you partially roll back within a transaction.`,
      code: `-- Deadlock scenario:
-- Transaction A: locks row 1, tries to lock row 2
-- Transaction B: locks row 2, tries to lock row 1
-- → Deadlock. DB kills one transaction, the other succeeds.

-- Prevention: always acquire locks in the same order
-- If transferring between accounts, always lock the lower ID first:
BEGIN;
SELECT * FROM accounts WHERE user_id IN (1, 2) ORDER BY user_id FOR UPDATE;
-- Now both transactions acquire locks in the same order → no deadlock
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;
COMMIT;

-- SAVEPOINT: partial rollback within a transaction
BEGIN;

INSERT INTO orders (user_id, total) VALUES (42, 100.00);
SAVEPOINT after_order;

INSERT INTO order_items (order_id, product_id) VALUES (1, 99);  -- might fail
-- If it fails:
ROLLBACK TO SAVEPOINT after_order;  -- order is still there, items rolled back

COMMIT;  -- commits everything up to the last savepoint`,
    },
  ],
};
