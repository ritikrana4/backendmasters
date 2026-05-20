export const content = {
  title: "VPC & Networking",
  sections: [
    {
      heading: "What is a VPC?",
      body: "A **Virtual Private Cloud (VPC)** is your private, isolated network inside AWS. Every resource you create — EC2 instances, RDS databases, Lambda functions in a VPC, load balancers — lives inside a VPC. AWS creates a default VPC in each region, but production systems should use a custom VPC with carefully designed subnet topology.\n\nA VPC spans an entire AWS region. Within it, you carve out **subnets** in specific Availability Zones. The VPC has a **CIDR block** (e.g., `10.0.0.0/16`) that defines its IP address range — you can create up to 65,536 addresses in a `/16` block.",
      items: [
        "`CIDR block` — the IP range for the VPC, e.g., `10.0.0.0/16` = 65,536 addresses.",
        "`Subnet` — a subdivision of the VPC in one AZ. Has its own CIDR, e.g., `10.0.1.0/24` = 256 addresses.",
        "`Availability Zone` — a distinct data center in a region. Subnets live in a single AZ; spread subnets across AZs for high availability.",
        "`Route table` — defines where network traffic from a subnet goes. Each subnet has one route table.",
        "`Internet Gateway (IGW)` — enables communication between the VPC and the internet.",
      ],
    },
    {
      heading: "Public vs Private Subnets",
      body: "The most important VPC design decision is **public vs private subnets**. A **public subnet** has a route to the Internet Gateway — resources in it can be directly reached from the internet (if they have a public IP). A **private subnet** has no IGW route — resources can only be reached from within the VPC or via a VPN/Direct Connect.\n\nThe standard production pattern: load balancers in public subnets, application servers and databases in private subnets. Private subnet resources reach the internet for outbound calls (package installs, API calls) via a **NAT Gateway** in the public subnet.",
      code: `# Typical 3-tier VPC layout
# VPC: 10.0.0.0/16

# Public subnets (load balancers, NAT Gateways, bastion hosts)
10.0.1.0/24  us-east-1a  →  route: 0.0.0.0/0 → igw-xxx
10.0.2.0/24  us-east-1b  →  route: 0.0.0.0/0 → igw-xxx

# Private subnets (app servers, ECS tasks)
10.0.11.0/24  us-east-1a  →  route: 0.0.0.0/0 → nat-xxx (in 10.0.1.0/24)
10.0.12.0/24  us-east-1b  →  route: 0.0.0.0/0 → nat-xxx (in 10.0.2.0/24)

# Database subnets (RDS, ElastiCache — no outbound internet)
10.0.21.0/24  us-east-1a  →  local routes only
10.0.22.0/24  us-east-1b  →  local routes only`,
      items: [
        "`NAT Gateway` — managed, highly available outbound-only internet access for private subnets. Costs ~$0.045/hour plus data transfer. One per AZ for resilience.",
        "`Elastic IP` — a static public IPv4 address. Attach to NAT Gateways or EC2 instances that need a permanent public IP.",
        "`Bastion host` — a hardened EC2 instance in a public subnet used as an SSH jump box to reach private instances. Often replaced by AWS Systems Manager Session Manager.",
      ],
    },
    {
      heading: "Security Groups vs Network ACLs",
      body: "AWS has two layers of network firewall in a VPC: **Security Groups** and **Network ACLs (NACLs)**. Security Groups are the primary tool — most teams rely on them almost exclusively.\n\n**Security Groups** are stateful: if you allow inbound port 443, the return traffic is automatically allowed. They attach to ENIs (network interfaces on EC2, RDS, etc.). Rules are allow-only — there's no explicit deny.\n\n**NACLs** are stateless: you must allow both inbound AND the ephemeral port range for return traffic. They attach to subnets and apply to all traffic entering/leaving the subnet. Useful as a coarse outer perimeter (e.g., block a known bad IP range), but not a replacement for Security Groups.",
      items: [
        "**Security Group rule**: allow inbound TCP 5432 from the `app-servers` security group — not an IP range. Security groups can reference each other.",
        "`0.0.0.0/0` in an inbound rule means the internet. Never do this for databases or internal services.",
        "For NACL stateless rules: if you allow inbound on port 80, also allow outbound on `1024-65535` (ephemeral ports for the response).",
        "`VPC Flow Logs` — capture metadata about all IP traffic in/out of your VPC for security audit and troubleshooting.",
      ],
    },
    {
      heading: "VPC Peering & Private Connectivity",
      body: "**VPC Peering** connects two VPCs (same or different accounts/regions) so resources can communicate using private IPs. Traffic stays on the AWS backbone — never the public internet. Peering is non-transitive: if A peers with B and B peers with C, A cannot reach C through B.\n\n**AWS PrivateLink** exposes a service in one VPC to consumers in other VPCs without peering — traffic goes through an interface endpoint. Used for SaaS products, shared internal services, and accessing AWS services (S3, DynamoDB) privately without traversing the internet.",
      items: [
        "`VPC Peering` — simple, low-cost private connectivity between two VPCs. Non-transitive. CIDRs must not overlap.",
        "`Transit Gateway` — a managed hub that connects multiple VPCs and on-premises networks. Replaces complex full-mesh peering.",
        "`VPC Endpoint (Gateway)` — free private route to S3 and DynamoDB from within the VPC; no NAT Gateway needed.",
        "`VPC Endpoint (Interface)` — PrivateLink-based private access to other AWS services (SQS, SNS, CloudWatch, etc.).",
        "`AWS Direct Connect` — dedicated physical fiber from your data center to AWS; consistent latency, not over the public internet.",
      ],
    },
  ],
};
