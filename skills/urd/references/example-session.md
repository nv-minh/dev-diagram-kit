<!--
REFERENCE for /urd — simulated session (atlas-re).
Full artifact: example/atlas-re/atlas-re-urd.md
-->

## Command

```
/urd atlas-re
```

**Skill reads:** `docs/atlas-re/brainstorms/claim-approval-idea.md` (inherits OQ-2).

## Interview

**Skill asks:**

1. Confirm personas — claims handler, Finance analyst, underwriter, Head of Claims, auditor?
2. Where/when do they use this (device, frequency, peak load)?
3. One need statement per persona — what must they be able to do?

**You answer:**

1. Yes, those five. Auditor is secondary (audit trail, not daily user).
2. Office web app, daily for handlers; Finance twice daily; underwriters only from notifications. Peak after catastrophe events.
3. Handler: see state + history in one place; know whose action it's waiting on. Finance: prioritized validation queue with context. Underwriter: same-day large-claim alert. Head of Claims: sub-threshold claims decided without them. Auditor: reconstruct decisions from the system alone.

## L1 plan preview

```
[/urd] Will perform:
  1 | docs/atlas-re/atlas-re-urd.md | create | 4 personas, 6 UN- IDs, inherits brainstorm OQ-2

Apply? (Y / edit):
```

**You:** `Y`

## Output excerpt

```markdown
| ID | Persona | Need statement | Priority | Source |
|---|---|---|---|---|
| UN-atlas-re-001 | Claims handler | See every claim's current state and history in one place | P0 | brainstorm §2 |
| UN-atlas-re-005 | Head of Claims | Have claims below my authority threshold decided without me | P0 | brainstorm §5 |
```

## Output report

```
✅ URD written: docs/atlas-re/atlas-re-urd.md
   Personas: 4 | Needs: UN-atlas-re-001…006 | OQs inherited: 1
   doc-validate: OK

Next: /brd atlas-re
```
