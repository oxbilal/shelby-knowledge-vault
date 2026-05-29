# Shelby Knowledge Vault

Upload files, preview files, download files, and ask AI.

The app runs locally without keys and uses Shelby S3-compatible storage when configured.

## Features

- Upload files
- Preview files
- Download files
- Ask AI
- Activity
- Shelby-ready storage layer

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

For Shelby S3-compatible storage, set:

- `SHELBY_S3_ENDPOINT`
- `SHELBY_ACCESS_KEY_ID`
- `SHELBY_SECRET_ACCESS_KEY`
- `SHELBY_BUCKET`

If these values are missing, the app uses local preview mode.

For Gemini answers, set:

- `GEMINI_API_KEY`

If this value is missing, Ask AI uses the preview fallback.

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
- `app/api/files/*`: Shelby S3-compatible file API routes
- `app/api/ai/ask`: Gemini answer API route
- `lib/shelby.ts`: client file helpers with local fallback
- `lib/shelby-s3.ts`: server-side S3 client helpers
- `lib/gemini.ts`: server-side Gemini helper
- `lib/ai.ts`: client Ask AI helper

Integration TODOs are marked in code:

- Shelby S3 Gateway
- File text extraction for Gemini grounding

## Roadmap

- Shelby S3 Gateway production settings
- Gemini file-text grounding
- File text extraction
- File citations
- Persistent metadata
- Authentication
- Wallet connection
- Onchain access logs
- Ownership and permission records
