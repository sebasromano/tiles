<!-- METADATA -->

```yaml
task: Add validation for pageSize and cursor
status: done
priority: 30
dep: ["work/005-feat-cursor-based-pagination/002-add-paginated-types.md"]
assignee: ""
requiresHumanReview: false
expiresAt: null
```

<!-- DESCRIPTION -->

## Description

Add validation logic for `pageSize` and `cursor` in `validation.ts`.

- `pageSize`: optional, must be a positive integer between 1 and `MAX_PAGE_SIZE` (100000). Defaults to `DEFAULT_PAGE_SIZE` (10000) when not provided.
- `cursor`: optional. When provided, must be a valid base64url string that decodes to JSON with `jobId`, `pageToken`, `location`, `projectId`, and `pageSize`.
- Initial request validation: require `tableFqn`; validate optional `geoColumn`.
- Follow-up request validation: require only `cursor`; if query-defining params are supplied together with `cursor`, handle them consistently (prefer rejecting them to keep the contract explicit).

The validated command should distinguish:
- initial query execution (`tableFqn`, `geoColumn`, `pageSize`)
- follow-up page retrieval (`cursor` payload)

<!-- ACCEPTANCE -->

## Acceptance criteria

- [x] `pageSize` validated as positive integer within bounds
- [x] Default `pageSize` applied when not provided
- [x] `cursor` decoded from base64url JSON into a validated cursor payload
- [x] Invalid cursor (bad base64url, invalid JSON, missing fields, invalid `pageSize`) rejected
- [x] Initial requests require `tableFqn`; follow-up requests work with cursor only
- [x] Mixed cursor + query-definition inputs are handled consistently by validation
- [x] Validation errors return structured error responses
