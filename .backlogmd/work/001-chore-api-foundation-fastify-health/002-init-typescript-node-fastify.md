<!-- METADATA -->

```yaml
task: Initialize TypeScript Node project with Fastify and Node 24
status: done
priority: 20
dep: ["work/001-chore-api-foundation-fastify-health/001-setup-node-24-dev-container.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

**Do this work inside the dev container.** Create a new **TypeScript** Node.js project that uses the latest Fastify and targets **Node 24** (Active LTS). Add `package.json` with `engines.node` set to `">=24"`, install Fastify and TypeScript (plus types), set up `tsconfig.json` for ESM, and add a run script. No server routes yet.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `package.json` exists with `engines.node` set to `">=24"` (Node 24)
- [x] Project is **TypeScript** (TypeScript and relevant types installed; `tsconfig.json` present, ESM output)
- [x] Fastify is installed (latest)
- [x] Project runs (e.g. empty Fastify app listens on a port; `npm run dev` or `start` script present)
