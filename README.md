# DevTrack AI

A production-grade developer portfolio intelligence platform. Connect your GitHub account to automatically sync repositories, visualise your coding activity, and generate AI-powered career and code-quality insights — all in one dashboard.

**Live:** https://devtrack-ai-seven.vercel.app

---

## Features

### Dashboard
- Activity heatmap showing commit frequency across the year
- Aggregated stats: total commits, languages, starred repos, active streaks
- Pinned repositories with custom ordering
- Dark / light theme with system preference detection

### Repositories
- Syncs up to 50 GitHub repositories per user
- Per-repo language breakdown with visual charts
- AI-powered code quality audit: architecture review, security flags, improvement suggestions
- PDF export of any audit report

### Career Coach
- AI career advisor powered by Google Gemini — analyses your full portfolio and maps it to career trajectories
- Identifies strongest skills, skill gaps, and recommended next steps
- Shareable public portfolio page at `/u/[username]`

### Analytics
- Recharts-powered visualisations: language distribution, commit trends, repo activity

### Settings
- Profile management, connected accounts, public portfolio toggle, account deletion

---

## Tech Stack

### Framework & Language
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.9 | Full-stack React framework (App Router) |
| [TypeScript](https://typescriptlang.org) | 5 | Type safety across the entire codebase |
| [React](https://react.dev) | 19 | UI library |

### Database & ORM
| Technology | Version | Purpose |
|---|---|---|
| [PostgreSQL](https://postgresql.org) | — | Primary relational database |
| [Neon](https://neon.tech) | — | Serverless Postgres hosting |
| [Prisma](https://prisma.io) | 7.8 | ORM, schema management, type-safe queries |
| [pg](https://node-postgres.com) | 8.22 | Native PostgreSQL adapter |

### Authentication
| Technology | Version | Purpose |
|---|---|---|
| [NextAuth.js](https://next-auth.js.org) | 4.24 | Session management, GitHub OAuth provider |

### AI & Background Jobs
| Technology | Version | Purpose |
|---|---|---|
| [Google Gemini 1.5 Flash](https://ai.google.dev) | — | Portfolio and code quality analysis |
| [Inngest](https://inngest.com) | 4.11 | Background job queue, step functions, automatic retries |

### Caching & Rate Limiting
| Technology | Version | Purpose |
|---|---|---|
| [Upstash Redis](https://upstash.com) | 1.38 | GitHub API response cache (repos 5 min, languages 1 hr) |
| [Upstash Ratelimit](https://upstash.com) | 2.0 | Sliding-window rate limiting per user |

### UI & Styling
| Technology | Version | Purpose |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | 4.12 | Accessible component primitives |
| [Radix UI](https://radix-ui.com) | 1.6 | Headless UI primitives |
| [Lucide React](https://lucide.dev) | 1.21 | Icon system |
| [Recharts](https://recharts.org) | 3.9 | Data visualisation charts |
| [Sonner](https://sonner.emilkowal.ski) | 2.0 | Toast notifications |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4 | Dark / light theme management |

### Forms & Validation
| Technology | Version | Purpose |
|---|---|---|
| [React Hook Form](https://react-hook-form.com) | 7.80 | Form state management |
| [Zod](https://zod.dev) | 4.4 | Schema validation |

### Export & Utilities
| Technology | Version | Purpose |
|---|---|---|
| [@react-pdf/renderer](https://react-pdf.org) | 4.5 | PDF export for audit reports |
| [date-fns](https://date-fns.org) | 4.4 | Date formatting and manipulation |

### Deployment & Infrastructure
| Technology | Purpose |
|---|---|
| [Vercel](https://vercel.com) | Hosting, serverless functions, automatic deployments from GitHub |
| [Vercel Cron](https://vercel.com/docs/cron-jobs) | Daily background sync of all users at 02:00 UTC |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│  Next.js App Router (React Server + Client comps)   │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │     Vercel Edge / CDN   │
          └────────────┬────────────┘
                       │
     ┌─────────────────▼─────────────────┐
     │        Next.js API Routes          │
     │  /api/sync  /api/analyze           │
     │  /api/inngest  /api/auth  ...      │
     └──┬──────────────┬──────────────┬──┘
        │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌───▼────────┐
   │  Neon   │   │  Upstash  │  │   Inngest  │
   │Postgres │   │  Redis    │  │   Queue    │
   │(Prisma) │   │(cache +   │  │(Gemini AI  │
   │         │   │rate limit)│  │ jobs)      │
   └─────────┘   └───────────┘  └────────────┘
                                       │
                                  ┌────▼────┐
                                  │ Google  │
                                  │ Gemini  │
                                  └─────────┘
```

### Key Design Decisions

**Background AI Jobs via Inngest**
AI analysis runs as a background job rather than blocking the HTTP response. `/api/analyze` returns a `jobId` immediately (HTTP 202). The client polls `/api/analyze/[jobId]` every 2 seconds until the job completes. This prevents serverless timeouts and gives users real-time progress feedback.

**Two-Layer Caching**
- *GitHub API cache* (Upstash Redis): repos list cached for 5 minutes, language breakdowns for 1 hour. Invalidated on every manual sync.
- *AI result cache* (PostgreSQL): completed Gemini analysis is reused for 24 hours. Repeated analysis clicks return the cached result instantly without consuming API quota.

**Sliding-Window Rate Limiting**
Per-user limits enforced at the API layer: 5 AI analyses per hour, 3 GitHub syncs per 10 minutes. Returns standard `X-RateLimit-*` and `Retry-After` headers. Falls back to in-memory limiting if Redis is unavailable.

---

## Project Structure

```
devtrack-ai/
├── app/
│   ├── api/
│   │   ├── analyze/          # AI job queue (POST enqueue, GET poll by jobId)
│   │   ├── auth/             # NextAuth handler
│   │   ├── cron/sync/        # Daily background sync (Vercel Cron)
│   │   ├── inngest/          # Inngest webhook handler
│   │   ├── sync/             # Manual GitHub sync
│   │   └── ...
│   ├── dashboard/
│   │   ├── analytics/        # Charts and visualisations
│   │   ├── career/           # AI career coach
│   │   ├── repos/            # Repository list and per-repo detail
│   │   └── settings/         # User preferences
│   └── u/[username]/         # Public portfolio page
├── components/
│   ├── dashboard/            # Shell, sidebar, navbar, page-level components
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── cache/github-cache.ts # Upstash Redis cache helpers
│   ├── hooks/                # Client-side React hooks (useAnalysisJob)
│   ├── services/
│   │   ├── ai.ts             # Gemini API integration
│   │   └── github.ts         # GitHub API sync logic
│   ├── inngest.ts            # Inngest client and function definitions
│   ├── rate-limit.ts         # Upstash sliding-window rate limiter
│   ├── redis.ts              # Upstash Redis singleton
│   └── prisma.ts             # Prisma client singleton
├── prisma/
│   └── schema.prisma         # Database schema
└── vercel.json               # Cron job configuration
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [GitHub OAuth App](https://github.com/settings/developers)
- A [Neon](https://neon.tech) PostgreSQL database
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- An [Upstash](https://upstash.com) Redis database
- An [Inngest](https://app.inngest.com) account

### Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (`sslmode=verify-full`) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (min 32 chars) |
| `NEXTAUTH_URL` | Your deployment URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `CRON_SECRET` | Secret for securing the cron endpoint |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `INNGEST_SIGNING_KEY` | Inngest signing key |
| `INNGEST_EVENT_KEY` | Inngest event key |

### Local Development

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start the dev server
npm run dev

# In a separate terminal — runs the Inngest dev server for local background jobs
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Add all environment variables in **Vercel → Project → Settings → Environment Variables** before deploying.

After deploying, sync your app with Inngest: go to the [Inngest dashboard](https://app.inngest.com) → **Apps → Sync new** → enter `https://your-app.vercel.app/api/inngest`.

---

## Database Schema

| Model | Purpose |
|---|---|
| `User` | GitHub OAuth profile, sync metadata, public portfolio toggle |
| `Repository` | GitHub repo metadata, language stats, pinned order |
| `Commit` | Individual commits for the activity heatmap |
| `CareerAnalysis` | Persisted Gemini portfolio analysis |
| `RepositoryAnalysis` | Persisted Gemini per-repo code audit |
| `AnalysisJob` | Background job status tracker (queued → running → completed / failed) |

---

## License

MIT
