<!--
REFERENCE for /usecase — simulated session (atlas-re).
Full artifact: example/atlas-re/usecases/uc-approve-claim.md
-->

## Command

```
/usecase atlas-re "approver decides a validated claim"
```

**Mode:** downstream (SRS present — extensions cite E- codes).

## Interview

**Skill asks:** primary actor · trigger · preconditions · main success steps · failure branches at each step?

**You answer:** Approver · VALIDATED claim in tier queue · claim VALIDATED, tier covers amount · open → review → decide → record → notify handler · block if validator=approver (E-001) · concurrent decision (E-004) · notify failure (E-003).

## L1 plan preview

```
[/usecase] Will perform:
  1 | docs/atlas-re/usecases/uc-approve-claim.md        | create | MSS 5 steps, 3 extensions
  2 | docs/atlas-re/usecases/atlas-re-usecase-index.md | update | traceability matrix row

Apply? (Y / edit):
```

## Output excerpt

```markdown
## Extensions

- 3a. Approver is the user who validated this claim → system blocks… (E-atlas-re-001).
- 3b. Another approver decided concurrently → first commit wins… (E-atlas-re-004).
```

## Output report

```
✅ Use case written: uc-approve-claim.md + index updated
   UC-approve-claim ↔ FR-atlas-re-006, FR-atlas-re-007 | doc-validate: OK
```
