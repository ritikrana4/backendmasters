export const content = {
  title: "EC2 & Compute",
  sections: [
    {
      heading: "What is EC2?",
      body: "**Elastic Compute Cloud (EC2)** is AWS's virtual machine service. You rent compute capacity by the second — pick an operating system (AMI), instance type (CPU/memory profile), and network configuration, and AWS runs the VM on physical hardware in a data center.\n\nEC2 is the lowest-level compute option on AWS. Higher-level services like ECS, EKS, and Elastic Beanstalk all run on EC2 under the hood. Understanding EC2 is essential even if you end up using managed services.",
      items: [
        "`AMI (Amazon Machine Image)` — a snapshot of an OS + software that instances boot from. AWS provides base AMIs (Amazon Linux, Ubuntu, Windows); you can build custom AMIs.",
        "`Instance type` — the hardware profile: `t3.micro` (2 vCPU, 1 GB RAM, burstable), `m5.large` (2 vCPU, 8 GB), `c6i.4xlarge` (16 vCPU, 32 GB, CPU-optimized).",
        "`Security group` — a stateful firewall attached to the instance: you define inbound and outbound rules by port and source.",
        "`Key pair` — RSA key for SSH access; AWS stores the public key, you keep the private key.",
        "`EBS volume` — Elastic Block Store; the persistent disk attached to the instance. Survives instance restarts.",
      ],
    },
    {
      heading: "Instance Types & Families",
      body: "EC2 instance types are grouped into families optimized for different workloads. The naming convention is `<family><generation>.<size>` — e.g., `m6i.xlarge` is memory-balanced, 6th gen Intel, extra-large.\n\nChoosing the wrong instance type is a common cost/performance mistake. Profile your workload before committing to Reserved Instances.",
      items: [
        "`t3/t4g` — **burstable**: earn CPU credits when idle, spend them during spikes. Good for dev, low-traffic APIs.",
        "`m6i/m7g` — **general purpose**: balanced CPU/memory. Good for most web backends.",
        "`c6i/c7g` — **compute-optimized**: high CPU-to-memory ratio. Good for batch processing, encoding.",
        "`r6i/r7g` — **memory-optimized**: high RAM. Good for in-memory caches, large databases.",
        "`g4dn/p3` — **GPU instances**: ML training, inference, video transcoding.",
        "`i3/i4i` — **storage-optimized**: NVMe SSDs with very high IOPS. Good for databases that need fast local storage.",
      ],
    },
    {
      heading: "Pricing Models",
      body: "EC2 pricing is one of the most impactful AWS cost decisions. The same hardware can cost 3–10× more depending on which model you choose.\n\n**On-Demand** is the default — pay per second with no commitment. Fine for dev/test, unpredictable workloads, or anything you're still sizing.\n\n**Reserved Instances** commit to 1 or 3 years and save 40–75%. Use for steady-state production workloads where you know the size.\n\n**Spot Instances** let you bid on spare AWS capacity at up to 90% discount — but AWS can reclaim them with 2 minutes notice. Ideal for fault-tolerant batch jobs, ML training, and CI runners.",
      code: `# Check current Spot price for a region
aws ec2 describe-spot-price-history \\
  --instance-types t3.large \\
  --product-descriptions "Linux/UNIX" \\
  --region us-east-1 \\
  --max-items 5`,
      items: [
        "`Savings Plans` — more flexible than RIs: commit to a $/hour spend, applies across instance families and regions.",
        "`Spot Fleet` — request a mix of instance types and sizes to maintain target capacity even when one type gets reclaimed.",
        "`Dedicated Hosts` — physical server dedicated to you; needed for bring-your-own-license (BYOL) software.",
      ],
    },
    {
      heading: "Auto Scaling & Load Balancing",
      body: "Running a single EC2 instance means a hardware failure or deployment takes down your service. **Auto Scaling Groups (ASG)** maintain a desired number of healthy instances and automatically replace terminated ones. Combined with an **Application Load Balancer (ALB)**, you get horizontally scaled, self-healing infrastructure.\n\nScale-out policies add instances when CPU exceeds a threshold; scale-in removes them during low traffic. **Target tracking** is the simplest policy: tell the ASG to keep average CPU at 60% and it figures out the instance count.",
      code: `# Create a simple launch template + ASG
aws ec2 create-launch-template \\
  --launch-template-name my-api \\
  --launch-template-data '{
    "ImageId": "ami-0abcdef1234567890",
    "InstanceType": "t3.small",
    "SecurityGroupIds": ["sg-12345"],
    "IamInstanceProfile": {"Name": "my-api-role"}
  }'

aws autoscaling create-auto-scaling-group \\
  --auto-scaling-group-name my-api-asg \\
  --launch-template LaunchTemplateName=my-api,Version='$Latest' \\
  --min-size 2 --max-size 10 --desired-capacity 2 \\
  --vpc-zone-identifier "subnet-a,subnet-b"`,
      items: [
        "`ALB` — Application Load Balancer: routes HTTP/HTTPS by path or host header; supports WebSockets and gRPC.",
        "`NLB` — Network Load Balancer: routes TCP/UDP at layer 4 with ultra-low latency; used for non-HTTP workloads.",
        "`Health checks` — the ALB periodically hits an endpoint (e.g., `GET /healthz`); unhealthy instances are removed from rotation.",
        "`Warm-up period` — newly launched instances are given time to initialize before receiving full traffic.",
      ],
    },
  ],
};
