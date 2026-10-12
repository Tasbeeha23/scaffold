# Scaffold

Scaffold turns a rough product idea into a structured execution roadmap. It validates the AI response, visualizes task dependencies, and also provides an accessible list view.

## Run locally

1. Install Node.js 22 or newer and run `npm ci`.
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to a Gemini API key.
3. Run `npm run dev`, then open `http://localhost:3000`.

Optional: set `GEMINI_MODEL` to select a Gemini model available to your API key. The default is `gemini-1.5-flash` for compatibility with the currently installed SDK.

## Architecture

- `app/page.tsx` renders the product shell.
- `components/scaffold-workspace.tsx` owns the react-hook-form submission, validation feedback, loading state, retry state, and returned plan state.
- `components/roadmap*.tsx` render the React Flow dependency graph and semantic list fallback.
- `app/api/generate-plan/route.ts` validates requests, applies a small per-instance rate limit, and keeps Gemini access server-side.
- `lib/schema.ts` enforces the response contract, unique IDs, resolvable dependencies, and an acyclic task graph.

The returned roadmap contains a title, summary, phases, and tasks. Every task includes a stable ID, description, optional hour estimate, and dependency IDs.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

GitHub Actions runs these checks for every push and pull request.

## Deployment and security

Deploy as a Next.js Node.js application and configure `GEMINI_API_KEY` in the host's encrypted environment settings—never expose it as `NEXT_PUBLIC_*` or commit `.env.local`.

The endpoint has a 25-second upstream timeout and an in-memory limit of 10 requests per IP per minute. In-memory limits reset when an instance restarts and are not shared across instances; replace `lib/rate-limit.ts` with Redis, Vercel KV, or your platform's edge limiter before a multi-instance public deployment. Ensure your host supplies trustworthy forwarding headers before relying on IP-based limiting.

## Gemini SDK note

`@google/generative-ai` is a legacy SDK. Its own installed README marks it end-of-life and recommends `@google/genai`. This checkout could not download packages from npm during implementation, so the code remains compatible with the installed dependency. Before production, install `@google/genai`, migrate `lib/ai.ts` using Google's migration guide, and remove the legacy package.
