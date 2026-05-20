export const content = {
  title: "IAM & Identity Management",
  sections: [
    {
      heading: "What is IAM?",
      body: "**AWS Identity and Access Management (IAM)** is the global service that controls who can do what in your AWS account. Every API call to AWS — whether from a human, a CLI tool, or an EC2 instance — must be authenticated (prove who you are) and authorized (prove you're allowed to do this). IAM is where you define both.\n\nIAM is free, applies globally across all regions, and is the foundation of AWS security. Getting IAM right is the single most important thing you can do to secure an AWS account.",
      items: [
        "`Root account` — the email/password you used to create the account; has unrestricted access to everything. Lock it with MFA and never use it for daily work.",
        "`IAM users` — long-lived identities for humans or scripts that need permanent access keys or console passwords.",
        "`IAM groups` — collections of users that share the same policies (e.g., a `developers` group).",
        "`IAM roles` — identities assumed temporarily by services (EC2, Lambda) or federated users; no long-lived credentials.",
        "`Policies` — JSON documents that define exactly which actions are allowed or denied on which resources.",
      ],
    },
    {
      heading: "Policies — Allow / Deny Rules",
      body: "A **policy** is a JSON document that specifies permissions. You attach policies to users, groups, or roles. AWS evaluates all attached policies on every API call: if no policy explicitly allows the action, it is denied (implicit deny). An explicit `Deny` always overrides any `Allow`.\n\nThe most important field in a policy statement is `Action` (what API calls), `Resource` (which AWS resources the action applies to, identified by ARN), and `Effect` (`Allow` or `Deny`).",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "*"
    }
  ]
}`,
      items: [
        "`AWS managed policies` — pre-built by AWS (e.g., `AmazonS3ReadOnlyAccess`). Easy to attach, but broad.",
        "`Customer managed policies` — policies you write and own. Preferred for production: you control the scope.",
        "`Inline policies` — embedded directly on a single user/role. Avoid: they're hard to audit.",
        "`Condition` — optionally restrict when a policy applies (e.g., only from a certain IP, only with MFA).",
      ],
    },
    {
      heading: "IAM Roles for Services",
      body: "A **role** is an IAM identity with no permanent credentials — it is assumed temporarily and issues short-lived credentials via **STS (Security Token Service)**. This is how EC2 instances, Lambda functions, ECS tasks, and other AWS services authenticate to call other AWS APIs without storing access keys in environment variables.\n\nFor example: attach an IAM role to an EC2 instance with an S3 read policy. Code running on that instance calls `s3.getObject()` — AWS automatically provides temporary credentials via the instance metadata service (`169.254.169.254`). No secrets in your code.",
      code: `# On an EC2 instance with an attached role, the AWS SDK
# automatically retrieves credentials from the metadata service.
# You never hard-code keys.

import boto3

s3 = boto3.client("s3")  # credentials resolved automatically
response = s3.get_object(Bucket="my-bucket", Key="data.json")
print(response["Body"].read())`,
      items: [
        "`Instance profile` — the container that holds a role for EC2 instances; created automatically.",
        "`Trust policy` — defines which entity is allowed to assume the role (e.g., EC2 service, Lambda service, another account).",
        "`Session duration` — temporary credentials last 1 hour by default (configurable up to 12 hours for roles).",
        "`Cross-account roles` — Account A can assume a role in Account B to access resources; no separate credentials needed.",
      ],
    },
    {
      heading: "Principle of Least Privilege",
      body: "The **principle of least privilege** means granting only the exact permissions needed — nothing more. In practice: start with zero permissions and add only what the workload requires. Use IAM Access Analyzer and policy simulation to verify scope.\n\nCommon mistakes to avoid: attaching `AdministratorAccess` to application roles, using `Resource: *` when a specific ARN would work, and sharing IAM users between multiple services.",
      items: [
        "Use **IAM Access Analyzer** to identify resources shared externally and unused permissions.",
        "Enable **MFA** on all human IAM users — especially those with console access.",
        "Rotate access keys regularly; prefer roles and short-lived credentials over static keys.",
        "Use **Service Control Policies (SCPs)** in AWS Organizations to set account-level guardrails.",
        "Tag IAM roles for auditability: `Environment=production`, `Service=payments-api`.",
      ],
    },
  ],
};
