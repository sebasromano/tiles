<!-- METADATA -->

```yaml
task: Set up Node 24 dev container
status: done
priority: 10
dep: []
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Add a dev container configuration so the project runs in a **Node 24** environment (e.g. VS Code Dev Containers / Docker). This ensures everyone uses Node 24.

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] Dev container config present (e.g. `.devcontainer/devcontainer.json`) using a Node 24 image or feature
- [x] Opening the project in a dev container yields Node 24 (e.g. `node -v` shows v24.x)
