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

    features/
      accounts/
      transactions/

Additional feature folders are introduced only when their vertical slice is implemented.

`features/transactions/` arrived with the transaction-ledger slice, as expected.
The ledger is a transactions concern that the account screen composes:
`TransactionLedger` takes an account id and a currency and knows nothing about
balances.


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
long after the request was already lost. `GET /accounts/:id` opts out of the
retry for 404 specifically: a URL pointing at an account that does not exist is
an answer, not a transient failure.

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

## Milestone 3: the account-detail ledger

Adds the account-detail screen and the transaction ledger beneath it.

### URL state has one boundary

`features/transactions/ledgerSearchParams.ts` is the only place ledger
navigation state crosses between the URL and typed values. Components read a
`LedgerParams` and describe changes; nothing else parses a page number or
decides what a missing value means.

Parsing never throws and never produces a value the API would reject, because
these URLs are shareable and hand-editable. `?page=-3&sort=ssn` renders page one
by date rather than a 400 the user reads as a broken app.

Serialising omits defaults, so an untouched ledger is `/accounts/acc_visa`
rather than `/accounts/acc_visa?page=1&pageSize=25&sort=-date`.

### Query keys

`accounts/list`, `accounts/detail` and `transactions/list`. The transaction key
carries every parameter that changes the answer — account, page, page size, sort
and search — and nothing that does not: `include=category` is a constant of the
request, not a variable.

`accounts/detail` carries no `asOf`, because no caller can supply one yet and a
key parameter for a query that does not exist is a key that will drift.

### Server-driven table state

Paging, sorting and searching are all server-side. The client never reorders or
filters `data`, and never derives a balance from the rows on screen.

`placeholderData: keepPreviousData` keeps the current page visible while the
next one loads; the table dims and sets `aria-busy` rather than collapsing to a
spinner on every interaction.
