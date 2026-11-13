# CloudPrep

CloudPrep is an AWS Certified Cloud Practitioner (CLF-C02) practice examination
platform. It provides a React/Vite exam interface and an AWS SAM serverless API
that keeps answer keys in a private S3 bucket, scores submissions in Lambda,
and stores summary results in DynamoDB.

> **Status:** The exam API is functional. Authentication, administration, and
> student-management screens currently use a frontend demo adapter. They are
> not production authentication or authorization.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Requirements](#requirements)
- [Local development](#local-development)
- [AWS deployment](#aws-deployment)
- [Question-bank management](#question-bank-management)
- [API reference](#api-reference)
- [Testing and quality checks](#testing-and-quality-checks)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

## Features

- 65-question CLF-C02 mock exam with a 90-minute countdown.
- Single-response and multiple-response questions.
- Question navigation, palette status, clear response, and mark-for-review UI.
- Fullscreen exam mode with a Pearson VUE-inspired layout.
- Exact-match scoring for multiple-response questions.
- Domain score breakdown and answer-by-answer review.
- Demo student and administrator workflows for frontend preview.

## Architecture

```text
Browser (React 19 + Vite)
        |
        | GET /questions, POST /submit
        v
Amazon API Gateway HTTP API
        |
        +--> GetQuestionsFunction (Python 3.12)
        |       reads private S3 question bank
        |       removes correctAnswers and explanation
        |
        +--> SubmitExamFunction (Python 3.12)
                reads private S3 answer key
                scores the submission
                writes summary to DynamoDB
```

The infrastructure is declared in [backend/template.yaml](backend/template.yaml).
It creates:

- An encrypted S3 bucket with public access blocked.
- A pay-per-request DynamoDB table keyed by `attemptId`.
- An API Gateway HTTP API with `/questions` and `/submit`.
- Lambda IAM policies limited to the required S3 read and DynamoDB write
  operations.

## Repository layout

```text
AWS-Cert/
├── backend/
│   ├── database/clf-c02-questions.json  # Authoritative question bank
│   ├── get_questions/app.py             # Public question response
│   ├── submit_exam/app.py               # Scoring and persistence
│   ├── tests/                           # Python tests
│   ├── template.yaml                    # AWS SAM infrastructure
│   └── samconfig.toml                   # Local SAM defaults
├── frontend/
│   ├── src/components/                  # Shared exam and dashboard UI
│   ├── src/pages/                       # Exam, result, auth, admin, student pages
│   ├── src/services/                    # API and demo data adapters
│   ├── .env.example                     # Safe environment template
│   └── package.json
└── .gitignore
```

Generated directories such as `frontend/node_modules`, `frontend/dist`, and
`backend/.aws-sam` are intentionally excluded from version control.

## Requirements

- Node.js 18 or newer and npm.
- Python 3.12.
- AWS CLI configured with a named profile or environment-based credentials.
- AWS SAM CLI.
- An AWS account with permission to deploy the resources in the SAM template.

Do not place AWS access keys in the repository. Prefer AWS IAM Identity Center,
short-lived credentials, an AWS profile, or an attached role.

## Local development

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
# Edit .env and set VITE_API_BASE_URL to your deployed or local API URL.
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Vite variables are embedded into the browser bundle. Never put AWS secret keys,
database credentials, private tokens, or answer keys in a `VITE_*` variable.

If Cognito is not configured, the application uses its demo adapter. This is
for UI preview only; it stores only simulated session metadata and must not be
used to protect a production application.

### Backend locally

```powershell
cd backend
sam build
sam local start-api
```

Local Lambda execution still needs AWS access to read the question bank and
write results unless those integrations are mocked. Use a configured AWS
profile rather than committing credentials.

## AWS deployment

The default SAM configuration targets `ap-south-1` and the stack name
`cloudprep-stack`. Review these values in
[backend/samconfig.toml](backend/samconfig.toml) before deployment.

```powershell
cd backend
sam validate
sam build
sam deploy --guided
```

For later deployments, use:

```powershell
sam deploy
```

After deployment, retrieve the generated API URL and bucket name from the
CloudFormation outputs:

```powershell
aws cloudformation describe-stacks `
  --stack-name cloudprep-stack `
  --query "Stacks[0].Outputs" `
  --output table
```

Set the `ApiUrl` value in `frontend/.env` as `VITE_API_BASE_URL`, then rebuild
the frontend:

```powershell
cd ..\frontend
npm run build
```

The generated API URL, bucket name, account ID, and other environment-specific
outputs should not be hard-coded in documentation or committed configuration.

## Question-bank management

The authoritative local question bank is
[backend/database/clf-c02-questions.json](backend/database/clf-c02-questions.json).
Each question contains an `id`, `domain`, `type`, `question`, `options`,
`correctAnswers`, and `explanation`.

Upload it to the deployed bucket using the bucket name returned by CloudFormation:

```powershell
aws s3 cp database/clf-c02-questions.json `
  s3://<QUESTION_BUCKET_NAME>/clf-c02-questions.json `
  --region <AWS_REGION>
```

The GET Lambda strips `correctAnswers` and `explanation` before returning data
to the browser. The POST Lambda reads the private object to score submissions.
Treat the local question bank as protected assessment content and do not expose
it through a public web directory.

## API reference

The base URL is the deployed `ApiUrl` output. It is intentionally not stored in
this README because it is environment-specific.

### `GET /questions`

Returns an array of public questions. Correct answers and explanations are
omitted.

```json
[
  {
    "id": 1,
    "domain": "Cloud Concepts",
    "type": "single",
    "question": "Question text",
    "options": [
      { "id": "A", "text": "Option A" },
      { "id": "B", "text": "Option B" }
    ]
  }
]
```

### `POST /submit`

Accepts selected option IDs keyed by question ID. Multiple-response answers
must contain the complete set of selected IDs; scoring uses exact matching.

```json
{
  "answers": {
    "1": ["B"],
    "4": ["A", "C"]
  }
}
```

The response includes the attempt ID, counts, percentage, benchmark result,
domain scores, and detailed review. Results are persisted in DynamoDB with
summary fields only; the full review is returned to the caller.

## Testing and quality checks

Run the frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

Run backend tests from the backend directory:

```powershell
cd backend
python -m pytest
```

The integration test requires `AWS_SAM_STACK_NAME`, AWS credentials, a deployed
stack, and an API output matching the current test fixture. It is not a
replacement for a production smoke test.

## Security

The root [.gitignore](.gitignore) excludes:

- `.env` files and local overrides.
- AWS CLI credential directories and SAM build output.
- Private keys, certificates, credential files, and local database dumps.
- Node, Vite, Python, test, coverage, and build artifacts.

Important operational rules:

1. Copy `frontend/.env.example` to `frontend/.env`; never commit the resulting
   `.env`.
2. Never commit AWS access keys, secret keys, session tokens, private keys,
   Cognito secrets, database exports, or production logs.
3. If a secret is exposed, revoke or rotate it immediately. Adding it to
   `.gitignore` does not remove it from Git history.
4. Keep S3 public access blocked and use least-privilege IAM.
5. Add authentication and API authorization before exposing user or
   administration endpoints in production.
6. Restrict CORS origins in `backend/template.yaml` to the real frontend
   origin before production deployment.
7. Do not treat demo credentials, simulated JWTs, or localStorage session data
   as authentication.

## Troubleshooting

### Questions do not load

- Confirm `VITE_API_BASE_URL` has no trailing slash and points to the deployed
  API output.
- Check that the S3 object is named exactly
  `clf-c02-questions.json`.
- Review CloudWatch logs for `GetQuestionsFunction`.
- Confirm the deployed API allows the frontend origin through CORS.

### Submission fails

- Confirm the question bank exists and is valid JSON.
- Confirm `SubmitExamFunction` has S3 read and DynamoDB write permissions.
- Check that the table name matches the `RESULTS_TABLE` Lambda environment
  variable.
- Review CloudWatch logs without printing submitted answers or credentials.

### SAM deployment fails

- Run `sam validate` and `sam build`.
- Confirm the selected AWS profile and region.
- Check CloudFormation events for the first failed resource.
- Use a unique stack name if another environment already owns the default.

## Roadmap

- Replace the demo authentication adapter with Amazon Cognito integration.
- Add authenticated, role-protected CRUD APIs for administration.
- Restrict API Gateway CORS to deployed frontend origins.
- Add CloudFront/S3 frontend hosting with HTTPS and a custom domain.
- Add attempt history, analytics, and support for additional AWS certifications.

## License and content notice

This project is an educational practice tool and is not affiliated with or
endorsed by Amazon Web Services or Pearson VUE. Confirm the applicable license
for question content before redistributing the question bank.
