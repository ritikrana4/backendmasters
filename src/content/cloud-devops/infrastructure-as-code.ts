import type { DiagramConfig } from "@/components/FlowDiagram";

const iacDiagram: DiagramConfig = {
  width: 760,
  height: 200,
  caption: "IaC workflow: an engineer runs Terraform which calls the AWS API to provision EC2, RDS, and S3 resources",
  nodes: [
    { id: "eng",     type: "client",       label: "Engineer",        x: 60,  y: 100 },
    { id: "plan",    type: "client",       label: "terraform plan",  x: 210, y: 100 },
    { id: "apply",   type: "server",       label: "terraform apply", x: 390, y: 100 },
    { id: "aws",     type: "loadbalancer", label: "AWS API",         x: 570, y: 100 },
    { id: "ec2",     type: "server",       label: "EC2",             x: 700, y: 40  },
    { id: "rds",     type: "database",     label: "RDS",             x: 700, y: 110 },
    { id: "s3",      type: "cache",        label: "S3",              x: 700, y: 175 },
  ],
  edges: [
    { from: "eng",   to: "plan",  label: "review diff" },
    { from: "plan",  to: "apply", label: "approve" },
    { from: "apply", to: "aws",   label: "API calls" },
    { from: "aws",   to: "ec2" },
    { from: "aws",   to: "rds" },
    { from: "aws",   to: "s3" },
  ],
};

export const content = {
  title: "Infrastructure as Code",
  sections: [
    {
      heading: "Why Infrastructure as Code",
      diagram: iacDiagram,
      body: `**Infrastructure as Code (IaC)** means managing cloud resources — servers, databases, networks, DNS records — through versioned code files instead of clicking through a web console. The same principles that make software reliable apply to infrastructure: version control, code review, automated testing, and reproducible deployments.

Without IaC, infrastructure is a snowflake: manually configured, impossible to reproduce exactly, and terrifying to modify because nobody knows what will break. With IaC, spinning up a copy of your production environment for staging is a single command. A new team member can see exactly what infrastructure exists by reading the code. Disaster recovery means running \`terraform apply\` on a new account.

**Imperative IaC** (AWS CDK, Pulumi in imperative mode) describes *how* to create resources: "create a VPC, then create a subnet in it, then create an EC2 instance in the subnet." **Declarative IaC** (Terraform, CloudFormation) describes the *desired end state*: "I want an EC2 instance with these properties." The tool figures out the steps. Declarative is generally preferred — it's idempotent and easier to reason about.`,
      items: [
        "`Idempotent` — running \`terraform apply\` twice produces the same result; no duplicate resources",
        "`Plan` — dry-run showing exactly which resources will be created, modified, or destroyed",
        "`State file` — Terraform's record of what it has created; must be stored remotely in a team",
        "`Provider` — plugin that knows how to call a specific cloud's API (aws, google, azurerm)",
        "`Module` — reusable package of Terraform resources (like a function for infrastructure)",
      ],
    },
    {
      heading: "Terraform Fundamentals",
      body: `Terraform uses **HCL (HashiCorp Configuration Language)**, a declarative language designed to be human-readable. A Terraform project is a directory of \`.tf\` files. The core workflow is three commands: \`terraform init\` (download providers), \`terraform plan\` (show what will change), \`terraform apply\` (make the changes).

The **state file** (\`terraform.tfstate\`) is Terraform's source of truth for what it has provisioned. In a team, the state must be stored remotely (S3 + DynamoDB lock, Terraform Cloud) so multiple engineers don't overwrite each other's state. Never edit the state file manually.

**Variables** make configurations reusable. **Outputs** expose values from your infrastructure (like an EC2 public IP) so other modules or humans can reference them.`,
      code: `# main.tf — configure the AWS provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Remote state in S3 (team setup)
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"   # prevents concurrent applies
  }
}

provider "aws" {
  region = var.aws_region
}

# variables.tf
variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}`,
    },
    {
      heading: "Writing Your First Terraform",
      body: `Let's provision a real web server: an EC2 instance inside a VPC, with a security group that allows HTTP traffic. The \`aws_ami\` data source dynamically fetches the latest Amazon Linux AMI ID so your config stays up to date without hardcoding an AMI ID that goes stale.

Notice how resources reference each other using \`<resource_type>.<name>.<attribute>\` — Terraform builds a dependency graph from these references and creates resources in the correct order automatically.`,
      code: `# Fetch the latest Amazon Linux 2023 AMI dynamically
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# Security group: allow HTTP in, all traffic out
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow HTTP inbound"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"     # all traffic
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 instance referencing the security group above
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = <<-EOF
    #!/bin/bash
    dnf install -y nginx
    systemctl enable --now nginx
  EOF

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}

# outputs.tf — expose the public IP
output "web_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}`,
    },
    {
      heading: "State & Remote Backends",
      body: `Terraform's state file is the most important file in your infrastructure project. It maps your HCL resources to real cloud resource IDs. If the state is lost, Terraform loses track of what it created and may try to create duplicates or fail to destroy resources cleanly.

**Remote backends** store state in a durable, shared location. The S3 + DynamoDB pattern is the standard for AWS: state is stored in an S3 bucket (versioned, so you can roll back), and a DynamoDB table provides a mutex lock to prevent two engineers from running \`terraform apply\` simultaneously.

**Workspaces** let you maintain separate state files for different environments (dev, staging, production) from the same configuration. An alternative — and often cleaner — pattern is to have separate directories per environment with shared modules.`,
      code: `# Workflow commands
terraform init        # download providers, initialise backend
terraform fmt         # auto-format HCL files
terraform validate    # check syntax without calling the API
terraform plan -out=tfplan   # save plan to file
terraform apply tfplan        # apply the saved plan (no re-plan)
terraform destroy    # destroy ALL managed resources (be careful!)

# Import existing resources into state (if you manually created something)
terraform import aws_instance.web i-0abcd1234efgh5678

# View current state
terraform state list
terraform state show aws_instance.web

# Workspaces for per-environment state
terraform workspace new staging
terraform workspace select staging
terraform apply -var-file=staging.tfvars`,
    },
  ],
};
