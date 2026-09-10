# ADR 002: Scale reads through API and cache boundaries

## Context
As usage grows, account balances and transaction ledgers become read-heavy resources requested by many concurrent users.

## Decision
Keep the frontend dependent on stable resource-oriented API contracts and use TanStack Query for client-side caching and request deduplication.

At production scale, complement this with server-side caching where appropriate, indexed database queries, and observability around latency, error rates and expensive queries.

## Why
Frontend caching improves the individual user's experience, but application scale ultimately depends on keeping backend reads efficient and observable.