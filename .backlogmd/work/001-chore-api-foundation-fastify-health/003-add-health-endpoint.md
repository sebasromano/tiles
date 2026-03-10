<!-- METADATA -->

```yaml
task: Add health endpoint
status: done
priority: 30
dep: ["work/001-chore-api-foundation-fastify-health/002-init-typescript-node-fastify.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

**Do this work inside the dev container.** Register a GET `/health` that returns HTTP 200 and a small JSON body such as `{ "status": "ok" }` so we can verify the API is running.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] GET `/health` returns 200
- [x] Response is JSON with at least a status indicator (e.g. `{ "status": "ok" }`)
- [x] Server still starts and listens; no extra dependencies required
