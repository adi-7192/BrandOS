# BrandOS Vercel Deployment Guide

Follow these steps to deploy BrandOS to Vercel.

## 1. Prerequisites
- A Vercel account.
- A hosted PostgreSQL database (e.g., Supabase, Neon).
- API keys for AI providers (Anthropic, OpenAI, or Gemini).

## 2. Deployment Steps
1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Import the project into Vercel.
3. Vercel should automatically detect the monorepo structure thanks to `vercel.json`.

## 3. Environment Variables
You must add the following environment variables in the Vercel Project Settings (**Settings > Environment Variables**):

| Variable | Description | Example / Source |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | Supabase / Neon |
| `JWT_SECRET` | Secret for signing JWTs | Any long random string |
| `AI_PROVIDER` | `anthropic`, `openai`, or `gemini` | `anthropic` |
| `ANTHROPIC_API_KEY` | Anthropic API Key | console.anthropic.com |
| `OPENAI_API_KEY` | OpenAI API Key | platform.openai.com |
| `GEMINI_API_KEY` | Gemini API Key | aistudio.google.com |
| `SUPABASE_URL` | Supabase Project URL | Supabase Settings |
| `SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase Settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Supabase Settings |
| `SUPABASE_STORAGE_BUCKET` | Supabase Storage Bucket Name | e.g. `brand-guidelines` |
| `FRONTEND_URL` | The production URL of your app | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/google/callback` | Google Cloud Console |
| `NODE_ENV` | Set to `production` | `production` |

> [!IMPORTANT]
> Make sure to update `FRONTEND_URL` and `GOOGLE_REDIRECT_URI` once you have your Vercel deployment URL.

## 4. Database Migrations
Vercel doesn't automatically run migrations. You should run the migration script locally against your production database once, or set up a GitHub Action:
```bash
# Run locally (replace with your production DATABASE_URL)
DATABASE_URL=... npm run migrate --workspace=server
```

## 5. Troubleshooting
If the backend is not responding, check the **Function Logs** in the Vercel dashboard. Ensure that `NODE_ENV` is set to `production` so the server doesn't try to call `app.listen()`.
