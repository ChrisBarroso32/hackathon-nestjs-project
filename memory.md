# Memory — Prisma ORM setup

Last updated: 2026-10-07

## What was built

- Installed Prisma 7.10.0 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`), plus `pg`, `dotenv`, `tsx`, `@types/pg`.
- `prisma/schema.prisma`: generator `prisma-client`, output `../src/generated/prisma`, `moduleFormat = "cjs"`; datasource `postgresql`. **No models yet.**
- `prisma.config.ts` (root): loads `dotenv/config`, reads `DATABASE_URL`.
- `src/lib/database/prisma.service.ts`: extends the generated `PrismaClient`, uses `PrismaPg` adapter with `DATABASE_URL` from `ConfigService`, connects/disconnects in lifecycle hooks.
- `src/lib/database/prisma.module.ts`: `@Global()`, exports `PrismaService`; imported once in `AppModule`.
- `.env` has `DATABASE_URL` (remote Prisma Postgres, pooled). `.gitignore` ignores `/src/generated/prisma`.
- `npm run build`, `npm run lint` pass; built app boots and connects to the DB.

## Decisions made

- Generator output lives in `src/generated/prisma` (not `generated/`) because `tsconfig.build.json` has `rootDir: ./src`; otherwise `nest build` would not emit it.
- `moduleFormat = "cjs"` because the project is CommonJS (no `"type": "module"` in package.json).
- Pinned `prisma` CLI to 7.10.0: npm `latest` for the CLI is 8.0.0-rc.21, which mismatched `@prisma/client` 7.10.0.
- `PrismaService` extends `PrismaClient` (Nest standard) rather than instantiating it elsewhere, per CLAUDE.md.

## Problems solved

- `prisma init` wrote `prisma7.config.ts`, which the CLI does not auto-load — renamed to `prisma.config.ts`.
- `prisma init` also appended a local `prisma+postgres://` `DATABASE_URL` to `.env`; removed so it does not shadow the real one.
- While cleaning `.env`, `ARCJET_MODE` was accidentally deleted. Original value was lost (gitignored). Restored as `DRY_RUN` (the service default) — **verify whether it should be `LIVE`**.

## Current state

DB connection works. `prisma migrate dev --name init` reported "Already in sync" and created no migration because the schema has no models.

## Next session starts with

Define the first models in `prisma/schema.prisma`, then `npx prisma migrate dev --name init` and `npx prisma generate`. Inject `PrismaService` into feature modules under `src/module/<name>/`.

## Open questions

- Correct value of `ARCJET_MODE` (`LIVE` or `DRY_RUN`)?
- Prisma `init` also added Prisma skills under `.agents/`, `.claude/`, `.windsurf/` and changed `skills-lock.json` — keep or discard before committing?
- Rotate the database credential: it was pasted in chat.
