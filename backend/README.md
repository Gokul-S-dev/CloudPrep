# CloudPrep backend

This directory contains the AWS SAM application for CloudPrep. The complete
project guide is in the repository [README.md](../README.md).

## Components

- `get_questions/app.py` reads the private S3 question bank and removes answer
  keys and explanations from the public response.
- `submit_exam/app.py` evaluates exact-match answers, writes a summary to
  DynamoDB, and returns the detailed review.
- `template.yaml` declares the S3 bucket, DynamoDB table, API Gateway HTTP API,
  Lambda functions, IAM policies, and outputs.
- `database/clf-c02-questions.json` is the authoritative question bank.

## Build, validate, and deploy

```powershell
sam validate
sam build
sam deploy --guided
```

The default region and stack settings are in
[samconfig.toml](samconfig.toml). Review them before deployment.

Retrieve the generated API URL and bucket name without hard-coding them:

```powershell
aws cloudformation describe-stacks `
  --stack-name cloudprep-stack `
  --query "Stacks[0].Outputs" `
  --output table
```

Upload a question bank using the returned bucket name:

```powershell
aws s3 cp database/clf-c02-questions.json `
  s3://<QUESTION_BUCKET_NAME>/clf-c02-questions.json `
  --region <AWS_REGION>
```

Never commit AWS credentials, local `.env` files, generated `.aws-sam`
artifacts, or environment-specific API and bucket values.
