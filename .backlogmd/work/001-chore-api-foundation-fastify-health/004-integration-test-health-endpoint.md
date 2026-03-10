<!-- METADATA -->

```yaml
task: Integration test for /health endpoint
status: done
priority: 40
dep: ["work/001-chore-api-foundation-fastify-health/003-add-health-endpoint.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

**Do this work inside the dev container.** Add an **integration test** that verifies the `/health` endpoint works: GET returns 200 and the expected JSON (e.g. `{ "status": "ok" }`). Use the Vitest as test runner and Fastify’s `inject()`. The test should be runnable via the project’s test script (e.g. `npm test`).

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] At least one integration test exists that calls GET `/health`
- [x] Test asserts response status is 200
- [x] Test asserts response body is JSON and includes the health status (e.g. `status: "ok"`)
- [x] Test runs with the project’s test command (e.g. `npm test`)
