# CloudPrep frontend

This directory contains the React 19 and Vite frontend. The complete project
guide, deployment instructions, API reference, and security rules are in the
repository [README.md](../README.md).

## Development

```powershell
npm install
Copy-Item .env.example .env
# Set VITE_API_BASE_URL in .env to the backend ApiUrl output.
npm run dev
```

## Checks

```powershell
npm run lint
npm run build
```

## Environment variables

Use [.env.example](.env.example) as the template. `.env` is intentionally
ignored by Git. Vite variables are public browser configuration; never put AWS
secret keys, private tokens, answer keys, or database credentials in them.

When Cognito variables are absent, authentication screens use the frontend
demo adapter. It is suitable for UI preview only and is not production
authentication.
