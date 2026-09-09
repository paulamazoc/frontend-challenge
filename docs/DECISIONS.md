# Key Initial Decisions [WIP]

## 1. Scope: ledger first

**Decision:** Implement accounts + transactions + current/as-of balance as core functionalities, and monthly expense report as a second slice.

**Why:** I prioritized the account ledger and balance workflows because they are foundational to the rest of the product and exercise the highest risk frontend concerns: financial correctness, date handling, server state, filtering, pagination, mutations and performance.
Monthly expense reporting is the second slice because it can demonstrates reuse of the same domain model without creating a parallel implementation.

## 2. Design system: MUI

I chose MUI because the challenge explicitly values consistency, reuse, accessibility and scalable component composition over a custom visual design. I already have production experience with it, which lets me spend more of the limited implementation time on other matters like financial correctness or architecture instead of learning or rebuilding primitives.
In a production Estateably environment I would work within the team's existing design system and component conventions.

## 3. Server state: TanStack Query

I chose TanStack Query for server state because the dominant shared state in this application comes from the API and has concerns such as fetching, caching, retries, invalidation and mutation lifecycle.
I intentionally didn't introduce a global client-state store because I didn't identify a global client-state problem that justified one.

## 4. Financial correctness: explicit domain rules

Financial values will remain in integer minor units throughout the application. Formatting will happen only at the presentation boundary.

## 5. Testing: risk-driven

I will choose tests based on the impact of failure rather than coverage targets.

Unit tests will cover domain utilities and financial calculations where silent errors are dangerous.

Integration tests will cover user-facing workflows where multiple layers interact and where a failure would be meaningful to the user, such as filtering or mutation/error flows when those features are implemented.

An e2e test will only be added if time allows and if it covers a meaningful critical journey.

# Tooling and Technical Decisions

## 6. API boundary: transport separate from endpoint contracts

**Decision:** `api/client.ts` handles transport and error normalization and returns `unknown`. Each endpoint module narrows that value itself.

**Why:** The obvious shortcut is a generic `apiFetch<T>()` that unwraps `{ data }` and casts to `T`. It breaks immediately here because reports and projections return their own top-level shapes rather than a `data` envelope, and it launders an unchecked cast through a helper that looks like it validated something.

Returning `unknown` means the only place a response becomes a typed value is the module that knows what that endpoint promises.

**Trade-off:** Every endpoint pays for its own narrowing instead of inheriting one generic unwrap. With one endpoint that cost is small; if it grows repetitive, the answer is a shared helper for the `{ data }` family, not a cast in the transport layer.

## 7. Response validation: narrow structural checks, not schemas

**Decision:** Verify only the assumptions a screen actually depends on. Do not introduce a client-side schema library yet.

**Why:** The failure I care about is a contract break — a field disappearing or an expectation quietly going unmet — and that is caught by checking the handful of things the UI reads. Re-describing every entity in a client-side schema would duplicate a contract the server already owns and create a second thing to keep in sync.

For `GET /accounts` that means: `data` is an array, `meta` carries `asOf`, and every account carries a `balance`. Field-level shapes inside an account are trusted.

`totalsByCurrency` was checked here until the Accounts page stopped rendering it (see decision 9). Guarding a field nothing consumes would contradict the same risk-based principle, so the check went with the feature.

**Trade-off:** A field whose type silently changes will not be caught at the boundary. That is an accepted risk against a fixed backend contract. The decision would change if this API were third-party, versioned independently, or otherwise less controlled.

**Mismatch found:** `docs/api-types.d.ts` types collections as `Collection<T, ListMeta>`, but `GET /api/accounts` does not paginate — its `meta` is `{ total, asOf, totalsByCurrency }`, with no `page`, `pageSize` or `hasMore`.

The server is the source of truth, so the client declares its own `AccountsListMeta` and `docs/api-types.d.ts` is left unchanged.

## 8. Money and date formatting live at the presentation boundary

**Decision:** Amounts stay in integer minor units through every layer. `formatMoney` divides into major units only to hand the result to `Intl.NumberFormat`; that number is never stored, summed, or compared.

Non-integer minor-unit input throws because a fractional minor value means major-unit arithmetic has already leaked somewhere upstream.

Calendar dates are never passed to `new Date(string)` and rendered in the local timezone. `formatCalendarDate` pins the value to UTC midnight and formats it with `timeZone: 'UTC'`.

**Why:** These are two places where financial data can go silently wrong rather than loudly wrong.

The date tests run pinned to `America/Vancouver` so that a naive implementation would render `2026-03-01` as February 28 and fail the suite instead of passing only because a developer machine happens to be in UTC.

**Trade-off:** Throwing on non-integer minor units is deliberate: it makes a contract violation visible instead of silently rounding it. In a larger production application, the surrounding error-boundary and observability strategy would determine how that failure reaches the user.

## 9. The Accounts page follows the user stories, not the API surface

### Per-account balances, not portfolio totals

**Decision:** Remove the "Totals by currency" section. The account list is the page's primary content.

**Why:** The two stories in scope are managing individual accounts and seeing each account's balance, now or as of a chosen date. Per-currency aggregation is correct and the API provides it, but it answers a portfolio question neither story asks.

Rendering data simply because the response contains it would turn the screen into a representation of an endpoint rather than a focused user workflow.

**The domain rule is unchanged:** currencies are still never combined without an explicit conversion strategy. The page now never aggregates at all, and each account carries its own currency, so the rule holds by construction rather than by a caption explaining it.

### Sign conventions are backend vocabulary

**Decision:** A credit card in debt shows "Balance owing $6,818.22" as a positive magnitude, with posted and pending values presented in the same frame. An overpaid card shows "Credit balance".

Deposit accounts show "Available balance" and remain signed, so an overdrawn chequing account still reads negative.

**Why:** The API models card debt as a negative `available` balance. That sign convention is useful for arithmetic but not necessarily for user comprehension — a person does not have "-$6,818.22 available"; they owe $6,818.22.

The previous card also led with an unlabelled figure, which left "the balance" ambiguous exactly where the API carefully distinguishes posted, pending and available.

**Boundary:** The sign transformation is presentation, not balance derivation. It uses integer arithmetic on server-supplied values and never recomputes the balance.

The rule lives in `summarizeAccountBalance`, a pure function with unit tests covering debt, overpayment, overdrawn deposit accounts and negative zero. Mislabelling money owed as money available is precisely the kind of silent financial error described in decision 5.

This presentation rule applies to account balances only. Transaction amounts have their own semantics and will be decided as part of the ledger workflow rather than inheriting the account-balance transformation.