# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

This is a **greenfield project** — no code exists yet. The only file is `gold-shop-erp-plan.md`, a comprehensive Thai-language plan for a Gold Shop ERP (ระบบ ERP ร้านทองไทย). That plan is the source of truth for scope, architecture, and phasing. Read it before starting any implementation work; update it (checklists, ADRs) when significant decisions are made.

Scope: local development only (Docker Compose), no deployment. UI language is Thai; the domain is Thai gold shops (POS buy/sell, pawn/ขายฝาก, gold savings/ออมทอง, inventory, accounting/tax, CRM+KYC, multi-branch).

## Planned Tech Stack (from the plan — follow unless an ADR changes it)

- Next.js 15 (App Router) + TypeScript strict, Tailwind + shadcn/ui, TanStack Query/Table, React Hook Form + Zod
- PostgreSQL 16 + Prisma (versioned migrations), Redis + BullMQ for jobs (price feed fetch, PDF export, backups)
- Auth.js (NextAuth v5) credentials + TOTP 2FA (otplib), Argon2id password hashing
- Testing: Vitest (unit), Testcontainers (integration against real Postgres), Playwright (E2E)
- Dev env: Docker Compose (`web`, `postgres`, `redis`, `mailhog`, `print-service`), mkcert TLS even locally
- Package manager: pnpm. Target setup: `docker compose up` + `pnpm dev`; CI order: lint → typecheck → unit → integration → e2e

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
