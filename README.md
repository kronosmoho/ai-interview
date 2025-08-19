This is an AI Interviewer SaaS built with Next.js App Router, Tailwind CSS, shadcn/ui, and Firebase. It supports AI-generated interview questions, semantic scoring, voice input (mic), optional TTS, and saving sessions.

## Getting Started

First, configure environment variables:

1. Copy `.env.example` to `.env.local` and fill values.
2. Install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

Key routes:
- `/` — Home/start an interview
- `/auth` — Sign in/out (Firebase Auth)
- `/interview` — Interview experience

Key API routes:
- `POST /api/ai/generate-questions`
- `POST /api/ai/score-answer`
- `POST /api/ai/transcribe`
- `POST /api/ai/tts`
- `POST /api/session/save`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Notes
- AI provider is selectable via `AI_PROVIDER` env: `openai` or `gemini`.
- For OpenAI, set `OPENAI_API_KEY` (optionally `OPENAI_MODEL`, `OPENAI_STT_MODEL`, `OPENAI_TTS_MODEL`).
- For Firebase Admin SDK, ensure private key newlines are escaped as `\n` in env.
"# ai-interview" 
