# Key Decisions

## 1. Scope: accounts and ledger first

**Decision:** Prioritize accounts, balances and their associated transaction ledger.

**Why:** These workflows are foundational to the product and exercise the most relevant frontend concerns for the challenge: financial correctness, server state, navigation, pagination, filtering and performance.

Additional stories such as expense reporting and projections are intentionally left as future work rather than implemented superficially.

## 2. Design system: MUI

**Decision:** Use MUI as the UI foundation.

**Why:** The challenge values consistency, accessibility, reuse and composition over bespoke visual design. Using a familiar, mature system lets implementation time focus on product and architecture concerns.

In production I would follow the team's existing design system and conventions.

## 3. Server state: TanStack Query

**Decision:** Use TanStack Query for API-backed state and keep navigational state in the URL.

**Why:** Most shared state is server state with fetching, caching, retry and invalidation concerns. No global client-state problem currently justifies introducing another store.

## 4. Financial and date correctness

**Decision:** Keep monetary values in integer minor units until presentation, and treat `YYYY-MM-DD` values as calendar dates rather than timestamps.

**Why:** Both money and dates can fail silently while still displaying plausible values. Formatting therefore happens at explicit presentation boundaries, without using floating-point values for financial arithmetic or allowing timezone conversion to shift business dates.

## 5. Testing: risk-driven

**Decision:** Test based on the impact of failure rather than coverage targets.

**Why:** Tests focus on financial semantics, date handling, URL state and API request construction — areas where incorrect behavior may not be visually obvious. UI behavior that is immediately visible is verified manually for this challenge.

## 6. API boundary

**Decision:** `api/client.ts` handles transport and error normalization and returns `unknown`; endpoint modules own response narrowing.

**Why:** The API exposes different response shapes, so a generic typed unwrap would imply validation it does not actually perform.

Runtime checks remain intentionally narrow and validate only assumptions required by the consuming UI rather than duplicating the complete server contract in client-side schemas.

The running server is treated as the source of truth where the supplied API types and actual response shape disagree.

## 7. Accounts follow the user story, not the API surface

**Decision:** The Accounts page focuses on individual accounts and their balances rather than rendering every value exposed by the API.

For example, portfolio totals were intentionally omitted because they answer a different question than the stories currently in scope.

**Balance semantics:** deposit accounts show their signed available balance. Credit-card debt is presented as a positive **Balance owing**, while an overpaid card becomes **Credit balance**.

This is a presentation transformation only; server-derived balances remain the source of truth.

## 8. Transaction signs remain ledger semantics

**Decision:** Transaction amounts preserve the server's sign and currency:

- negative = outflow
- positive = inflow
- zero = neither

Credit-card transactions are not inverted.

**Why:** Account balances answer "where do I stand?", while ledger rows answer "which way did money move?". The credit-card balance presentation rule therefore stops at the balance summary.

Outflows remain visually neutral and inflows may use positive emphasis; color is never the only carrier of meaning.

## 9. Account detail uses one account request

**Decision:** Use `GET /api/accounts/:id` for account context and balance rather than making a second balance request.

**Why:** The endpoint already includes the balance, so a second request would duplicate data and introduce unnecessary loading/error states.

Historical `asOf` behavior can be addressed separately when that workflow is implemented.

## 10. Ledger scope stays intentionally small

**Decision:** The ledger supports:

- server-side pagination
- Date and Amount sorting
- text search
- URL-backed `page`, `pageSize`, `sort` and `q`

Additional API filters are intentionally not exposed.

**Why:** These controls are enough to meaningfully explore an account's transactions without turning the UI into a representation of every capability exposed by the endpoint.

Search is debounced and replaces URL history so typing does not generate a request and browser-history entry for every keystroke.

## 11. No running balance

**Decision:** Do not enable `withRunningBalance`.

**Why:** Running balance belongs to an unfiltered, date-ordered statement workflow. On the searchable/sortable ledger it could appear inconsistent with the visible rows and would constrain sorting behavior.

## 12. Pagination ordering

**Decision:** Use the documented server sort tokens and leave deterministic tie-breaking to the server.

**Trade-off:** Same-date transactions could expose unstable page boundaries if server ordering changes. This is documented rather than solved with a speculative client workaround.

## 13. Ledger testing

**Decision:** Keep ledger tests focused on URL parsing/serialization, transaction request construction and amount-direction semantics.

**Why:** These failures can silently display the wrong financial data or transactions. A DOM testing stack was not introduced solely for this challenge; visible UI behavior was verified manually.