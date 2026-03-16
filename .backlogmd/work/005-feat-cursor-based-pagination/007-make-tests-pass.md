<!-- METADATA -->

```yaml
task: Make all failing tests pass
status: done
priority: 70
dep: ["work/005-feat-cursor-based-pagination/006-update-route-handler.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

With all layers implemented, verify that every failing test from task 001 now passes. Fix any regressions in existing tests caused by the pagination changes (for example response shape changes or the first-request vs follow-up-request contract).

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] All new pagination tests pass
- [x] All pre-existing tests pass (no regressions)
- [x] `vitest run` exits cleanly
