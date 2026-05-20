export const content = {
  title: "ECS, Fargate & EKS",
  sections: [
    {
      heading: "ECS Architecture",
      body: "**Amazon ECS (Elastic Container Service)** is AWS's managed container orchestrator. You define what containers to run (task definitions) and how many (services), and ECS schedules and runs them on your chosen infrastructure.\n\nECS has two components: the **control plane** (managed by AWS — the scheduler, service discovery, health checking) and the **data plane** (where containers actually run). The data plane is your choice: EC2 instances you manage, or **AWS Fargate** (serverless — AWS manages the VMs).",
      items: [
        "`Task definition` — a blueprint for your containers: which Docker image, CPU/memory, port mappings, env vars, volumes, IAM role.",
        "`Task` — a running instance of a task definition. Equivalent to a pod in Kubernetes.",
        "`Service` — maintains N running tasks and replaces failed ones. Integrates with load balancers and auto-scales.",
        "`Cluster` — the logical grouping of tasks and services. One cluster can contain many services.",
        "`ECR (Elastic Container Registry)` — AWS's private Docker registry. Tightly integrated with ECS and IAM.",
      ],
    },
    {
      heading: "Fargate vs EC2 Launch Type",
      body: "**Fargate** is the serverless data plane: you define CPU/memory per task, and AWS provisions and manages the underlying VM. No patching, no capacity planning, no SSH into nodes. Pay per vCPU-second and GB-second of running tasks.\n\n**EC2 launch type** runs tasks on EC2 instances you provision in the cluster. More control (instance type, storage, GPU support), lower cost at high utilisation, but you manage patching and capacity.\n\nThe usual guidance: **start with Fargate** (less ops overhead), switch to EC2 if cost becomes a concern at scale or if you need specific hardware (GPU, high IOPS NVMe).",
      code: `# Task definition (Fargate)
{
  "family": "api-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123:role/api-task-role",
  "containerDefinitions": [{
    "name": "api",
    "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/api:latest",
    "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
    "environment": [{"name": "ENV", "value": "production"}],
    "secrets": [{
      "name": "DB_PASSWORD",
      "valueFrom": "arn:aws:secretsmanager:us-east-1:123:secret:db-pass"
    }],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/api",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "api"
      }
    }
  }]
}`,
    },
    {
      heading: "ECS Services & Auto Scaling",
      body: "An **ECS Service** ensures a desired number of tasks are always running. If a task crashes, the service starts a replacement. Services integrate with an **Application Load Balancer** (ALB) for traffic distribution and health checks — unhealthy tasks are deregistered and replaced.\n\n**Application Auto Scaling** for ECS services can scale the task count based on CloudWatch metrics: CPU utilisation, memory, SQS queue depth, or custom metrics via target tracking or step scaling policies.",
      items: [
        "`Desired count` — the target number of running tasks. The service controller works to maintain this.",
        "`Deployment` — rolling by default: start new tasks, wait for health checks, stop old ones. Blue-green deployments via CodeDeploy.",
        "`Service discovery` — ECS registers tasks in AWS Cloud Map so other services can find them by DNS name.",
        "`Capacity provider` — strategy for distributing tasks between Fargate (on-demand), Fargate Spot (70% cheaper, interruptible), and EC2.",
      ],
    },
    {
      heading: "EKS — Kubernetes on AWS",
      body: "**Amazon EKS (Elastic Kubernetes Service)** runs managed Kubernetes control planes. AWS handles the API server, etcd, and control plane HA. You manage worker nodes (EC2 or Fargate via Fargate profiles).\n\nUse EKS when you need Kubernetes-specific features: Helm charts from the ecosystem, custom operators, workloads that need to be portable across clouds, or an existing Kubernetes-first organisation. ECS is simpler and cheaper for teams that don't have a Kubernetes requirement.",
      items: [
        "`Managed node groups` — AWS-managed EC2 Auto Scaling Groups for worker nodes. Handles draining and replacement.",
        "`Fargate profiles` — run pods serverlessly on Fargate; no nodes to manage. Works for stateless workloads.",
        "`eksctl` — the official CLI for creating and managing EKS clusters.",
        "`EKS vs ECS` — EKS: Kubernetes API, richer ecosystem, more complexity. ECS: AWS-native, simpler, tighter AWS integration.",
        "`AWS Load Balancer Controller` — Kubernetes controller that provisions ALBs for `Ingress` resources automatically.",
      ],
    },
  ],
};
