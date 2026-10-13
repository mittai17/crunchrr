# crunchrr

A connected Personal Life OS, built as a pnpm/Turborepo monorepo. The web interface follows the supplied actual UI: a black icon rail, gray canvas, lime/yellow work analytics, notes and teamwork cards; Expo has independent native screens and shares contracts, validation and business rules with the web and NestJS API.

## Start

Requires Node 22+, pnpm 10+, and a configured Neon/Clerk development environment. Dedicated Crunchrr projects have already been provisioned using both CLIs. Their keys are in ignored local environment files, never committed.

```sh
pnpm install
pnpm db:migrate
pnpm dev
```

Open **http://localhost:3000**. Create an account with Clerk; your personal workspace starts empty. `pnpm dev` starts the web app on 3000 and the authenticated API on 4000. Backend keys and pooled Neon connection are read from the root `.env`; the Next.js app reads `apps/web/.env.local`.

### Development demo

```sh
pnpm dev:demo
```

Open **http://localhost:3000/demo/dashboard**. This starts a separate loopback-only API on 4001 and uses an explicitly synthetic `demo_crunchrr` owner in the same development database. It never seeds authenticated users' workspaces. Never enable demo mode in production. The production API rejects demo headers. Do not run both commands at once without choosing different web ports.

### Mobile

```sh
pnpm dev:mobile
```

The Clerk key is already set in `apps/mobile/.env`. Set `EXPO_PUBLIC_API_URL` to your computer's LAN IP for physical devices, or `http://10.0.2.2:4000/api/v1` for the Android emulator. `localhost` on a phone is the phone itself. Native routes use the `crunchrr://` scheme, including task/event/medicine/project/order entity aliases. Email/password sign-in and email-code sign-up are included; email/SMS codes and TOTP MFA are supported, with unsupported factors directing users to the web experience.

### Reminders

```sh
docker compose up -d redis
pnpm --filter @crunchrr/worker dev
```

BullMQ scans due records every minute. Notifications are owner-scoped, idempotently deduplicated, and respect the in-app notification preference. Recurring reminders/events/bills/subscriptions/habits/medicines advance their next due date. In-app delivery is implemented; email and push adapters are not yet implemented.

## Workspace

- `apps/web`: Next.js, Tailwind, Radix/shadcn-style primitives, Framer Motion, Recharts, React Hook Form, TanStack Query, Clerk.
- `apps/mobile`: Expo Router, React Native, NativeWind, secure Clerk token cache, native list/detail/create screens, haptics, pull-to-refresh, adaptive tabs/rail, system light/dark appearance.
- `apps/api`: NestJS/Fastify, Clerk bearer verification, repository/service/controller layers, REST endpoints and safe error responses.
- `apps/worker`: Redis/BullMQ reminder scheduler and in-app notification delivery.
- `packages/database`: Drizzle schema, migrations, pool and guarded development seed.
- `packages/validation`, `types`, `api-client`, `utils`, `state`, `ui`, `config`: shared contracts, domain rules and tokens. Web and native do not share UI components.

## Implemented experience

All 23 entity kinds have server-validated, persisted create/read/update/delete operations, search and typed Life Graph relationships. Every module is directly accessible from the compact desktop sidebar. The calendar follows the supplied pastel time-grid reference with a black filter panel, synchronized mini calendar, Week/Day/Month/Agenda views, category filters, saved event favorites, attendee portraits, event previews, slot-based creation and desktop event rescheduling. Core views include dashboard, task views, Markdown notes, finance category charts, health logging, medicine-taking history, goal progress, daily habit completion, and connected supporting modules. Quick Add previews simple natural-language parsing before saving. Entity details support editing, deletion, linked record navigation and relationship creation/removal.

Profile onboarding, theme and currency/timezone preferences, dashboard widget visibility, AI read permissions, notification center, JSON/CSV export and account deletion are implemented. The mobile app supports list/detail/edit/create/search and linking; its specialist dashboards and advanced input controls are less extensive than the web.

## AI and files

The AI SDK gateway supports OpenAI and Anthropic, configured with `AI_PROVIDER`, `AI_MODEL` and the corresponding API key. It reads only owner-scoped permitted records, truncates retrieval context, and cannot directly mutate the database. Task/event/note proposals require review through the normal validated CRUD path. Without a provider key, it returns an actionable configuration error; no simulated AI answer is substituted.

Private document uploads use S3/R2 signed PUT and GET URLs. Configure `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and restrict bucket CORS to your web origin. Files remain private. Only safe MIME types and files up to 20 MB are accepted. These integrations are implemented but have not been tested with a live AI provider or storage bucket.

Optional Sentry DSNs enable web monitoring without default PII. PostHog initializes only with `NEXT_PUBLIC_ANALYTICS_OPT_IN=true`, with autocapture, page tracking and session recording disabled. No live monitoring credentials are configured.

## Verification

```sh
pnpm typecheck
pnpm test
pnpm test:integration   # writes isolated temporary test users to configured DB; removes them afterward
pnpm test:e2e           # requires web + demo API running
pnpm --filter @crunchrr/web build
pnpm --filter @crunchrr/api build
pnpm --filter @crunchrr/worker build
pnpm --filter @crunchrr/mobile build
```

Evidence collected: 34 domain/layout tests; a real-Neon repository integration test covering CRUD, cross-owner denial, optimistic conflict rejection, full-text search, links and deletion cascade; browser E2E tests for persistent task CRUD/Life Graph/search, responsive navigation and saved dashboard widgets; real Clerk JWT API checks for authentication, demo isolation, AI permission denial and file-input validation; successful web/API/worker builds and Android/iOS bundle exports. Native device runtime checks are **not** complete: the local AVD references a missing system image, and no iOS simulator is available here.

## Scope and launch status

This is an implemented development MVP, **not a production launch certification or a completed implementation of every item in the 94-section brief**. See [scope and remaining work](docs/SCOPE.md) and [architecture/security notes](docs/ARCHITECTURE.md). Clerk is currently a development instance. Before launch, configure production domains/keys, storage/AI/monitoring, verify native device flows, and complete the remaining specialist features and delivery integrations.
