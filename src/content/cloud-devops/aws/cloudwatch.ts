export const content = {
  title: "CloudWatch & Observability",
  sections: [
    {
      heading: "CloudWatch Overview",
      body: "**Amazon CloudWatch** is AWS's native observability service — the unified platform for metrics, logs, alarms, and dashboards. Almost every AWS service publishes metrics to CloudWatch automatically. It's the default starting point for observability on AWS before reaching for third-party tools like Datadog or Grafana.\n\nThe three main pillars in CloudWatch: **Metrics** (numeric time-series data), **Logs** (structured or unstructured text), and **Alarms** (trigger actions when metrics cross thresholds).",
      items: [
        "`Namespace` — a container for related metrics, e.g., `AWS/EC2`, `AWS/RDS`, `MyApp/Business`.",
        "`Metric` — a time-series of numeric data points identified by namespace + name + dimensions, e.g., `CPUUtilization` for a specific EC2 instance ID.",
        "`Dimension` — a key-value pair that filters a metric to a specific resource (e.g., `InstanceId=i-0abc123`).",
        "`Resolution` — standard (1-minute granularity, free) or high-resolution (1-second, extra cost).",
        "`Retention` — default metric retention is 15 months; log retention is configurable (1 day to forever).",
      ],
    },
    {
      heading: "CloudWatch Logs",
      body: "**CloudWatch Logs** ingests log streams from EC2 (via the CloudWatch Agent), Lambda (automatic), ECS (via `awslogs` log driver), API Gateway, and any application that sends directly via the API.\n\nLogs are organised into **Log Groups** (e.g., `/aws/lambda/my-function`) and within them **Log Streams** (one per function instance, EC2 instance, etc.). You can define retention policies per log group to control costs.",
      code: `import boto3
import json
import time

logs = boto3.client("logs")

# Create log group and stream
logs.create_log_group(logGroupName="/myapp/api")
logs.put_retention_policy(logGroupName="/myapp/api", retentionInDays=30)
logs.create_log_stream(
    logGroupName="/myapp/api",
    logStreamName="instance-1"
)

# Send structured log events
logs.put_log_events(
    logGroupName="/myapp/api",
    logStreamName="instance-1",
    logEvents=[{
        "timestamp": int(time.time() * 1000),
        "message": json.dumps({
            "level": "INFO",
            "event": "request_completed",
            "duration_ms": 42,
            "user_id": "u-123",
        }),
    }],
)`,
      items: [
        "`CloudWatch Agent` — daemon that runs on EC2 to ship OS metrics (disk, memory) and application logs to CloudWatch.",
        "`Subscription filters` — stream log events in real-time to Lambda, Kinesis Data Firehose, or OpenSearch.",
        "`Log Insights` — SQL-like query language to search and analyse logs. Supports aggregations, regex, and cross-group queries.",
        "`Contributor Insights` — automatically identifies top contributors to high-volume metrics (e.g., top IPs causing 5xx errors).",
      ],
    },
    {
      heading: "Alarms",
      body: "A **CloudWatch Alarm** watches a single metric over a time period and transitions between states: `OK`, `ALARM`, and `INSUFFICIENT_DATA`. When it enters `ALARM` state, it can trigger **SNS notifications** (email/Slack via webhook), **Auto Scaling actions**, **EC2 actions** (reboot, stop, terminate), or **Systems Manager OpsItems**.\n\n**Composite Alarms** combine multiple alarms with AND/OR logic — useful for reducing alert noise (only page if CPU is high AND error rate is high).",
      code: `# Create an alarm: alert if API error rate > 1% for 5 minutes
aws cloudwatch put-metric-alarm \\
  --alarm-name api-error-rate-high \\
  --alarm-description "API 5xx rate above 1%" \\
  --metric-name 5XXError \\
  --namespace AWS/ApiGateway \\
  --dimensions Name=ApiName,Value=my-api \\
  --statistic Sum \\
  --period 60 \\
  --evaluation-periods 5 \\
  --threshold 10 \\
  --comparison-operator GreaterThanThreshold \\
  --alarm-actions arn:aws:sns:us-east-1:123:alerts-topic \\
  --ok-actions arn:aws:sns:us-east-1:123:alerts-topic`,
      items: [
        "`Period` — the granularity of metric evaluation (60 or 300 seconds for standard resolution).",
        "`Evaluation periods` — how many consecutive periods must breach the threshold before alarming. Reduces noise from spikes.",
        "`Treat missing data` — how to handle gaps: `notBreaching` (treat as OK), `breaching`, `ignore`, `missing`.",
        "`Anomaly detection` — ML-based expected range; alarm when metric goes outside the band without a fixed threshold.",
      ],
    },
    {
      heading: "Dashboards & CloudWatch Insights",
      body: "**CloudWatch Dashboards** are customisable visual boards that aggregate metrics and alarms across services into a single view. Accessible to the whole team; can be shared publicly for read-only access (useful for status pages).\n\n**CloudWatch Insights** lets you run ad-hoc queries across log groups using a SQL-inspired syntax. It's the fastest way to answer questions like \"what are the 10 slowest API endpoints in the last hour?\" or \"how many unique users triggered an error today?\"",
      code: `# CloudWatch Insights query — top 10 slowest Lambda invocations
fields @timestamp, @duration, @requestId
| filter @type = "REPORT"
| sort @duration desc
| limit 10

# Count errors per endpoint
fields @timestamp, endpoint, status
| filter status >= 500
| stats count(*) as errors by endpoint
| sort errors desc`,
      items: [
        "`Container Insights` — enhanced metrics and logs for ECS and EKS clusters (CPU/memory per task, per pod).",
        "`Lambda Insights` — detailed Lambda execution metrics: init duration, memory used, concurrent executions.",
        "`Application Insights` — automatically detects and monitors application components (RDS, EC2, ALB) and correlates anomalies.",
        "`ServiceLens` — integrates CloudWatch with X-Ray distributed traces for end-to-end request visibility.",
      ],
    },
  ],
};
