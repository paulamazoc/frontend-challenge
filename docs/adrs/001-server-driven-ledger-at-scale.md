# ADR 001: Keep large ledger datasets server-driven

## Context
The current ledger already uses server-side pagination, filtering and sorting. Loading the complete transaction history into the browser would not scale as accounts and transaction volumes grow.

## Decision
Keep filtering, sorting and pagination server-driven.

For larger datasets, evolve offset pagination toward cursor-based pagination and introduce list virtualization only when profiling shows DOM rendering is a bottleneck.

## Why
This keeps network payloads and client memory bounded regardless of total ledger size, while avoiding virtualization complexity before it is needed.