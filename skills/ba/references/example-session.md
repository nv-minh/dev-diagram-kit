<!--
REFERENCE for /ba — router simulated sessions (atlas-re domain).
-->

## Example A — vague request → SRS

**Command:** `/ba "spec out exactly what the refund system must do for atlas-re"`

**Skill (1 line, then runs):**

```
→ /srs atlas-re (because you need system-shall precision — FR/NFR/BR/E-)
```

No clarifying questions — altitude is unambiguous.

---

## Example B — ambiguous "PRD"

**Command:** `/ba "write the PRD"`

**Skill asks (Q2 scope):** Whole product or one feature?

**You:** One feature — claim approval on atlas-re.

**Skill:**

```
→ /prd-epic atlas-re (feature altitude, not product singleton)
```

---

## Example C — visual need → diagram router

**Command:** `/ba "show how the login flow works"`

**Skill:**

```
→ /diagram "login flow" (visual need — hands off to diagram router, not a document skill)
```

---

## Example D — spec slice from existing SRS

**Command:** `/ba "user stories for claim approval"`

**Skill reads:** `docs/atlas-re/srs/atlas-re-spec.md` exists.

```
→ /userstory atlas-re (needs SRS — present ✓)
```

If SRS were missing, the skill would route to `/srs atlas-re` first with a one-line explanation.
