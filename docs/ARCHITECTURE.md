# Architecture and security

## Flow

Clients obtain Clerk session bearer tokens and call `/api/v1`. Nest's guard verifies signature/expiry against the configured Clerk instance, checks browser `azp` when present against authorized origins, and resolves the Clerk subject to an internal UUID. Native and Backend-API-issued Clerk session tokens can omit `azp`; they must still verify cryptographically. Client-supplied owner IDs are never used.

Controllers parse shared Zod schemas, services apply domain policies, and repositories perform owner-qualified Drizzle/PostgreSQL operations. Every entity and link belongs to an internal user. Composite `(owner_id, entity_id)` foreign keys prevent cross-owner links even if service checks regress. Reads, updates, deletes, files, exports, notifications and AI retrieval all apply ownership. Updates compare the supplied version and increment it transactionally; a stale update returns 409. Sensitive mutations produce minimal audit metadata, not copies of personal content.

## Storage model

`users`, `entities`, `entity_links`, `files`, `notifications`, and `audit_logs` normalize ownership and relationships. Entity common fields are typed columns; domain-specific bodies are JSONB validated by kind-specific schemas. This deliberately enables the initial cross-module platform without 50 half-built tables. Specialist normalized tables remain an expansion task. JSONB values must enter through the shared validation/service boundary; direct database access is trusted administrative access.

The initial migration applies in a transaction and uses idempotent DDL. The full-text generated vector covers title, description, note content and category; queries use parameterized `websearch_to_tsquery`, escaped `ILIKE`, tenant filters and limits. `0002_optional_semantic_search.sql` is an opt-in future embedding store, not an implemented semantic-search feature.

## Demo boundary

The normal API denies demo headers. A separately started non-production demo API requires explicit `DEMO_MODE=true`, listens only on loopback, accepts only loopback demo requests and resolves a fixed synthetic owner. Production startup rejects demo mode. Seed scripts reject production and require an explicit demo flag. Keep preview services behind loopback; never expose the demo listener through a production proxy.

## AI boundary

The assistant has no SQL, filesystem or arbitrary HTTP tools. Retrieval calls owner-scoped repositories only for permitted kinds, selects at most 20 records and truncates lengthy fields. User records are labeled as untrusted context. Model output is parsed and only task/event/note creation proposals are exposed. Normal CRUD permissions, input validation and auditing run again when the user reviews/saves. AI does not diagnose, prescribe or recommend medication changes. Token counts are capped; rate limiting and timeouts bound expensive calls.

## Files

Object keys are server-generated under an owner's UUID. Metadata never contains a public file URL. Signed uploads include content type/length and expire in two minutes. Signed downloads require ownership and force attachment disposition. Account deletion attempts object removal before removing Clerk and PostgreSQL user records. A durable deletion saga and provider webhook reconciliation are still needed for partial failures and externally deleted accounts. A configured bucket must reject public access and restrict CORS. Malware scanning and content verification remain necessary before accepting untrusted files at production scale.

## Operations

Set `WEB_ORIGIN` and `CLERK_AUTHORIZED_PARTIES` to exact deployed browser origins; API bearer auth does not rely on cookies. Serve web/API through HTTPS. Use pooled Neon connections; keep credentials server-only. Production needs a restricted DB role, managed private Redis with TLS/auth, distributed rate limiting, observability credentials and encrypted backups. Worker jobs are idempotently deduplicated and retry transient failures. Metrics logs should avoid personal record text.

Production keys and credentials are not present in shared source. Local `.env` and `.private` are ignored and restricted. Never paste secret keys into issue/PR descriptions or frontend environment variables.
