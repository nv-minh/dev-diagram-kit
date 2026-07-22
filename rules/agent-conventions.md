---
paths:
  - ".claude/agents/**"
---

# Agent Conventions

> Patterns for review agents in the vault. Every agent at `.claude/agents/<name>.md` follows these rules.

## Agent file structure

```yaml
---
name: senior-ba
description: 1-line summary of agent's expertise and when to use
expertise: [completeness, edge-cases, requirement-clarity]
review_targets: [srs, urd, brd, prd, srs-flows, srs-screen, brainstorm, user-story, use-case]
output_format: structured-findings-v1
---

# {Persona name}

> {Persona definition: 1 paragraph establishing voice, experience, perspective.}

## Review approach

{Bullet list HOW agent reviews — scan first, mid, last.}

## Severity rubric

{Definitions BLOCKING / WARNING / SUGGESTION specific to this agent's domain.}

## Common findings

{Typical issues agent flags — checklist style.}

## What NOT to flag

{Out-of-scope domains; explicit to prevent overlap with other agents.}

## Output format

Follow [review-format.md](./review-format.md) v1 strictly.

## Reference materials

When reviewing, agent reads:
- Target doc (provided by orchestrator)
- @.claude/rules/{relevant-rule}.md
- @docs/{feature}/... (runtime resolved by /review skill — placeholder `{feature}` replaced by target's frontmatter feature value)
```

## Roles + review_targets

| Role | `name` | Phase | Domain |
|------|--------|-------|--------|
| Senior BA | `senior-ba` | 4 | Completeness, edge cases, requirement clarity |
| Product Owner | `po-reviewer` | 4 | Business value, scope creep, prioritization |
| Product Manager | `pm-reviewer` | 4 | Cross-feature consistency, dependencies, timeline |
| UI/UX | `uxui-reviewer` | 4 | Screen flows, states (loading/empty/error), consistency |
| QA | `qa-reviewer` | 4 | AC testability, missing test cases, coverage |
| Tech | `tech-reviewer` | 4 | Feasibility, performance, security implications |
| Change Tracker | `change-tracker` | 6 | Impact analysis for /cr |
| Gap Analyst | `gap-analyst` | 6 | Traceability, orphaned reqs, stale chain |

## Path conventions (placeholder resolution)

Agent reference materials use the `{feature}` path placeholder — resolved by the `/review` skill when spawning an agent:

- `@docs/{feature}/{feature}-urd.md` → resolves to target doc's `feature` frontmatter value.
- `@docs/_shared/...` → no resolution, project-level shared.

Agent MUST NOT hardcode the feature slug (e.g. `@docs/payment/payment-urd.md`) — always use the placeholder.

If the target has no `feature:` frontmatter, `/review` skips that reference or prompts the user to pick a feature context.

## Guidelines

- **One agent = one persona.** Don't merge senior-ba + qa — different thinking.
- **Agents critique, don't write content.** Don't propose new sections; only propose edits to specific lines.
- **Stay in-scope.** Senior BA doesn't flag tech feasibility — that's the tech-reviewer's job.
- **No double-counting.** If a BLOCKING exists, don't repeat it as WARNING. Pick the highest severity.
- **Findings atomic.** Each finding = 1 thing, 1 suggested fix. Split compound findings.
- **Agent MUST NOT use the Edit tool directly.** The `/review` orchestrator applies the fixes the user accepts.
- **Stale chain awareness** (Phase 6+): agents should check the target's `status: stale` and `docs/_shared/staleness.log` to flag cascades.
