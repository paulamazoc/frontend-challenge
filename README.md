# Personal Finance Manager

Frontend challenge: a personal finance manager built against the supplied in-memory API.

The implemented slice is **accounts and their transaction ledger** (user stories 1 and 2). Other challenge stories are left out on purpose.

## Project overview

What a reviewer can use today:

- Accounts list with current and historical (`asOf`) balances
- Account detail
- Transaction ledger with server-side pagination, text search, and sorting by date or amount
- Responsive accounts grid and ledger table
- Loading, empty, filtered-empty and error states

Routes: `/` redirects to `/accounts`; optional `?asOf=YYYY-MM-DD` values every account as of that date; account detail is `/accounts/:accountId`.

The [supplied backend](docs/API.md) is used as-is.

## Getting started

**Prerequisites:** Node 20+ (developed against 22).

```bash
npm install
npm run dev
```

`npm run dev` starts both processes.

| Process | URL |
| --- | --- |
| Client | <http://localhost:5173> |
| API index | <http://localhost:4000/api> |
| Health | <http://localhost:4000/api/health> |
| Conventions / enums | <http://localhost:4000/api/meta> |

Run one side alone with `npm run dev:api` or `npm run dev:web`. `npm start` runs the API without file watching.

**Environment variables:** none additional environment variables are required.

## Available scripts

From the repo root:

| Script | Purpose |
| --- | --- |
| `npm run dev` | API + client (watch) |
| `npm run typecheck --workspace client` | TypeScript check |
| `npm test` | API tests, then client tests |
| `npm run build` | Production client build (typecheck + Vite) |

## Implemented scope

**Implemented**

- Accounts list with current balances and a URL-backed `asOf` date (`/accounts?asOf=YYYY-MM-DD`); account detail stays current-only
- Account detail with posted / pending / available-credit figures
- Ledger: server-side page, page size, `q`, and date/amount sort, all URL-backed
- Responsive layout (account cards; ledger columns collapse on small screens)
- Async states: loading, empty, no search matches, error, and unknown account

**Intentionally left out**

These are scope trade-offs, not unfinished screens:

- Monthly expense reporting
- Future bills and projected budget
- Mutations / CRUD
- Deployment, CI and containerization (proposed only — see ADRs)

The API accepts more ledger filters than the UI exposes. Extra filters, running balance and portfolio totals were also omitted so the slice stays a usable account ledger rather than a map of the whole contract.

## Architecture

- **React 18 + TypeScript**, Vite
- **MUI** for UI
- **TanStack Query** for server state (no global client store)
- **React Router 7** for routes and URL search params (`asOf` on the accounts list; ledger `page`, `pageSize`, `sort`, `q`)
- Feature folders (`accounts`, `transactions`) with an API boundary and domain helpers kept out of generic UI

Money stays in integer minor units until format; `YYYY-MM-DD` values are calendar dates, not timestamps. Server-derived balances are the source of truth.

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Trade-offs: [docs/DECISIONS.md](docs/DECISIONS.md).

## Scalability and production considerations

The ADRs are **discussion proposals** and they cover:

- Large, server-driven ledgers: [docs/adrs/001-server-driven-ledger-at-scale.md](docs/adrs/001-server-driven-ledger-at-scale.md)
- Caching and API scaling: [docs/adrs/002-api-and-cache-scaling.md](docs/adrs/002-api-and-cache-scaling.md)
- CI/CD and containerization: [docs/adrs/003-ci-cd-and-deployment.md](docs/adrs/003-ci-cd-and-deployment.md)

## AI usage

AI was used as an implementation pair, a reviewer and a critic on trade-offs. Architecture, product scope, technical decisions and final review were human-owned. AI-generated suggestions were kept only when they matched those decisions.

## Trade-offs / next steps

With more time, in this order:

1. Monthly expense report
2. Future bills and projected budget
3. Stronger integration / E2E coverage for the visible async flows
4. Production deployment following [ADR 003](docs/adrs/003-ci-cd-and-deployment.md)
