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

/accounts is the first feature route.