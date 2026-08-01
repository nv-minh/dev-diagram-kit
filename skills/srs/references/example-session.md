<!--
REFERENCE for /srs — simulated session (atlas-re).
Full artifact: example/atlas-re/srs/atlas-re-spec.md
-->

## Command

```
/srs atlas-re
```

## Interview (batched)

**Skill asks:** actors + boundary · per P0 capability: trigger, observable outcome, failure modes, rules touched.

**You answer (condensed):** Claims handler, Finance analyst, Approver, Underwriter, Notification service. Workflow FILED→VALIDATED→APPROVED/REJECTED→PAID. Failures: validator tries to approve (block); missing FX rate (tier pending); concurrent approve (first wins); notify publish fails (decision stands, retry).

## L1 plan preview

```
[/srs] Will perform:
  1 | docs/atlas-re/srs/atlas-re-spec.md | create | 8 FR, 3 NFR, 3 BR, 4 E- rows

Apply? (Y / edit):
```

**You:** `Y`

## Output excerpt

```markdown
| ID | Requirement | Covers | Priority | Source |
|---|---|---|---|---|
| FR-atlas-re-006 | The system shall route the approval task to the tier derived from the claim amount in USD at filing-date rate (≤50k handler, ≤250k manager, above committee) when a claim reaches VALIDATED | CAP-atlas-re-04 | P0 | BRD rule 1 |

| ID | Condition | System behavior | User sees | Related FR |
|---|---|---|---|---|
| E-atlas-re-001 | Approval submitted by the claim's validator | Transition blocked | "Validator and approver must differ" | FR-atlas-re-007 |
```

## Output report

```
✅ SRS written: docs/atlas-re/srs/atlas-re-spec.md
   FR: 8 | NFR: 3 | BR: 3 | E-: 4 | doc-validate: OK

Diagram menu offered:
  → /sequence (flows)  → /state (lifecycle)  → /erd (data model)
  → /user-flow (screens, prerequisite for wireframes)
```
