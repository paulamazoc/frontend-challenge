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

Integration tests will cover user facing data workflows such as loading, filtering, editing and mutation failure.

An e2e test will only be added if time allows and if it covers a meaningful critical journey.