# Shelby Knowledge Vault

Upload files, preview files, download files, and ask AI.

The app runs locally with mock Shelby and AI functions. No API keys are required.

## Features

- Upload files
- Preview files
- Download files
- Ask AI
- Activity
- Shelby storage mock

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- Framer Motion
- Lucide React icons

## Setup

```bash
npm install
npm run dev
```

Use `.env.example` as the environment variable template.

On locked-down Windows PowerShell sessions, use:

```bash
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

Checks:

```bash
npm run typecheck
npm run build
```

## Architecture

- `app/page.tsx`: landing page
- `app/dashboard/page.tsx`: dashboard route
- `components/`: reusable UI and dashboard components
- `lib/shelby.ts`: mock Shelby upload, list, read, and delete functions
- `lib/ai.ts`: mock AI question function

Integration TODOs are marked in code:

- Shelby S3 Gateway
- Gemini API

## Roadmap

- Shelby S3 Gateway integration
- Gemini API integration
- File text extraction
- File citations
- Persistent metadata
- Authentication
