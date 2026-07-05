# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Rules (from the project owner)

- **Never commit.** The owner reviews all code and commits himself. Leave changes in the working tree and summarize them.
- **Every feature ships with tests in the same change** — unit (Vitest) for pure logic, integration (Testcontainers) for anything touching Postgres transactions/locks, E2E (Playwright) for main flows.

## Current State

**Phases 0–2 are complete** (Foundation; Auth/RBAC/Audit/Settings; Gold Price Engine). `gold-shop-erp-plan.md` is the Thai-language source of truth for scope, architecture, and phasing (Phases 0–8); update its checklists and `docs/adr/` when significant decisions are made — the owner wants progress ticked continuously, not at session end. Next up: Phase 3 (Inventory — plan §7). Known leftovers: role-permission editing UI (roles page is read-only), enforcing 2FA for high-privilege roles at login, price-change alerts into a notification center (module L), real Gold Traders Association feed adapter (mock only).

Scope: local development only (Docker Compose), no deployment. UI language is Thai; the domain is Thai gold shops (POS buy/sell, pawn/ขายฝาก, gold savings/ออมทอง, inventory, accounting/tax, CRM+KYC, multi-branch).

## Commands

- `docker compose up -d` — Postgres 16 / Redis 7 / Mailhog (required for dev and migrations)
- `pnpm dev` (or `dev:https`), `pnpm build`; `pnpm worker` — BullMQ worker (gold price fetch every 5 min; separate process, optional in dev because the admin page has a fetch-now button)
- `pnpm lint`, `pnpm typecheck`, `pnpm format`
- `pnpm test` (unit, fast), `pnpm test:integration` (Testcontainers, needs Docker), `pnpm test:e2e` (Playwright; starts dev server itself)
- Run a single test file: `pnpm vitest run src/server/domain/money.test.ts`
- `pnpm db:migrate` (Prisma migrate dev), `pnpm db:generate`, `pnpm db:studio`, `pnpm prisma db seed`
- Pre-commit (Husky): lint-staged + unit tests + gitleaks (if installed). CI (`.github/workflows/ci.yml`): lint → typecheck → unit → integration → e2e → audit.

## Stack Notes (details in docs/adr/ADR-001)

- Next.js 15.5 App Router, TypeScript strict, target **ES2022** (required for bigint literals), Tailwind 4, Zod 4 (`z.url()`, not `z.string().url()`)
- **Prisma 7**: config lives in `prisma.config.ts` (not the schema datasource block); client is generated to `src/generated/prisma` (gitignored — run `pnpm db:generate` after clone/schema change); instantiation requires the driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. Use the `prisma` singleton from `src/server/db.ts`.
- pnpm 11 blocks dependency build scripts — approve new ones in `pnpm-workspace.yaml` `allowBuilds`.
- Layout: `src/config/env.ts` (zod-validated env, server-only), `src/lib/logger.ts` (pino with PII redact paths — extend when adding sensitive fields), `src/server/domain|services|repositories`, integration tests in `tests/integration/`, E2E in `tests/e2e/`.
- Not yet installed (add when the phase needs them): shadcn/ui, TanStack Query/Table, React Hook Form, BullMQ.
- Auth is **hand-rolled DB sessions, not NextAuth** — see docs/adr/ADR-003 for why (credentials provider forces non-revocable JWT). otplib is v13 (async top-level `generate`/`verify`/`generateSecret`, `counterTolerance` option — the `authenticator` export no longer exists).

## Established Patterns (copy these, don't reinvent)

- Money/weight primitives: `src/server/domain/money.ts` (`Satang` = bigint satang, `mulDivRoundHalfUp` for VAT/ratios, parse via `satangFromBahtString` — rejects excess precision, never silently rounds) and `src/server/domain/gold.ts` (`Milligrams` = bigint mg). See docs/adr/ADR-002.
- Document numbers: `src/server/services/document-number.service.ts` — allocate inside the same `prisma.$transaction` as the document insert (atomic upsert holds the row lock; rollback returns the number, guaranteeing no gaps). Its Testcontainers test (`tests/integration/document-number.test.ts`) is the template for concurrency tests: real Postgres container + `prisma migrate deploy` + parallel transactions.
- Every request carries `x-request-id` (set in `src/middleware.ts`) — thread it into logs/audit records.
- **Server action pattern** (see `src/app/admin/users/actions.ts`): `requireSession()` → `requirePermission(prisma, userId, code, branchId?)` → zod safeParse → `prisma.$transaction(mutation + writeAuditLog)` → `revalidatePath`. Permission catalog lives in `src/server/auth/permissions.ts`; new permissions are seeded by `seedRbac` (idempotent, shared with tests).
- Privileged actions use `requireApproval()` (`approval.service.ts`) — approver PIN + permission check + `requireDifferentApprover` for maker-checker.
- Sensitive fields: encrypt with `encryptString` (AES-256-GCM) + store `hmacHash` alongside when lookup is needed (see `totpSecretEnc`, recovery codes).
- Integration tests boot from `tests/integration/helpers/test-db.ts` (one Postgres container per file, `fileParallelism: false`). `vitest.setup.ts` supplies fallback env for CI.
- Dev seed creates `owner` / `ChangeMe-Owner-1` (override with `SEED_OWNER_PASSWORD`); E2E specs depend on it.
- React 19 resets uncontrolled form fields after a server action — use controlled inputs when a form submits more than once (see `login-form.tsx`), and don't `revalidatePath` before the user has seen one-time data (recovery codes).
- **Price snapshot**: every future transaction module must stamp bills via `buildPriceSnapshot()` (`price-snapshot.service.ts`) — JSONB format v1 with a zod schema, bigints as strings. `getCurrentShopPrice()` returns `feedStale` for the warning banner; a dead feed must never block selling.
- External integrations hide behind adapter interfaces (see `GoldPriceFeedSource` + `MockGoldPriceFeedSource` in `src/server/prices/feed-source.ts`); job logic lives apart from the BullMQ worker (`gold-price.job.ts` vs `gold-price.worker.ts`) so the admin "fetch now" button reuses it without the queue.
- `pnpm-workspace.yaml` pins `overrides: ioredis` — BullMQ ships its own ioredis and duplicate versions break typechecking; keep the override in sync when bumping ioredis.

## Non-negotiable Architecture Rules

These come from the plan's "กติกาสถาปัตยกรรมที่ต้องถือเคร่งครัด" and design principles. Every PR touching money/gold transactions must satisfy them:

1. **Money is integer satang (`BIGINT`), never floating point.** Gold weight is `NUMERIC(10,3)` grams with a separate display-unit field (บาท/สลึง/กรัม). 1 baht-gold = 15.16 g (ornament) / 15.244 g (bar).
2. **Financial records are immutable double-entry.** Closed bills are never edited or deleted — corrections happen via void/reversal documents. Transaction tables use status + reversal, never soft delete (soft delete is for master data only).
3. **Gold price is snapshotted onto every bill** (JSONB `price_snapshot`) at transaction time, via a single Price Snapshot service. Never re-derive from current price.
4. Layering: App Router UI → Server Actions/Route Handlers → **Service layer (pure TypeScript business logic: pricing, pawn interest, VAT)** → Repository layer (Prisma, only inside transactions). Money math must be pure functions with exhaustive unit tests. No monetary calculation trusted from the client.
5. Every money/gold use case runs in **one DB transaction** with `SELECT ... FOR UPDATE` on contended rows (stock items, document sequences). Bill/payment submission uses idempotency keys.
6. Every endpoint: authenticate → authorize (permission + branch scope) → validate (Zod, server-side) → execute → audit log. **Deny-by-default** permissions; branch scoping enforced at the repository layer, not just UI.
7. **Document numbers** (bills, tax invoices, contracts) come from a transactional sequence table — tax invoice numbers must have no gaps or duplicates.
8. **Audit log is append-only** — the app's DB user must not have UPDATE/DELETE on `audit_logs`; record before/after values with request id. Stock movements are an append-only ledger from which balances are derived.
9. Sensitive fields (Thai ID numbers, bank accounts) encrypted with AES-256-GCM plus an HMAC hash column for lookup; role-based masking; no PII/secrets in logs (pino redact).
10. Privileged actions (void, price override beyond limit, forfeited-pawn approval, stock adjustment) require step-up PIN approval with maker-checker separation.

## Domain Knowledge Essentials

- Thai standard gold purity is 96.5% (also 99.99%, 90%, and karat gold); store weight in grams, purity %, and display unit.
- Ornament gold sale price = (association sell price × baht weight) + ค่ากำเหน็จ (labor charge, configurable per piece/per baht/per category). Buy-back price is lower and rate depends on own-shop vs other-shop gold.
- **Gold-shop VAT is special:** VAT applies only to the labor charge + margin base (per Revenue Department rules), not the full price.
- Pawn contracts (ขายฝาก) accrue interest with a legal rate cap; lifecycle events (open, interest renewal, redeem, forfeit) are an append-only event log; forfeited gold enters stock at cost = outstanding principal.
- AMLO compliance: cash-transaction thresholds trigger mandatory KYC and reportable-transaction exports; PDPA governs customer ID data (consent, encryption, retention).
- Inventory distinguishes serialized pieces (every ornament has a unique tag; sellable exactly once — enforce with partial unique index) from countable items (standard gold bars).

## Development Phases

The plan defines Phases 0–8 (`gold-shop-erp-plan.md` §7): 0 Foundation → 1 Auth/RBAC/Audit → 2 Gold Price Engine → 3 Inventory → 4 POS+Payments+Tax (core) → 5 Pawn → 6 Savings/Work orders/CRM+AMLO → 7 Accounting/Reports → 8 Hardening/Multi-branch/UAT. Build in phase order; each phase lists required schema, features, and mandatory tests (notably concurrency tests for document sequences and single-item sales, golden tests for price/tax/interest formulas verified against hand-calculated cases, and a daily invariant job asserting Σdebit = Σcredit and ledger-derived stock = per-item status).

Definition of Done per phase: ≥80% unit coverage in the service layer, E2E happy paths pass, no critical `pnpm audit` findings, migrations tested up/down, docs updated.

## Hardware / External Integrations

Mock all hardware and external feeds in dev (gold-price association feed, ESC/POS slip printer, label printer, smart-card ID reader) behind adapter interfaces. Failure of any of them must not block committing a bill — degrade gracefully (last announced price + warning banner; print retry queue).
