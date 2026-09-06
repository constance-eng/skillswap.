# SkillSwap Backend (MVP)

Serverless AWS backend for SkillSwap: Cognito auth, DynamoDB storage, Lambda
functions, API Gateway, deployed via CloudFormation (through AWS SAM).

## What's included

- **Cognito User Pool** — email/password auth, issues JWTs used to authorize API calls
- **DynamoDB tables** — `Users` (profile + live credit balance), `Skills` (listings), `Transactions` (credit ledger)
- **Lambda functions**:
  - `POST /users` — create a user profile with starting credits
  - `POST /skills` — post a skill you can teach (requires auth)
  - `GET /skills` — browse all posted skills, optional `?category=` filter
  - `POST /match` — TF-IDF + cosine similarity matching: send a text query, get ranked skill matches (requires auth)
  - `POST /credits/transfer` — atomically move credits from learner to teacher, logs to the ledger (requires auth)

## Prerequisites

- AWS account (Always Free tier covers this at prototype scale)
- AWS CLI configured (`aws configure`) with a user that has deploy permissions
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed
- Node.js 20+

## Deploy

```bash
cd skillswap-backend
npm install
sam build
sam deploy --guided
```

`sam deploy --guided` walks you through naming the stack, picking a region,
and confirming IAM role creation. It saves your answers to `samconfig.toml`
so future deploys are just `sam deploy`.

After deploy, SAM prints outputs including:
- `ApiUrl` — your API Gateway base URL, use this in the React frontend
- `UserPoolId` / `UserPoolClientId` — plug these into the frontend's Cognito auth config (e.g. AWS Amplify or amazon-cognito-identity-js)

## Testing locally without deploying

The matching algorithm has no AWS dependency and can be tested standalone —
useful for validating precision/recall for Chapter 5 before wiring up the
full stack. See the test pattern used to validate this during development:
build a small skills corpus, run test queries through `buildTfIdfSpace` +
`cosineSimilarity`, and check the top match is the expected skill.

## Cost note

This stack uses on-demand DynamoDB billing and Lambda's default free tier
(1M requests/month, 400,000 GB-seconds/month) plus DynamoDB's Always Free
tier (25GB storage, 200M requests/month) — a prototype with light testing
traffic should not incur any charges.

## What's deliberately out of scope for the MVP

Certification generation, layered verification workflows, and star rating
aggregation are not implemented here — flagged as future work per the
thesis. This backend covers the core loop: sign up → post a skill → get
matched → spend/earn credits.
