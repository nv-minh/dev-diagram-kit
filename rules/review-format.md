---
paths:
  - ".claude/agents/**"
  - ".claude/skills/review/**"
---

# Review Finding Format

> Structure for all agent review outputs. The `/review` skill parses this format to aggregate findings across agents.

## Severity levels

| Severity | Meaning | Effect on doc status |
|----------|---------|----------------------|
| `BLOCKING` | Must fix before approval. Doc cannot proceed. | Status → `revisions` |
| `WARNING` | Should fix. Approval possible with explicit ack. | Status stays `in-review`, ack note |
| `SUGGESTION` | Nice-to-have. Approval not blocked. | Status unchanged |

## Verdict semantics

| Verdict | When |
|---------|------|
| `approve` | Zero BLOCKING + zero WARNING (or all WARNINGs explicitly acknowledged) |
| `revise` | ≥1 WARNING, no BLOCKING |
| `block` | ≥1 BLOCKING |

## Finding anatomy

Each finding has:

- **Title** — 5-10 word descriptor
- **Description** — what's wrong, why it matters (1-3 sentences)
- **Location** — section reference if specific (`Section 4 Pre-conditions`, `screens/login.md Section 2.3`)
- **Suggested fix** — concrete next action (1-2 sentences)

## Aggregation rules (used by /review skill)

When multiple agents review the same doc:

1. **Deduplicate** — the same finding from different agents counts once. Keep the most detailed version.
2. **Severity escalation** — 2+ agents flag the same issue at WARNING → promote to BLOCKING (consensus signals a real problem).
3. **Severity ceiling** — final verdict = highest severity from any agent.
4. **Conflict** — Agent A approve, Agent B block → surface as a conflict, user decides; no auto-resolve.

## Example output (1 agent)

```markdown
## Review by senior-ba

**Verdict:** revise

**Summary:** Spec is solid overall but missing rate-limiting consideration and 1 ambiguous actor responsibility.

### [BLOCKING]
- **Missing actor: rate limiter**: Section 2 lists User, Backend, DB but FR-payment-001 says "limit 10 attempts/hour" — who enforces it? Suggested fix: Add Rate Limiter as a system actor in Section 2 or clarify in Section 6 that Backend handles it.

### [WARNING]
- **Ambiguous error E-payment-002**: Description says "user gets error" but doesn't specify which screen shows it. Suggested fix: Link the error to a specific screen state in Section 5 Error Matrix.

### [SUGGESTION]
- **Open question stale**: OQ-2 added 2 weeks ago, not updated. Suggested fix: ping the owner or escalate.
```

## Output location

The `/review` skill aggregates findings, presents them to the user, and applies accepted fixes. The review event is logged to `docs/_shared/activity.log` (write nothing into the doc — set the env note before editing, the hook handles it):

```
2026-05-12 | /review | @edward | docs/payment/srs/payment-spec.md | reviewed by @senior-ba, @qa-reviewer: 1 blocking applied, 2 warnings ack
```

## Tools agent CAN'T use directly

Agents read the target doc + reference rules/templates. Agents do NOT:

- Edit files (the orchestrator `/review` skill does, after the user accepts findings).
- Spawn other agents (avoid recursive loops).
- Run bash commands for system state (rely on context).

Keep agents fast + deterministic.

## Extensions (Phase 6 agents)

`@change-tracker` adds 2 optional sections:

```markdown
### Impacted artifacts
| Path | Impact type | Severity | Recommended action |

### Non-impacted artifacts (extension)
- {path}: {why not impacted}

### Apply order (extension)
1. {first doc/action}
2. {second doc/action}
```

The `/cr` analyze phase parses all 3 sections (severity findings + impacted artifacts + apply order) to build the impact report.
