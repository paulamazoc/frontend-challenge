# Frontend Architecture

## Stack
- React 18
- TypeScript
- MUI
- TanStack Query
- React Router 7

## State model

Server state:
- TanStack Query

Navigational state:
- Route params and URL search params

Ephemeral UI state:
- Local React state

No global client-state store is currently required.

## Structure

src/
  app/
  api/
  domain/
  components/
    ui/
    domain/
  features/
    accounts/

Additional feature folders are introduced only when their vertical slice is implemented.

`features/transactions/` is expected to arrive with the transaction-ledger slice rather than existing as speculative structure.


## Domain rules

- Monetary values remain integer minor units until presentation.
- Currencies must never be aggregated without an explicit conversion strategy.
- YYYY-MM-DD values are calendar dates, not timestamps.
- Server-derived financial values remain the source of truth.

## Current implementation

Milestone 1 establishes:
- TypeScript
- application providers
- MUI theme
- TanStack Query provider
- routing
- application shell

/accounts is the first feature route. /accounts/:accountId exists as a
placeholder so account cards can be real links rather than dead affordances; the
detail screen and the transaction ledger arrive with the next milestone.

Milestone 2 establishes:
- the API boundary
- domain contracts
- money and date formatting
- the first server query
- loading, error, empty and success states

### API boundary

Two layers, deliberately separated:

- `api/client.ts` is transport only. It executes the request, reads the body,
  and normalizes every failure into a single `ApiError`. It returns `unknown`,
  because the API has more than one successful response shape — records use
  `{ data }`, reports do not.
- `api/<resource>.ts` owns one endpoint's contract. It builds the request,
  states the query parameters the client depends on, and verifies the
  assumptions the UI relies on before returning a typed value.

Queries retry once. Three retries with backoff left the user watching a spinner
long after the request was already lost.

### Domain contracts

`domain/api-types.ts` is a copy of `docs/api-types.d.ts`, the hand-written
contract for the whole API. Types the client needs but the contract does not
provide live beside it in `domain/accounts.ts`.

### Formatting

Money and calendar dates are formatted in `domain/`, never inside components.
Minor units become major units only inside `formatMoney`, immediately before
`Intl.NumberFormat` sees them.

### Balance dates

Account balance requests take an optional `asOf` calendar date, and the query
key includes it — balances at two dates are two different answers, not one
answer that went stale.

It is absent by default, which leaves the server's current balance as the source
of truth. The client never computes "today": a client-side today disagrees with
the server's across a timezone boundary, and the server owns the ledger.

The control itself is not built. When it is, it will be URL-backed
(`/accounts?asOf=2026-08-31`), consistent with search params as navigational
state, and one selected date will value every account.
