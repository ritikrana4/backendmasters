export const content = {
  title: "RDS & Managed Databases",
  sections: [
    {
      heading: "What is RDS?",
      body: "**Amazon RDS (Relational Database Service)** is a managed service that runs relational databases without you administering the underlying servers. AWS handles OS patching, database engine upgrades, backups, failover, and hardware replacement. You just connect and query.\n\nRDS supports PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, and Amazon Aurora. **Aurora** is AWS's own engine: PostgreSQL- and MySQL-compatible, but engineered from scratch for the cloud — it separates compute from storage and replicates data across 3 AZs in 6 copies automatically.",
      items: [
        "`DB instance` — a virtual machine running a database engine in a specific instance class (e.g., `db.t3.medium`, `db.r6g.large`).",
        "`DB subnet group` — the set of private subnets RDS can place instances in. Always use private subnets.",
        "`Parameter group` — a configuration file for the database engine (e.g., `max_connections`, `shared_buffers`).",
        "`Option group` — engine-specific add-ons (e.g., Oracle features). Less commonly used for Postgres/MySQL.",
        "`Aurora` — AWS-native engine: faster, cheaper storage, auto-scales up to 128 TB, and supports serverless mode (Aurora Serverless v2).",
      ],
    },
    {
      heading: "Multi-AZ High Availability",
      body: "In **Multi-AZ** mode, RDS maintains a synchronous standby replica in a different Availability Zone. All writes to the primary are synchronously replicated before being acknowledged. If the primary fails (hardware failure, AZ outage, or even a maintenance reboot), RDS automatically promotes the standby — the DNS endpoint flips within ~30 seconds. No data loss.\n\nMulti-AZ is not a read-scaling solution: the standby is on hot standby only and does not serve reads. For read scaling, add **read replicas**.",
      code: `# Create an RDS PostgreSQL instance with Multi-AZ
aws rds create-db-instance \\
  --db-instance-identifier prod-postgres \\
  --db-instance-class db.t3.medium \\
  --engine postgres \\
  --engine-version 15.4 \\
  --master-username admin \\
  --master-user-password "<from-secrets-manager>" \\
  --allocated-storage 100 \\
  --storage-type gp3 \\
  --multi-az \\
  --db-subnet-group-name my-private-subnets \\
  --vpc-security-group-ids sg-12345 \\
  --backup-retention-period 7 \\
  --no-publicly-accessible`,
      items: [
        "`Synchronous replication` — every write is committed to both primary and standby. Zero RPO (recovery point objective).",
        "`Automatic failover` — typically completes in 60–120 seconds. Your application must handle reconnection; use connection retry logic.",
        "`Maintenance window` — scheduled time for AWS to apply engine patches. Multi-AZ does this with a failover, minimising downtime.",
        "`Aurora Multi-AZ` — Aurora's storage is inherently multi-AZ. Multi-AZ for Aurora means multiple DB instances sharing the same storage layer.",
      ],
    },
    {
      heading: "Read Replicas",
      body: "**Read replicas** are asynchronous copies of the primary instance. They serve SELECT queries, reducing load on the primary. Unlike Multi-AZ, they can lag behind the primary — typically milliseconds but can increase under heavy write load. Never read from a replica when you need the freshest data (e.g., right after a write).\n\nRead replicas can be in the same region, a different region (cross-region replica), or promoted to a standalone primary during a migration or disaster recovery scenario.",
      items: [
        "Create up to 5 read replicas for RDS MySQL/Postgres; Aurora supports up to 15 Aurora Replicas with minimal lag.",
        "`Replica lag` — the delay between a write hitting the primary and being visible on the replica. Monitor `ReplicaLag` in CloudWatch.",
        "`Promotion` — you can promote a read replica to a standalone primary for blue-green deployments or migrations.",
        "`Cross-region replica` — for disaster recovery in another region or serving reads closer to global users.",
      ],
    },
    {
      heading: "Backups, Snapshots & Connection Pooling",
      body: "RDS takes **automated backups** daily (full snapshot + transaction logs) during the backup window. You can restore to any point-in-time within the retention period (1–35 days). **Manual snapshots** persist until you delete them and are used for migrations, pre-deployment snapshots, and long-term retention.\n\n**Connection pooling** is critical for serverless or Lambda workloads — each Lambda invocation can open a new database connection. At 1000 concurrent Lambda executions, you exhaust a typical RDS max_connections. Use **RDS Proxy**, a managed connection pooler that sits in front of RDS and multiplexes thousands of application connections into a small pool of real database connections.",
      code: `# Connect via RDS Proxy instead of directly
# Endpoint: my-proxy.proxy-xxx.us-east-1.rds.amazonaws.com

import psycopg2

conn = psycopg2.connect(
    host="my-proxy.proxy-xxx.us-east-1.rds.amazonaws.com",
    port=5432,
    database="mydb",
    # RDS Proxy handles IAM auth — no password needed with IAM tokens
    user="admin",
    password=get_iam_token(),  # short-lived token
)`,
      items: [
        "`RDS Proxy` — managed connection pooler. Required for Lambda → RDS. Also improves failover time (keeps connections alive across failover).",
        "`max_connections` — a PostgreSQL parameter that limits total simultaneous connections. `db.t3.medium` allows ~170 connections by default.",
        "`pg_bouncer` — open-source connection pooler you manage yourself; runs on an EC2 instance. Alternative to RDS Proxy.",
        "`Automated backup window` — schedule it in off-peak hours. Brief I/O spike during the daily snapshot.",
      ],
    },
  ],
};
