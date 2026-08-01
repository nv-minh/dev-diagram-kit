---
name: api-test
description: Use when you need the Bruno collection + test-case table that proves the integration calls actually work — expanding the api-checklist's CHK- rows into runnable requests. Output: test/api/api-tests.md + bruno/ (one collection per provider). Trigger with `/api-test <feature>`. Step [5]; needs the checklist. Migrates legacy test files from integration/ on rerun. Differs from /test-cases (manual QA; this is executable API requests).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature>"
---

# /api-test — Bruno collection + API test table (API chain [5])

## Goal

Expand each `CHK-` in the integration checklist into a Bruno request (`.bru`) + a row in the test table (request summary + expected response: status + the key field to assert). **Outputs**: `docs/{feature}/test/api/api-tests.md` (type `api-tests`) + `docs/{feature}/bruno/` (one collection per provider).

## Constraints

- **Step [5]** (`api-integration.md`): needs `test/api/api-checklist.md`. Checklist missing → refuse + route `/api-checklist`.
- **Back-fill the checklist's `TC` column** — each generated request links back to its `CHK-`.
- **One collection per provider** — mirrors the `api-summary-{provider}.md` split; environment variables for base URL/auth, never hardcode secrets in `.bru`.
- **`.bru` only for automatable rows** — `test_layer: own` rows that test only our code may stay as unit tests outside Bruno; `3rd`/`mixed` rows become Bruno requests hitting the sandbox.
- **Expected = status + key field** — not the whole body; the one field that proves the call (e.g. `200 + response.claim_id`), plus the error-case expectations.
- **No live production calls** — sandbox/test environment only; flag if the only environment is prod.
- **Migration on rerun** — legacy test files still under `integration/` move to `test/api/` (naming-conventions line 60).
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — re-run → new CHK- get new requests; changed endpoints → L2 diff.
- **Template** — `@../../templates/doc-api-tests.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/api-test <feature>          # expand every api-checklist CHK- with no TC yet
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
API checklists (required): !`ls docs/*/test/api/api-checklist.md 2>/dev/null | head -10`
Existing API tests: !`ls docs/*/test/api/api-tests.md docs/*/bruno/ 2>/dev/null | head -10`

## Approach

1. **Gate.** No api-checklist → refuse + route `/api-checklist`. Read it (every `CHK-`, its layer/direction, what it covers) + the summary (request shapes/auth).
2. **Per `CHK-` → a request plan** — method/path, the env vars, the body, the expected status + key assertion field. `own`-only rows → note as unit-test, no `.bru`.
3. **Fact-list** — per request: the endpoint, the assertion, the provider, the env.
4. **Generate Bruno** — one collection per provider; one `.bru` per automatable row; env vars for base URL + auth (placeholders, never secrets).
5. **Draft `api-tests.md`** — the table (CHK · title · `.bru` · method/path · expected status · key assertion · provider).
6. **L1 plan preview** — request count by provider + the assertions + any `own`-row skipped-as-unit.
7. **Write** `api-tests.md` + `bruno/` + back-fill the checklist's `TC` column. Migrate legacy `integration/` test files if present. **Activity log** — `CLAUDE_SKILL_NAME=/api-test` + note + author.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/test/api/api-tests.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — requests generated + next (`/api-readiness`).

## L1 plan preview

> I'll expand **{feature}**'s integration checklist into **{N} Bruno requests** ({per-provider}) + `test/api/api-tests.md`: {per-CHK → request + assertion}.
> `own`-only rows kept as unit tests: {list | none}. Legacy migration: {yes/no}.
> Apply? (Y / edit)

## Output report

```
✅ API tests written: test/api/api-tests.md + bruno/ ({providers} collections, {N} requests)
   Checklist TC column back-filled | doc-validate: OK

Next: /api-readiness {feature} — the go-live gate (needs these results present).
```

## Gotchas

- **Secrets never in `.bru`** — env var placeholders only; a committed token is a security incident.
- **Sandbox ≠ prod behavior** — some providers' sandboxes differ from prod (rate limits, webhook delivery); note where you can't prove prod parity.
- **Don't run against prod** — the skill generates requests; running them against prod from the doc is the user's explicit, careful choice.
- **Assertion economy** — assert the one field that proves success; asserting the whole brittle body makes the test fail on every cosmetic provider change.

## Simulated session

Worked example — user prompts, approval gates, and output excerpts: /example-session.md. Full artifacts: `example/atlas-re/`.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/api-integration.md
- @../../rules/test-conventions.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../templates/doc-api-tests.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
