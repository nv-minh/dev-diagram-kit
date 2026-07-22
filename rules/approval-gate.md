# Approval Gate Convention

> Every skill must follow this rule when writing/editing files. Purpose: a unified human-in-the-loop (HITL) — no skill writes a file without going through approval.

## 3 levels

| Level | Required when | Mechanism |
|-------|--------------|-----------|
| **L1 Plan** | Before any `Write` / `Edit` tool / batch creating ≥1 file | Print the plan table; user confirms Y/n/select |
| **L2 Diff** | When `Edit`-ing an existing file (including when the skill auto-enters update mode because the file already exists, no flag needed) | Show the unified diff; user confirms Y/n/edit-prompt |
| **L3 Iterate** | Creative output: ASCII wireframe, mermaid diagram, prose draft | Render in chat → refine loop; max 3 rounds |

## L1 — Plan preview

**Standard format** (skill prints before writing):

```
[/skill-name] Will perform:
  # | path                              | action  | summary
  1 | docs/payment/payment-urd.md               | create  | URD draft, 3 user types, 5 needs
  2 | docs/payment/payment-brd.md               | create  | BRD draft, 4 objectives, 3 risks
  3 | docs/payment/srs/payment-spec.md          | update  | add 2 FR, fix NFR perf

Apply? (Y/n/select):
```

**User response:**
- `Y` / `<enter>` / `yes` / `ok` → proceed with all.
- `n` / `no` / `abort` → cancel everything, write nothing.
- `select skip 2,3` → run item 1, skip 2 and 3.
- `select only 1` → run only item 1.
- Any other free text → treat as a request to change the plan, skill must re-plan.

**Rules:**
- L1 is **required** even when creating just 1 file.
- Plan table: max 1 line per file. Short summary (≤50 chars).
- A skill MUST NOT skip L1 on the excuse "the user already confirmed in another skill".

## L2 — Diff confirm

**When:** editing an existing file (including when the skill auto-enters update mode because the file exists, or applying a patch in /cr).

**Format:**

```
[/skill-name] Diff for docs/payment/payment-urd.md:

--- a/docs/payment/payment-urd.md
+++ b/docs/payment/payment-urd.md
@@ -12,7 +12,8 @@
 ## 3. User Needs
 
-1. Customer pays in < 30s
+1. Customer pays in < 30s via Momo/VNPay
+2. Can save the card for next time
 
Apply? (Y/n/edit-prompt):
```

**User response:**
- `Y` → apply diff.
- `n` → cancel this edit (keep the old file).
- `edit-prompt: <text>` → go back to the synthesize step with feedback `<text>`, produce a new diff.

**Rules:**
- Diff must be unified format with ≥3 lines of context.
- If the diff > 50 lines: the skill warns "large diff, view full or summary?" before printing.
- L2 runs AFTER L1 (L1 lists path + action `update`; L2 shows the diff only once the user has said Y at L1).

## L3 — Iterate refine

**When:** creative output that **can render in chat** and needs multiple rounds of feedback. Typically:
- ASCII wireframe (`/wireframe-ascii`) — monospace renders OK
- ASCII flow diagram in brainstorm — monospace renders OK
- Long prose draft (e.g. BRD executive summary)

**Do NOT apply L3 to mermaid** (`/sequence`, `/erd`) — chat only prints mermaid source code, it doesn't render the diagram. The user can't review raw text. Mermaid skills go straight to L1 → Write → user reviews from the rendered file (IDE/Obsidian/GitHub preview) → calls the skill again, the skill auto-enters update mode.

**Format:**

```
[/skill-name] Version 1:

<output rendered in chat>

Approve / Revise: <describe changes> / Cancel:
```

**User response:**
- `Approve` / `ok` / `approve` / `Y` → proceed to L1 (plan write).
- `Revise: ...` / free text → skill regenerates v2 with the feedback.
- `Cancel` / `cancel` / `n` → abort.

**Rules:**
- Max 3 iterate rounds. Round 3 (v3) is the forced-finalize round — if the user still says `Revise:`, the skill announces "reached max 3 rounds, finalizing v3 and proceeding to L1; edit the file manually later if needed."
- Number each round clearly: `Version 1`, `Version 2`, `Version 3`.
- L3 runs BEFORE L1.

## Soft gate vs Hard gate

Approval gate ≠ readiness gate. Two different concepts:

| | Approval gate (this rule) | Readiness gate (chain rule) |
|---|---|---|
| What it asks | "Apply these changes?" | "Is there enough upstream to run this skill?" |
| When | Before each write/edit | At skill start, checks prerequisites |
| Default | L1 always runs | **Soft** — warn if missing, still proceed |

Readiness gate examples:
- `/userstory payment` but no `/usecase` yet → warn "No UC yet, running anyway" + proceed.
- `/jira push` but a US has `status: stale` → **refuse** (this is a hard-gate exception, because Jira is an external side-effect).

## Reference in SKILL.md

Every SKILL.md MUST have the line:

```markdown
References:
- @.claude/rules/approval-gate.md
```

And in Processing steps, use the standard phrasing:

```markdown
6. **Approval L1:** print plan preview (see approval-gate.md). User Y → continue.
7. **Approval L2** (if the file already exists — automatic update mode): show diff before writing.
```

## Exception — skills that don't need the approval gate

Only pure read-only skills (no file writes) are exempt:

| Skill | Reason |
|-------|--------|
| `/gap` | Read-only analysis; L1 required for `traceability.md` writes |

> `/dashboard` is NOT exempt — it writes an HTML file so it still goes through L1 (only the data-scan part is read-only).

Every other skill (including `/reverse-doc`, which reconstructs from external sources) must go through L1.

## Sub-agents MUST NOT write target files before approval

There is NO "Write-then-confirm" exception. If a skill uses a Task tool sub-agent to leverage a separate context, the sub-agent must **return proposed content** (not Write the target file itself) — the main thread collects it, shows L1/L2, and only then writes after the user says Y.

Why the "sub-agent writes directly then rolls back if the user declines" model is dropped: rollback is unreliable. `git checkout -- file` returns HEAD (not the state right before the sub-agent) → swallows uncommitted changes; `rm` can't distinguish a just-created file from an existing untracked one; hooks (activity.log/staleness) may already have run irreversible side-effects. Data safety > parallel speed.

`/srs` has moved to this sequential model (L1 before each Write). No skill may write a target file before approval on the excuse of "running sub-agents in parallel".

## Anti-patterns

❌ **DON'T** silently auto-pick a file even if it "seems obvious".
❌ **DON'T** merge L1 + L2 into one prompt ("Create file? Y/n" without showing the diff on update).
❌ **DON'T** use L3 for pure file writes (e.g. `/urd` text — no iterate needed, go straight to L1).
❌ **DON'T** skip L1 when writing just one short file.
❌ **DON'T** use an env var like `CLAUDE_AUTO_APPROVE` or similar to bypass.

## One-line summary

> **L3 (iterate if creative) → L1 (plan + Y/n) → L2 (diff if update) → Write.**
