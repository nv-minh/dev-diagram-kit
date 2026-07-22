# BA Conventions

> Common rules for all BA skills (`/brainstorm`, `/urd`, `/brd`, `/prd-epic`, `/srs`, `/usecase`, `/userstory`, `/ac`). Every skill MUST reference this file in Constraints + References.

## 0. Clean docs — no meta-text in templates/docs

- A template contains only **structure** (headings, table frames, placeholders). The generated doc contains only **real business content**.
- Do NOT insert into a template/doc: a blockquote explaining what a section is, a writing formula (e.g. the pitch formula), an ID format, a "How to fill in" block, a "run `/skill-x` to fill" pointer, or cell-format rules. All guidance for the writer lives in SKILL.md (Constraints/Gotchas) or `.claude/rules/`.
- Allowed to keep: data placeholders rendered as blockquotes (`> Scope: {{scope}}`, `> Decided: {{date}} | By: ...`), annotations the **reader** needs to understand the content (reverse-doc's ✅/🔵/🟡 label scale, the roadmap's Now/Next/Later horizon definitions), auto-gen file markers (jira-map "Updated by `/jira`").
- Update mode encountering an old doc that still has meta-text → propose cleanup via an L2 diff, the user decides.

## 1. Author resolution (for the activity log)

> Frontmatter no longer has an `owner` field (removed 2026-07-12) — "who did it" is recorded per-event in the @author column of `docs/_shared/activity.log`.

- Resolve @author from the `user-identity.md` memory (key `current_user`).
- If the memory is empty → read `git config user.name` + `git config user.email` → ask the user to confirm the @handle (e.g. `@edward` from `edward.ngo@example.com`) → save to memory.
- The skill sets the env `CLAUDE_CHANGELOG_AUTHOR` (along with `CLAUDE_SKILL_NAME`, `CLAUDE_CHANGELOG_NOTE`) BEFORE each Write/Edit — the `auto-changelog.sh` hook is the only party that writes the log.
- Old demo docs that still have an `owner` field in frontmatter → keep as-is (legacy), do not add it to new docs.

## 2. No-re-ask rule

- Do NOT re-ask a question the user already answered (same session OR in an existing file).
- Before each question round: scan the idea seed + previous answers + existing doc (continuation/update mode) → drop questions that already have an answer.
- Partial answer → follow up only on the missing part, do NOT re-ask from scratch.
- Continuation/update mode: MUST Read the full file before interviewing, cross-check each planned question against the existing content.

## 3. Altitude framing — a dev doing BA work (choose the detail level for the reader)

The kit serves **devs doing BA work** (writing specs, drawing diagrams, syncing docs) — the user **has a technical background**.

**Allowed to use/ask about technical detail when needed** (and when it serves the output): DB column names, schema/table, service/endpoint, framework, auth strategy, payload, SDK, data types... The dev already has this context (or can read it from the code) → use it to make the diagram/spec **more accurate**, do not shy away.

**But CHOOSE the detail level (altitude) by the reader + diagram type — this is what still matters:**
- A diagram/doc for **business / stakeholder communication** (use case, business activity, C4 **Context**) → plain language, do NOT cram in port/replica/SDK (wrong altitude, not because it is forbidden).
- A **technical** diagram/doc (ERD, DBML, sequence, C4 **Container/Component**, `/scan-project`) → technical detail in the right place is **good** (column types, endpoints, real service names).
- **Do NOT fabricate:** without a source (code/spec/doc), ask or mark it as an assumption — do not invent numbers/real names.

> (The old rule forbade all technical questions, assuming a non-technical BA audience — dropped when the kit shifted to serving devs. Now only the "right altitude" principle remains, no more "no technical detail".)

## 4. Typography by output language

> Applied per the chosen output language (see `language.md`).

**When output is Vietnamese:**
- Do NOT use hard-to-read foreign symbols in prose: `§` (section sign) → use "Mục N", `¶` → "đoạn N".
- `→` only in flow/diagram/table cells; Vietnamese narration should use "sang/đến/dẫn tới".
- Avoid making the doc look like a Western legal/spec document.

**When output is English:** use natural English typography (section refs, `→` in prose OK).

Bold (`**...**`) is used normally in both languages — emphasizing numbers, key terms, closing statements.

## 5. L1 plan preview — readable prose (not a machine log)

An L1 plan preview must use **natural prose** (in the output language), favoring business terms; NO dense tables of tags/flags/checklists like a machine log. Technical terms are fine when needed (the audience is devs) — as long as the preview stays readable, do not turn it into a jargon table.

**Suggested format:**

> I will {create | rewrite} the file `docs/{feature}/{name}.md` with:
>
> **Content added/updated:**
> - {list 4-8 bullets in business terms: "flow / table / illustration / concrete numbers / sample wording"}
> - {concrete business numbers if any}
>
> **Open questions:** {N resolved} settled; {M} left for `/{next-skill}`.
>
> **Logged:** activity log "{note}".
>
> Apply? (Y / edit)

**Avoid in L1:**
- The table `# | path | action | summary` (machine-log style) — use prose instead.
- Dry tag flags: `has_external_redirect=Y`, `Quality checklist: 9/11`, `Mandatory artifacts ✓`.

**KEEP:** concrete business numbers (lockout after 5 attempts, 24h link) — that is business content.

## 6. Depth of the "Description" column in screen-description tables

> Applies to `/wireframe-ascii`, `/wireframe-html`, `/prototype-html` — the 5-column table `# | Items | Control type | Data type | Description`. The Description column must NOT be shallow ("• Required. Validate email"). It must be enough for a BA/dev/QC to actually use.

**Sources to draw descriptions from (in priority order, do NOT fabricate):** `srs/{feature}-spec.md` (FR/BR/NFR/Error Matrix) → use case `uc-*.md` (branches) → brainstorm/URD/PRD. Pull real numbers + ID codes + wording from these.

**6 information layers per element** (fill whichever layers apply — a simple element like a link needs only 1-2 layers):

1. **Business purpose** — what this field/button is for (business meaning), 1 sentence.
2. **Validation / constraints** — required/optional, specific rules (cite BR-xxx), default, placeholder. State what does NOT apply too (e.g. "login does not validate password policy, only matches").
3. **States** — default / focus / disabled / submitting / error / success (list only the states the element actually has).
4. **Navigation** — which screen a click/submit goes to, enable/disable conditions.
5. **Error + wording** — code `E-{feature}-NNN` + exact wording + consequence (e.g. "increments the fail counter +1" / "does NOT count toward the fail counter").
6. **Edge / security / compliance** — anti-enumeration, audit log, network errors, auto-link, fallback, PDPA... when applicable (cite NFR-xxx).

**Concise — NO needless verbosity:** keep all 6 layers but with terse wording; do NOT repeat an ID code many times once it is clear; merge same-type branches. Goal: reading one row fully explains one element, WITHOUT jumping across files.

**Missing business source (haven't run `/srs`):** do NOT fabricate validation/error/numbers. **Ask the user to fill in** the missing points (one field at a time, per the no-re-ask rule) — e.g. "Password field: length rule + allowed charset?", "Submit button: fail cases + messages?". If the user says "skip" → record a shallow level + clearly mark where filling-in is needed, do NOT block progress.

## 7. Confirm device size BEFORE drawing a wireframe/prototype

> Applies to `/wireframe-ascii`, `/wireframe-html`, `/prototype-html`. The device size (mobile 375 / tablet 768 / desktop 1024 / responsive) determines the frame width + how the layout is arranged — it is a **design decision**, and must NOT be guessed silently (in the spirit of `approval-gate.md`: do not auto-pick even when it "seems obvious").

- **Always ask the user for the device** at the start of the skill (before drawing), via AskUserQuestion with 4 options: Mobile 375 / Tablet 768 / Desktop 1024 / Responsive.
- **Pre-suggest one device** so the user only has to confirm quickly: prefer the `primary_device` frontmatter in `srs/{feature}-userflow.md`; if missing, infer from `docs/design.md` (Breakpoints / Max content width). Put the suggested option first + note "(suggested — from {source})".
- **Do NOT infer a device and draw immediately** — even when design.md is clear. Inference is only for *suggesting*, not for *deciding on your own*.
- User settles on a device but `userflow.md` has no `primary_device` → suggest writing it back into the userflow frontmatter (single-source, so `/wireframe-html` + `/prototype-html` + future runs share it, no re-asking — no-re-ask).
- `responsive` is used only when the user explicitly chooses it AND the renderer actually produces multiple breakpoints; do NOT slap on an empty responsive label.

## 8. One screen = one state at one point in time; forms do not span full width

> Applies to `/wireframe-ascii`, `/wireframe-html`, `/prototype-html`.

- **Mutually exclusive states → split into separate screens, do NOT cram into one frame.** If a screen has ≥2 outcomes where only one shows depending on a condition (e.g. verify-result: success / expired; payment-result: success / fail; OTP: entry / expired) → render **one screen per state** (slug `{screen}-{state}`, e.g. `verify-email-success` + `verify-email-expired`). Do NOT draw 2 blocks side-by-side in one frame (misread as "the screen has both"). Share one frame only when the parts **appear simultaneously**. If the userflow lumps them together → propose splitting + ask the user.
- **Form/auth/dialog do NOT span the full desktop frame.** Form content (login/signup/forgot/modal) must sit in **a narrow centered box** (~380-460px), with inputs/buttons full-width WITHIN that box — do NOT stretch to the full 1024px (looks wrong, unlike a real screen). HTML: `<div class="wf-form">`. ASCII: draw a narrow centered form frame inside the wide device frame, do NOT let fields touch both edges. Full-content screens (dashboard/list/table) stretch out fully, no box needed.
