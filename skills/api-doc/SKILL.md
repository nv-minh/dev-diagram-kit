---
name: api-doc
description: Use when the provider is chosen and you need to digest THEIR contract (endpoints, auth, webhooks, rate limits, errors) into an internal summary — written to integration/api-summary.md (or api-summary-{provider}.md for multi-partner). Trigger with `/api-doc <feature> [--provider <name>] <openapi-or-docs-source>`. Source-driven — refuses to fabricate a contract. Step [1] of the API chain. Differs from `/api-design` (how WE orchestrate; this is what THEY offer).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "<feature> [--provider <name>] <source>"
---

# /api-doc — Digest the 3rd-party contract (API chain [1])

## Goal

Read the provider's OpenAPI/spec/docs and write an internal summary of what THEY actually offer — endpoints, auth model, webhooks, rate limits, error responses — each with provenance (which spec page / version). **Single output**: `docs/{feature}/integration/api-summary.md`, or `api-summary-{provider}.md` for multi-partner (`api-integration.md` provider-suffix rule). Consumed by `/api-design`.

## Constraints

- **Step [1], never skip** (`api-integration.md`): the design can't be sound without the real contract. **Refuses to fabricate** — no source provided → ask for it; never invent an endpoint, an auth flow, or a rate limit.
- **Group A-variant\*** (`feature-bootstrap.md`): source-driven like `/reverse-doc` — needs the provider docs (a URL, an OpenAPI file, a PDF); refuses to invent a contract from a description alone.
- **Provenance on every row** — endpoint / auth / webhook / limit cites the spec page or version it came from; a row with no provenance is a guess.
- **Unknowns → OQ** — the spec doesn't say X → OQ, never a confident entry. (Same discipline as `/reverse-doc`'s confidence markers.)
- **Multi-provider** — one summary file per provider; the design + map stay single.
- **Bilingual (mirror input — @../../rules/language.md)**. **Idempotent** — re-run when the provider bumps their spec → L2 diff.
- **Template** — `@../../templates/doc-api-summary.md`.
- **Validate before done** — doc-validate (step 8).

## Inputs

```
/api-doc <feature> --provider catmodel ./legacy/cat-model-openapi.yaml
/api-doc <feature> https://provider.example.com/docs/openapi.json
/api-doc <feature> ./provider-api-guide.pdf
```

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Existing summaries: !`ls docs/*/integration/api-summary*.md 2>/dev/null | head -10`

## Approach

1. **Read the source** — OpenAPI (parse endpoints/schemas/auth), a docs URL (fetch + extract), or a PDF (extract). Note the spec version + date.
2. **Extract** — endpoints (method/path/purpose), auth model, webhooks (if any), rate limits, pagination, error response shape.
3. **Provenance + gaps** — every entry cites its source; anything absent from the spec → OQ (e.g. "rate limit not documented → OQ: ask provider").
4. **Draft** the summary per the template — sections per concern, each row provenance-tagged, an OQ section for the gaps.
5. **L1 plan preview** — endpoint count + auth model + webhook presence + provenance coverage + gap count.
6. **Write.** **Activity log** — `CLAUDE_SKILL_NAME=/api-doc` + note + author.
7. **If a section can't be sourced** → OQ, never a guess; HARD STOP only if the whole contract is missing.
8. **Validate (MANDATORY)** — `bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/tsrun.sh" scripts/doc-validate.ts docs/{feature}/integration/api-summary*.md`. Exit 1 → fix, ≤2 attempts.
9. **Output report** — coverage + gaps + next (`/api-design`).

## L1 plan preview

> I'll write the {provider} contract summary to `integration/api-summary{-provider}.md`: **{E} endpoints**, auth {model}, webhooks {yes/no}, rate limit {value or OQ}.
> Provenance: spec v{ver} ({date}). Gaps → OQs: {m}.
> Apply? (Y / edit)

## Output report

```
✅ Contract summary written: integration/api-summary{-provider}.md ({provider}, spec v{ver})
   Endpoints: {E} | Auth: {model} | Webhooks: {yes/no} | OQs (undocumented): {m}

Next: /api-design {feature} — the Integration Blueprint (orchestration/webhook/retry).
```

## Gotchas

- **The source is the truth** — if your summary and the spec disagree, the spec wins; fix the summary.
- **Undocumented ≠ absent** — a rate limit the spec doesn't state is an OQ to confirm with the provider, not an assumption of "unlimited".
- **Version matters** — record the spec version; a v2→v3 bump can break the design silently.
- **Don't design here** — orchestration/retry/degraded-UX belong to `/api-design`; this skill is the faithful digest.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/doc-selection.md
- @../../rules/api-integration.md
- @../../rules/feature-bootstrap.md
- @../../rules/resolve-oqs.md
- @../../rules/language.md
- @../../templates/doc-api-summary.md
- @../../scripts/doc-validate.ts (validate after Write — step 8)
