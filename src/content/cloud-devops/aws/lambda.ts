export const content = {
  title: "Lambda & Serverless",
  sections: [
    {
      heading: "Lambda Execution Model",
      body: "**AWS Lambda** runs your code in response to events without you managing servers. You upload a function, define a trigger, and Lambda handles scaling, patching, and execution. You pay only for the milliseconds your code runs — zero cost when idle.\n\nLambda runs your function in an isolated **execution environment**: a microVM (Firecracker-based) with a frozen runtime. The environment is initialised on first invocation (**cold start**), then reused for subsequent calls (**warm invocation**). Reuse means your handler function runs again, but global/module-level code (database connections, SDK clients) persists — exploit this for performance.",
      code: `import boto3

# Initialise outside the handler — reused across warm invocations
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("users")

def handler(event, context):
    user_id = event["pathParameters"]["id"]
    item = table.get_item(Key={"pk": user_id})
    return {
        "statusCode": 200,
        "body": json.dumps(item.get("Item", {})),
    }`,
      items: [
        "`Cold start` — the first invocation in an execution environment: Lambda must pull the image, start the microVM, and run init code. Adds 100–500 ms for Python/Node; seconds for JVM runtimes.",
        "`Warm invocation` — subsequent calls reuse the environment. Typically < 1 ms overhead.",
        "`Init code` — module-level code (outside the handler) runs once per environment. Ideal for DB connections, loaded models.",
        "`Execution environment lifecycle` — AWS freezes and may reuse environments for up to ~15 minutes of inactivity, then destroys them.",
        "`Provisioned Concurrency` — keeps N environments pre-warmed to eliminate cold starts. Costs ~10% more.",
      ],
    },
    {
      heading: "Triggers & Event Sources",
      body: "Lambda functions are invoked by **event sources** — services that push events or pull records. The event shape differs per source, but the handler signature is always `handler(event, context)`.\n\nThe two invocation models are **synchronous** (API Gateway, ALB — caller waits for the response) and **asynchronous** (S3, SNS, EventBridge — Lambda processes independently and the source doesn't wait). For stream/queue sources (SQS, Kinesis, DynamoDB Streams), Lambda polls and processes in batches.",
      items: [
        "`API Gateway / ALB` — synchronous HTTP trigger. Enables request-response APIs at massive scale.",
        "`S3` — async: fires on `ObjectCreated`, `ObjectDeleted`. Classic use: image resizing, file processing.",
        "`SQS` — batch polling: Lambda pulls messages, processes the batch, deletes on success. Failed items go to a DLQ.",
        "`SNS` — async fan-out: SNS pushes to Lambda asynchronously. Good for notifications, multi-subscriber events.",
        "`EventBridge (CloudWatch Events)` — scheduled triggers (cron-like) and event routing between AWS services.",
        "`DynamoDB Streams` — capture table changes and process them in order. Good for cache invalidation, audit logs.",
      ],
    },
    {
      heading: "Configuration — Memory, Timeout & Layers",
      body: "Lambda allocates **CPU proportional to memory**: 128 MB gets 1/8 vCPU; 1,769 MB gets 1 full vCPU; 3,538 MB gets 2 vCPUs. Increasing memory can make your function faster AND cheaper because it finishes sooner — always benchmark different memory sizes.\n\n**Layers** are zip archives of shared code (libraries, dependencies, ML models) that mount at `/opt` in the execution environment. Multiple functions can share a layer, avoiding repeated packaging of large dependencies. Lambda supports up to 5 layers per function.",
      code: `# Deploy with SAM (Serverless Application Model)
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: python3.12
    MemorySize: 512
    Timeout: 30
    Environment:
      Variables:
        DB_HOST: !Ref RDSProxy

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.handler
      Layers:
        - !Ref DependenciesLayer
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /users/{id}
            Method: GET`,
      items: [
        "`Memory` — 128 MB to 10,240 MB. Start at 512 MB and use Lambda Power Tuning to find the optimal size.",
        "`Timeout` — max 15 minutes. For API-facing functions, keep it under 29 seconds (API Gateway's max).",
        "`Ephemeral storage (/tmp)` — 512 MB to 10 GB of temp disk. Useful for processing files before uploading to S3.",
        "`Environment variables` — max 4 KB total. For secrets, use AWS Secrets Manager or SSM Parameter Store and load at init.",
      ],
    },
    {
      heading: "Concurrency & Throttling",
      body: "Lambda scales by running multiple concurrent execution environments — one per simultaneous invocation. Each AWS account has a **regional concurrency limit** of 1,000 by default (requestable increase). If all 1,000 are in use, additional invocations are **throttled** (synchronous: 429 error; async: retry queue).\n\n**Reserved concurrency** caps a function's concurrency so it can't consume the entire account limit — protecting other functions. **Provisioned concurrency** keeps environments pre-initialized for consistent low-latency at the cost of always-on charges.",
      items: [
        "`Burst limit` — Lambda can instantly provision 3,000 environments in us-east-1 (varies by region) before scaling at 500/minute.",
        "`Reserved concurrency = 0` — effectively disables a function. Useful to temporarily stop event processing.",
        "`Async retry` — asynchronous invocations retry twice on failure. Configure a **Dead-Letter Queue** (SQS or SNS) to capture events that exhaust retries.",
        "`Lambda with RDS` — Lambda can exhaust database connections fast at scale. Always use RDS Proxy between Lambda and RDS.",
      ],
    },
  ],
};
