<!-- METADATA -->

```yaml
work: API foundation with Fastify (Node 24) and health endpoint
status: done
assignee: ""
```

<!-- DESCRIPTION -->

Set up a minimal API using Fastify on Node 24 (Active LTS) so the project runs and can be verified via a health endpoint.

<!-- CONTEXT -->

- **First (task 001):** set up a Node 24 dev container so the repo runs on Node 24 consistently. This step is done on the host (or wherever the repo is opened).
- **Tasks 002, 003, 004:** do all implementation work **inside the dev container** — e.g. open the project in the container, or stop and restart the editor so it runs in the container; then run commands and edit code there.
- Use **Node.js 24** (Active LTS). Set `engines.node` to `">=24"` in `package.json`.
- Use **TypeScript** with ESM. Use **Fastify** (latest).
- Health endpoint: simple GET route (e.g. `GET /health` or `GET /healthz`) returning 200 and a small JSON body (e.g. `{ "status": "ok" }`) so we can confirm the server is up.
- No database or external deps required for this foundation; focus on runnable server + health check.
- Include an integration test that verifies GET `/health` returns 200 and expected JSON.
