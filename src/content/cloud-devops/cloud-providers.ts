import type { DiagramConfig } from "@/components/FlowDiagram";

const cloudDiagram: DiagramConfig = {
  width: 760,
  height: 220,
  caption: "Cloud service layers: your app sits on compute, backed by managed databases, object storage, CDN for static assets, and a load balancer to distribute traffic",
  nodes: [
    { id: "app",  type: "client",       label: "Your App",          x: 75,  y: 110 },
    { id: "alb",  type: "loadbalancer", label: "Load Balancer\n(ALB)", x: 240, y: 110 },
    { id: "ec2",  type: "server",       label: "Compute\n(EC2/Fargate)", x: 420, y: 110 },
    { id: "rds",  type: "database",     label: "Managed DB\n(RDS)",  x: 600, y: 50  },
    { id: "s3",   type: "cache",        label: "Object Storage\n(S3)", x: 600, y: 130 },
    { id: "cdn",  type: "cdn",          label: "CDN\n(CloudFront)",  x: 600, y: 200 },
  ],
  edges: [
    { from: "app",  to: "alb",  label: "HTTPS" },
    { from: "alb",  to: "ec2",  label: "forward" },
    { from: "ec2",  to: "rds",  label: "SQL" },
    { from: "ec2",  to: "s3",   label: "SDK" },
    { from: "s3",   to: "cdn",  label: "origin", dashed: true },
  ],
};

export const content = {
  title: "Cloud Providers & Core Services",
  sections: [
    {
      heading: "The Big Three",
      diagram: cloudDiagram,
      body: `**AWS (Amazon Web Services)** is the oldest and largest cloud provider, with the broadest service catalogue (~200+ services) and the largest ecosystem of third-party tooling. If you're unsure which cloud to use, AWS is usually the safe default — the talent pool is largest and most tutorials target it.

**GCP (Google Cloud Platform)** excels at data and ML workloads: BigQuery (serverless data warehouse), Vertex AI, and Pub/Sub are best-in-class. GCP's Kubernetes support is exceptional — they invented Kubernetes and GKE is the most mature managed K8s offering.

**Azure** dominates enterprise and Microsoft-heavy shops. If your company runs Active Directory, Office 365, or .NET workloads, Azure's integration story is compelling. Azure DevOps and GitHub Actions (Microsoft acquired GitHub) create a seamless CI/CD experience.

The **shared responsibility model** is fundamental: the cloud provider secures the physical infrastructure (data centres, network hardware, hypervisors). You are responsible for your data, identity (IAM), OS patching on VMs you manage, and application-level security. Misunderstanding this boundary is the root cause of most cloud security incidents.`,
      items: [
        "`AWS` — widest service breadth, largest talent pool, most third-party integrations",
        "`GCP` — best for data/ML, Kubernetes-native, strong networking (premium tier)",
        "`Azure` — best for Microsoft/enterprise shops, strong AD and DevOps integration",
        "`Multi-cloud` — use multiple providers for resilience or best-of-breed; increases operational complexity",
        "`Shared responsibility` — provider secures hardware; you secure data, IAM, and application code",
      ],
    },
    {
      heading: "Core Service Categories",
      body: `Every major cloud organises services into the same categories. Understanding the categories helps you map a requirement to a service regardless of which cloud you're on.

**Compute**: run code. VMs (EC2/Compute Engine/Azure VMs), containers (ECS/GKE/AKS), serverless functions (Lambda/Cloud Functions/Azure Functions), and managed container platforms (Fargate/Cloud Run).

**Storage**: object storage for unstructured files (S3/GCS/Blob Storage), block storage for VM disks (EBS/Persistent Disk/Managed Disks), file storage for shared NFS (EFS/Filestore).

**Networking**: load balancers (ALB/GLB/Azure LB), CDN (CloudFront/Cloud CDN), DNS (Route 53/Cloud DNS), VPCs for network isolation, private connectivity between your on-prem data centre and the cloud (Direct Connect/Interconnect/ExpressRoute).

**Managed databases**: relational (RDS/Cloud SQL/Azure SQL), NoSQL (DynamoDB/Firestore/Cosmos DB), caching (ElastiCache/Memorystore), search (OpenSearch/Elasticsearch).

The guiding principle for managed services: let the cloud provider handle the undifferentiated heavy lifting (patching, backups, failover, capacity planning) so your team focuses on the business logic.`,
      code: `# AWS CLI — authenticate and explore
aws configure                          # set access key, secret, region

# S3: create bucket, upload file, make publicly readable
aws s3 mb s3://my-unique-bucket-name
aws s3 cp ./index.html s3://my-unique-bucket-name/
aws s3 sync ./dist/ s3://my-unique-bucket-name/ --delete

# EC2: list running instances
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].[InstanceId,InstanceType,PublicIpAddress]' \
  --output table

# RDS: list databases
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,DBInstanceClass,DBInstanceStatus]' \
  --output table

# IAM: create a policy-restricted user (principle of least privilege)
aws iam create-user --user-name ci-deployer
aws iam attach-user-policy \
  --user-name ci-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy`,
    },
    {
      heading: "Compute — EC2 & Fargate",
      body: `**EC2** (Elastic Compute Cloud) gives you a virtual machine with full OS control. You choose the instance family (compute-optimised \`c7g\`, memory-optimised \`r7g\`, GPU \`p4d\`), the size (number of vCPUs and GB RAM), and the OS. You're responsible for patching the OS and installing your runtime. EC2 is the most flexible option but also the most work to operate.

**Fargate** is serverless containers: you provide a Docker image and resource requirements (CPU/memory); AWS runs the container somewhere in the fleet without you managing any EC2 instances. No patching, no capacity planning. You pay per second of actual container runtime. Fargate works with both ECS (AWS's container orchestrator) and EKS (managed Kubernetes).

**Lambda** is serverless functions: you provide a function handler; AWS runs it in response to events (API Gateway request, S3 upload, DynamoDB stream, schedule). Billing is per 100 ms of execution. Cold starts (a new execution environment is initialised) add latency on the first invocation. Lambda is ideal for event-driven, short-lived workloads; avoid it for long-running or latency-sensitive APIs.`,
      code: `# Launch an EC2 instance with the AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name my-keypair \
  --security-group-ids sg-0abcd1234 \
  --subnet-id subnet-0abcd1234 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web}]'

# ECS task definition (Fargate) — minimal example
{
  "family": "web",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [{
    "name": "web",
    "image": "ghcr.io/myorg/myapp:latest",
    "portMappings": [{"containerPort": 8000}],
    "environment": [
      {"name": "ENV", "value": "production"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/web",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}`,
    },
    {
      heading: "Storage & Databases",
      body: `**S3** (Simple Storage Service) is the backbone of AWS data storage. It stores objects (files) of any size in named buckets. Common uses: static website hosting, application file uploads (user avatars, documents), data lake raw storage, CI/CD artifact storage, and Terraform state. Objects are replicated across multiple Availability Zones automatically. Lifecycle policies automatically transition objects to cheaper storage classes (S3-IA, Glacier) as they age.

**RDS** (Relational Database Service) is a managed PostgreSQL, MySQL, MariaDB, Oracle, or SQL Server instance. AWS handles backups (automated daily snapshots + point-in-time recovery), Multi-AZ failover (synchronous replica in a second AZ, automatic failover in ~60 s), read replicas, OS patching, and minor version upgrades. You focus on your schema and queries.

**DynamoDB** is AWS's managed NoSQL key-value and document store. Single-digit millisecond latency at any scale, with no servers to manage. Best for access patterns you know upfront (get item by primary key, query by partition key). Complex queries and joins are awkward — DynamoDB rewards you for denormalising your data model.`,
      code: `import boto3

# S3: upload a file with server-side encryption
s3 = boto3.client("s3")
s3.upload_file(
    "local_file.pdf",
    "my-bucket",
    "uploads/file.pdf",
    ExtraArgs={
        "ServerSideEncryption": "AES256",
        "ContentType": "application/pdf",
    }
)

# Generate a pre-signed URL (allow temporary access without public ACL)
url = s3.generate_presigned_url(
    "get_object",
    Params={"Bucket": "my-bucket", "Key": "uploads/file.pdf"},
    ExpiresIn=3600,    # 1 hour
)

# DynamoDB: put and get an item
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Users")

table.put_item(Item={
    "user_id": "u-123",
    "email": "alice@example.com",
    "created_at": "2024-01-15T10:30:00Z",
})

response = table.get_item(Key={"user_id": "u-123"})
user = response.get("Item")`,
    },
  ],
};
