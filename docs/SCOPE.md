# Delivered scope and remaining work

The source of requirements is `REQUEST.md`. The current build is a working connected MVP with a broad entity platform, not 23 fully specialized commercial applications.

| Area | Current behavior | Remaining work |
|---|---|---|
| Authentication | Dedicated Clerk project; verified API bearer tokens; web hosted auth; native email/password + email-code registration | Production Clerk instance/domains; native MFA/passkeys/Google/Apple flows; deletion webhook reconciliation |
| Data | Neon PostgreSQL, Drizzle, UUID resources, tenant ownership, optimistic versions, indexed common columns, generic typed JSONB domain bodies | More normalized domain tables as specialist workflows grow; per-user DB roles/RLS defense; migration-version ledger |
| Life Graph | Composite owner/entity foreign keys, typed links, bidirectional contextual views | Task dependency cycles and graph traversal/search relevance ranking |
| Tasks | CRUD, dates, priorities, status, five filtered views, estimated time, recurrence field | Full subtask UI, task dependencies, task recurrence materialization, richer assignment/tag/attachment flows |
| Calendar | Day/week/month/agenda, event details, drag to another day preserving duration, recurrence scheduling | Time-grid drag/resize, complete recurrence exception handling and history, participant UI, calendar integrations |
| Notes | Persisted Markdown content and safe Markdown/GFM rendering | Full block/rich editor, inline images, code syntax themes |
| Finance | Income/expense/account/budget entities, INR-oriented charts, currency fields, links and audits | Real transfers, debt/savings workflows, multi-currency conversion, historical trends/budget enforcement |
| Health | Validated manual numeric metrics and related events/documents | Structured BP and symptom records, richer time series and import integrations |
| Medicines | Validated profile/inventory, prescribed dosage text, taken-date log, refill estimate and reminders | Normalized dose schedule/log tables, inventory debit on dose, per-dose snooze/skip/missed handling, prescription extraction |
| Habits/goals/wellbeing | Daily completion history, 7-day view, stored progress and check-ins | Longer heatmaps/streak calculations, structured progress logs, advanced schedules |
| Supporting modules | Projects, people, meals, trips, vehicles, shopping, orders, bills, subscriptions, vault CRUD + links | Specialized timeline/bookings/service/item/renewal workflows and bulk operations |
| Search | Real PostgreSQL FTS plus escaped partial title matching, owner-scoped pagination | Search result expansion with context previews, embeddings jobs; optional pgvector migration is supplied |
| Dashboard | Responsive bento widgets; database totals; visibility preferences; contextual entity panels | Reorder/resize/layout presets; due-priority adaptive ordering; configurable weather provider |
| AI | OpenAI/Anthropic abstraction, explicit per-domain read permissions, bounded retrieval, review-before-create proposals | Live provider validation; more controlled read tools; signed proposal confirmation tokens; native proposal editor |
| Files | Private S3/R2 signed uploads/downloads, type/size validation, ownership | Live bucket setup; virus scanning/content sniffing; upload-completion state; file bundles in export |
| Notifications | BullMQ scheduler, in-app notifications, read state, preference, recurrence due advancement | Email/push channels; user device registration; richer channel preferences; process-specific jobs |
| Offline | Owner-separated native persisted query cache only for tasks/notes/shopping/habits/calendar | Web offline cache and safe mutation queue; native conflict-resolution UI |
| Safety/privacy | Server ownership, strict inputs, rate limits, audit records, no client secrets, AI permission checks | Distributed rate limiting, durable deletion saga, external deletion reconciliation, larger complete threat review |
| Quality | Unit/integration/E2E checks; web visual review; mobile bundle exports | Native emulator/device tests, RTL/RNTL component tests, accessibility audit for every specialist surface, load tests |

Live R2/storage, AI providers, production deployment, email/push delivery, and native runtime validation require further work. No feature is represented as completed merely because its package dependency or configuration interface exists.
