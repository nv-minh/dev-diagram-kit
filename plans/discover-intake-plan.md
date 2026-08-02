# Plan: `/discover` — project intake → domain harness (v2, research-revised)

> **Revision note (2026-08-02).** v1 of this plan was sound on *where the slot is* and *how to register a skill*, but it bet the whole design on an assumption the current evidence contradicts: that dumping a repository-overview brief into every skill's context makes output more accurate. The strongest study available says the opposite. v2 keeps the skill, keeps the HARD STOP, keeps the provenance model — and **inverts what goes in the artifact and how it is loaded**. Changes are marked **[v2]** with the evidence behind them.

---

## 0. What the research says (read this before implementing)

Five findings drive every change in v2.

| # | Finding | Source | Consequence for this plan |
|---|---|---|---|
| **F1** | Repository-level context files **do not generally improve** coding-agent success rates; they add **>20% inference cost** and **2.45–3.92 extra reasoning steps** per task. Tested on Claude Sonnet 4.5, GPT-5.2/5.1-mini, Qwen3 with both human- and LLM-written files. Crucially: **generic "repository overview" content — the kind model providers recommend — was specifically found unhelpful.** Only *explicit, non-standard-practice* instructions were reliably followed. Human-written beat LLM-generated (~4pp) but still didn't clear the cost. | Gloaguen et al., *Evaluating AGENTS.md*, arXiv:2602.11988 (Feb 2026) | **Kills v1's §"The artifact" as written.** Sections "stack / core entities / services / interactions" *are* repository overview. Must be cut down or demoted. See **[v2-A]**, **[v2-C]**. |
| **F2** | Compressing 40KB of docs into an **8KB index of pointers** (not the content) hit a 100% pass rate; shipping the content itself, or as skills, gave **zero improvement** (skills weren't even invoked in 56% of cases). | Vercel, *AGENTS.md outperforms skills in our agent evals* | Artifact should be an **index + the non-derivable bits**, not a brief containing everything. **[v2-A]** |
| **F3** | "Good context engineering means finding the **smallest possible set of high-signal tokens**." Prefer **just-in-time retrieval** (agent holds lightweight references, loads on demand via tools) over pre-loading. Context rot is a gradient — accuracy degrades with length well below the window limit. | Anthropic, *Effective context engineering for AI agents*; Chroma context-rot research | The v1 mechanism — one identical `cat` line in ~35 skills — is precisely the pre-load anti-pattern. Replace with two tiers. **[v2-B]** |
| **F4** | **"A stale AGENTS.md can be worse than no file at all"** — a stale file makes the coding agent *and* the AI reviewer confidently wrong together, producing plausible PRs that pass review. Cloudflare auto-generates from ground-truth signals, detects drift **at merge time**, and keeps files lean. Separately: 28.9% of popular GitHub repos document a symbol that no longer exists; the average stale reference had been wrong **4.7 years**. | Cloudflare internal AI engineering stack; Dosu; Wen et al., *Empirical Software Engineering* (2024) | Staleness cannot be a `/dashboard` footnote. It must be enforced **at the loader**. **[v2-D]** |
| **F5** | Kiro solves "don't load everything always" with **inclusion modes** in frontmatter (`always` / `fileMatch` + glob / `manual` via `#name` / `auto` by description) and splits steering into three differently-scoped files (`product.md`, `tech.md`, `structure.md`) rather than one blob. Spec Kit caps `/clarify` at **5 questions, asked one at a time**, each with a *Recommended* option, written back to the spec **atomically after each answer**. | kiro.dev/docs/steering, kiro.dev/docs/specs; github/spec-kit `templates/commands/clarify.md` | Adopt both: tiered files **[v2-A]** and a bounded interview protocol **[v2-F]**. |

**Two things v1 got right that no researched tool does better, keep them:**

- **Confidence (✅/🔵/🟡) + `file:line` provenance on every claim.** Neither Kiro steering nor spec-kit constitution carries provenance. This is the kit's genuine edge — it is *also* the mitigation for F1/F4, because a reader (human or agent) can tell what to trust. Do not drop it to save lines.
- **The HARD STOP.** F1 found human-written files beat LLM-generated ones. The HARD STOP is exactly what converts a generated scan into a human-endorsed artifact. It is load-bearing, not ceremony.

**Honest framing of the bet.** The best available evidence is *skeptical* of this whole category. The defensible position is not "context files help" — it is "**the specific slice that code cannot re-derive** helps, if it is small, fresh, and provenance-tagged." Everything in v2 follows from that sentence. §9 makes it falsifiable instead of a matter of faith.

---

## 1. Context (unchanged from v1 — still valid)

The kit is a set of generic, domain-agnostic skills: running `/srs` or `/sequence` in a repo re-derives the domain from scratch each time. A one-time intake that learns the repo, then feeds later skills, is worth doing. Three clinchers:

1. **`/discover` is a ghost skill.** `rules/feature-bootstrap.md` (Group C) already lists and describes `/discover` as *"Greenfield exploration"*, but `skills/discover/` does not exist. This plan fills that exact slot.
2. **`DOMAIN.md` is a proven precedent.** `example/atlas-re/DOMAIN.md` (91 lines) is a hand-written domain model that every atlas-re diagram draws from. The concept works — it was never formalized, and no skill reads it.
3. **Consumption is cheap.** 61/63 skills already have a `## Context (dynamic)` block of `!\`shell\`` lines. *(v2 caveat: cheap to add ≠ free to load — see F1/F3. Cheapness of the mechanism was v1's reason for using it everywhere; that reasoning does not survive the evidence.)*

**User decisions (locked):** name `/discover`; aggressive code scan; artifact under `docs/_shared/` only (**no CLAUDE.md touch**); full scope.

**Intended outcome (v2 wording):** running `/discover` once produces a small, fresh, provenance-tagged **context index** plus on-demand detail files. Consuming skills get the *non-derivable* domain facts (business purpose, glossary, rules, actors) cheaply, and pull depth only when the task needs it — so they stop re-asking and stop inventing names, without paying a context tax on every invocation.

---

## 2. What `/discover` is

A **Group C project-level skill** (no feature needed; primary case is an empty vault). Deep-scans the repo + interviews for the business side, then writes the context set under `docs/_shared/`. The formalized version of the manual `DOMAIN.md` practice.

**Overlap resolution with `/scan-project` (unchanged, still correct):** `/discover` becomes the **single deep scanner**; `/scan-project` is refactored to **consume** the profile when present and delta-scan only what's missing. One scan, one source of truth.

---

## 3. The artifact — **[v2-A] tiered, not one blob**

v1 proposed a single `docs/_shared/project-context.md`, ≤150 lines, 9 sections, loaded everywhere. v2 splits it by *how derivable the content is* and *how often it's needed*, mirroring Kiro's three-file split (F5) and Vercel's index finding (F2).

```
docs/_shared/
├── project-context.md          ← Tier 1: ALWAYS loaded. HARD CAP 60 lines.
└── context/
    ├── glossary.md             ← Tier 2: on demand
    ├── domain-rules.md         ← Tier 2
    ├── actors.md               ← Tier 2
    ├── entities.md             ← Tier 2 (pointer-heavy; defers to /erd output)
    └── architecture.md         ← Tier 2 (pointer-heavy; defers to architecture/)
```

### Tier 1 — `project-context.md` (always loaded, **hard cap 60 lines**)

Rationale for 60: HumanLayer keeps root CLAUDE.md <60 lines; common split threshold is 150–200 lines for a file loaded *once*; this one is loaded across many skills, so it must be tighter. Codex hard-truncates AGENTS.md at 32 KiB — not our binding constraint, attention budget is.

Contents — **only what a grep cannot answer in two seconds**:

1. **What the system does and who pays for it** — 2–3 sentences. Not derivable from code. Highest value line in the file.
2. **Stack one-liner** — `NestJS + Postgres + Redis, pnpm monorepo`. One line, no elaboration. It is derivable, but it's cheap and it anchors terminology.
3. **Actors** — the role names, comma-separated. Detail lives in `context/actors.md`.
4. **Glossary — collisions only.** Terms where the **business word ≠ the code identifier**, or where a common word means something project-specific. `Booking → reservations.tbl_res` is worth a line; `User → users` is not. This mapping is the single most defensible anti-hallucination payload in the whole artifact.
5. **Gotchas** — non-obvious traps, max 5 bullets. F1: *explicit, non-standard-practice instructions* were the only content reliably followed. This section is where F1 says the value actually is.
6. **Pointer index** — one line per Tier-2 file saying what it holds and when to read it. This is the Vercel 8KB-index pattern.

Everything else v1 listed (full entity list with key fields and state machines, service/module responsibilities table, sync/async interaction map) is **demoted to Tier 2 or deleted**, because:
- it is exactly the "repository overview" content F1 found unhelpful;
- `glob`/`grep` re-derive it accurately on demand, and Anthropic explicitly cites that as *bypassing stale-index problems* (F3);
- it is the fastest-rotting content in the file, and F4 says rot is worse than absence.

### Tier 2 — `context/*.md` (on-demand)

No line cap, but each carries the same frontmatter and confidence/provenance discipline. These are what a skill Reads when its specific job needs depth — `/erd` reads `entities.md`, `/system-design` reads `architecture.md`, `/userstory` reads `actors.md` + `domain-rules.md`.

`entities.md` and `architecture.md` should stay **pointer-heavy**: link to `docs/_shared/architecture/*-erd.d2` and the architecture index rather than duplicating them. Duplicated structure is drift waiting to happen (F4).

### Frontmatter (Tier 1 and Tier 2 alike) — **[v2-E]**

```yaml
---
type: project-context          # or project-context-detail for Tier 2
status: approved               # draft → in-review → approved
version: 1.2.0                 # semver; MAJOR = domain understanding changed
updated: 2026-08-02
profile_hash: <sha of scanned inputs>
source_watermark: <git HEAD sha at scan time>
staleness_budget_commits: 200  # loader warns past this — see [v2-D]
human_edited: [glossary, gotchas]   # sections /discover --update MUST NOT overwrite
links: []
---
```

Two v2 additions:

- `staleness_budget_commits` — makes the freshness contract explicit and tunable per repo, rather than a hidden constant.
- `human_edited` — **spec-kit issue #1279/#1027**: `specify init --here --force` silently overwrote hand-amended `constitution.md`, a real, filed, user-hostile bug. Do not reproduce it. Sections listed here are human territory; `--update` may *propose* changes to them in a Sync Impact Report but never rewrites them in place.

**Discipline (kept from v1):** every concrete claim tagged **✅ read / 🔵 inferred / 🟡 guessed** + provenance `file:path` — the model already used by `/scan-project` and `/reverse-doc` per `rules/naming-conventions.md:66`.

---

## 4. The loader — **[v2-B] two tiers, and it must fail loud when stale**

v1's mechanism was one identical line in ~35 skills that `cat`s the whole profile. v2 replaces it with two distinct mechanisms.

### Tier 1 loader (the ~35 skills, pasted verbatim)

```
Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
```

A script, not an inline `cat`, so the staleness logic lives in one place instead of being duplicated 35 times. `scripts/context-load.sh` (new):

1. No `docs/_shared/project-context.md` → print `(no project context — run /discover for more accurate output)` and exit 0.
2. Compute drift: commits between `source_watermark` and current `HEAD`; also re-hash the scanned input set and compare to `profile_hash`.
3. **Fresh** → emit the Tier-1 file verbatim.
4. **Stale** → emit the file **prefixed with a loud banner**:
   `⚠️ PROJECT CONTEXT IS STALE (N commits since scan; manifest changed). Treat every claim below as a HINT, not fact — verify against code before relying on it. Re-run /discover.`

Step 4 is the direct answer to F4. Cloudflare's failure mode was agent and reviewer trusting the same stale file in silence; a banner inside the context window is what breaks that silence. Warning only in `/dashboard` (v1's design) does not, because nobody runs `/dashboard` mid-task.

### Tier 2 loader (only skills that need depth)

Not a Context line — an **instruction** in the skill body:

```markdown
**IMPORTANT:** before drafting, read `docs/_shared/context/entities.md` and
`docs/_shared/context/domain-rules.md` if they exist.
```

The `IMPORTANT:` is not decoration. Practitioner reporting is consistent that without explicit emphasis agents do not proactively read referenced docs — and Vercel's eval found skills went **uninvoked in 56% of cases**. Passive availability is not consumption.

---

## 5. Harness wiring — **[v2-H] pilot 6, then expand on evidence**

v1 wired ~35 skills in one pass. Against F1, a 35-file mechanical edit is a large bet on an unproven mechanism, and it is the hardest part to walk back.

**Wave 1 — pilot (6 skills), covering all three consumption shapes:**

| Skill | Tier | Why it's in the pilot |
|---|---|---|
| `/srs` | 1 + 2 (`glossary`, `domain-rules`, `actors`) | Highest re-ask volume; clearest before/after signal |
| `/userstory` | 1 + 2 (`actors`, `domain-rules`) | Downstream of SRS; tests the chain |
| `/erd` | 1 + 2 (`entities`) | Most identifier-hallucination-prone; glossary should show up here or nowhere |
| `/sequence` | 1 only | Tests whether Tier 1 alone is enough |
| `/ba` (router) | 1 only | Routing quality with domain knowledge present |
| `/scan-project` | consume refactor (§6) | Proves the profile can drive generation, per the `DOMAIN.md` precedent |

**Gate:** run §9's A/B before Wave 2. **Wave 2** = the remaining ~29 skills, but *only those where the pilot shows a mechanism that helps*, and per-skill Tier-2 references chosen deliberately — not a uniform paste.

This also matches Böckeler/Fowler's advice to build rules files up *gradually* rather than front-loading, since model improvements steadily shrink what needs spelling out.

---

## 6. The skill — `skills/discover/SKILL.md`

Frontmatter: `name: discover`, `description` (≤700 chars, embeds trigger + output + "Differs from /scan-project"), `allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task`, `user-invocable: true`, `argument-hint: "[--update] [--tier1-only]"`.

**Phase 1 — scan + plan (ends in HARD STOP).** Manifest sniff (reuse the `/scan-project` one-liner verbatim) → spawn N read-only `Task` subagents by aspect (stack; entities/data model from ORM/migrations/SQL; services/modules; entry points + sync/async; external systems from SDK/env; actors/roles), same prompt template as `/scan-project` (*"Read-only. Scan `<root>` for aspect X. Return: findings table + file:line evidence. Do NOT edit, do NOT draw."*) → ingest README/docs/ADR, code wins on conflict → **interview [v2-F]** → synthesize → write `docs/_shared/.discover-plan.md` → **HARD STOP**, L1 preview, wait for Y.

Subagent isolation is the right call and Anthropic backs it explicitly: sub-agents explore across tens of thousands of tokens and return a 1–2k token distillate, keeping the lead context clean (F3).

### **[v2-F] Interview protocol — bounded, borrowed from spec-kit `/clarify`**

v1 said "interview for what code can't answer" with no bound. Adopt spec-kit's proven shape:

- **Hard cap 5 questions.** More than that and the intake becomes a chore people skip.
- **One at a time**, never batched.
- Each is a **2–5 option table** or a ≤5-word short answer, with the agent naming a **Recommended** option and its rationale before the user answers.
- **Write back incrementally** into `.discover-plan.md` after each answer, atomically — not batched at the end.
- Priority order for the 5 slots, highest-value-non-derivable first: **(1)** business purpose & who pays · **(2)** glossary collisions the scan flagged · **(3)** business rules/invariants not visible in code · **(4)** actor authority in the real world · **(5)** the one gotcha that bites newcomers.

The kit's IT-BA framing (`ba-conventions.md` §3) still applies: business language, no DB/SDK/endpoint questions.

**Phase 2 — generate (after Y).** Write Tier 1 (**enforce the 60-line cap — fail and re-summarize if over**) + Tier 2 files, with confidence + provenance; stamp `profile_hash` + `source_watermark`; run `doc-validate`; activity-log line (`CLAUDE_SKILL_NAME=/discover`).

**Group C empty-vault behavior** (`feature-bootstrap.md`): brand-new repo, no code → Phase 1 is interview-led and still writes a valid Tier 1 (this is the greenfield case the rule already anticipates). Tier 2 files are omitted rather than stubbed empty.

**`--update` mode — [v2-E]:** read existing files fully first, no re-asking answered questions, L2 diff, **never touch sections listed in `human_edited`**, bump `version` per semver, and emit a **Sync Impact Report** (spec-kit's constitution pattern): what changed, what stayed, which consuming skills may need attention.

**`--tier1-only`:** cheap refresh of the always-loaded file without regenerating detail — the common maintenance path.

---

## 7. The rule — `rules/project-context.md` (new)

Documents four things (v1 had three):

1. **The tiered schema** — Tier 1's six sections + hard cap, Tier 2's files, frontmatter, confidence model.
2. **The staleness contract** — `profile_hash` / `source_watermark` / `staleness_budget_commits` and the loader's stale-banner behavior.
3. **The canonical Tier 1 loader line** (verbatim, above) and **the Tier 2 `IMPORTANT:` reference form**.
4. **[v2] The content test** — the rule every author applies before adding a line to Tier 1:
   > **Can `grep` answer this in two seconds? Then it does not belong in Tier 1.**
   > **Is it a business fact, a naming collision, a rule, or a trap? Then it does.**
   >
   > Adapted from the practitioner heuristic — *failure-backed? tool-enforceable? decision-encoding? triggerable? if it fails all four, delete it* — which took an 80-line rules file to 30 lines with dramatically better behavior. This test is what keeps the file under 60 lines *and* on the side of the F1 finding.

Every consuming skill adds `- @../../rules/project-context.md` to its `## References`.

---

## 8. `/scan-project` consume refactor (unchanged from v1 — sound)

Edit `skills/scan-project/SKILL.md` Phase 1:

- **Profile exists and is fresh** → read it as the primary source, delta-scan only 🟡/missing items, generate diagrams from it (exactly how `DOMAIN.md` already drives the atlas-re diagrams).
- **Profile exists but stale** → the loader banner is already in context; treat profile claims as hints and re-verify against code before drawing.
- **No profile** → scan as today (backward compatible; suggest `/discover` in the report).

---

## 9. **[v2-G] Efficacy gate — the part v1 was missing**

v1's verification was entirely lint/typecheck: it proved the skill *installs*, never that it *helps*. Given F1, shipping a 35-skill wiring without measuring is shipping against the best available evidence.

**Add a small A/B, run on the atlas-re example, as a Wave-1 exit gate:**

1. Build `example/atlas-re/_shared/project-context.md` (§10) as the treatment.
2. Pick **5 fixed prompts** across the pilot skills (e.g. `/srs booking-cancellation`, `/erd`, `/userstory`, `/sequence`, a `/ba` routing question).
3. Run each **with** and **without** the context set (toggle by renaming the file).
4. Score on four axes: **(a)** entity/identifier names match `DOMAIN.md` ground truth; **(b)** count of questions re-asking facts already in the profile; **(c)** count of fabricated entities/services; **(d)** tokens consumed.
5. **Pass condition:** (a) and (c) improve, (b) drops, and (d) rises by **<15%** on the Tier-1-only skills. *(F1 measured >20% cost for no gain; a cost rise with no quality gain is a fail, not a wash.)*
6. Record the numbers in `plans/discover-efficacy.md` and cite it in the CHANGELOG entry.

This is cheap — one afternoon on an example vault that already exists — and it converts "we think this helps" into a number. If it fails, the right move is to shrink Tier 1 further (toward glossary + gotchas only), not to wire 29 more skills.

---

## 10. Example — formalize `DOMAIN.md`

Seed `example/atlas-re/_shared/project-context.md` (Tier 1, ≤60 lines) + `example/atlas-re/_shared/context/*.md` (Tier 2) from the existing 91-line `DOMAIN.md`, adding frontmatter and confidence tags. The 91→60 compression is itself a useful proof that the content test in §7 is applicable in practice.

Update `example/atlas-re/README.md` to reference it. **Recommendation:** move `DOMAIN.md`'s content into the context set and delete the duplicate — two files describing one domain is the drift scenario in F4.

---

## 11. Registration surface (from v1 — verified complete, with v2 deltas)

- **`rules/doc-selection.md`** — add `paths: - ".claude/skills/discover/**"` + a **"Project-level / setup"** matrix row + Disambiguation: `/discover` reads the repo for a **portable context brief** other skills consume; `/scan-project` reads code for **architecture diagrams**; `/prd` defines the **product**; `/reverse-doc` reconstructs docs from **legacy sources**.
- **`rules/naming-conventions.md`** — add `project-context` **and [v2] `project-context-detail`** to the Doc-type table; path rows for `docs/_shared/project-context.md` and `docs/_shared/context/*.md`.
- **`scripts/doc-validate.ts` `inferSpec()`** — regex for `docs/_shared/project-context.md` → `{ type: 'project-context', kind: 'shared' }` **and [v2]** `docs/_shared/context/*.md` → `{ type: 'project-context-detail', kind: 'shared' }`. Without this, doc-validate silently skips them.
- **[v2] `scripts/doc-validate.ts`** — add a **60-line cap check** on Tier 1. The cap is the whole design; if it isn't enforced by CI it will be gone within a quarter.
- **[v2] `scripts/context-load.sh`** (new) — the loader; and a `doctor.sh` line reporting profile presence + staleness.
- **`rules/feature-bootstrap.md`** — expand the existing Group C `/discover` ghost entry to *"Greenfield exploration — deep scan + interview → `docs/_shared/project-context.md` (+ `context/`)"*.
- **`skills/ba/SKILL.md`** router — add a `/discover` row keyed on "learn the project / set up context / first time in this repo"; proactive nudge when no profile exists.
- **`templates/doc-project-context.md`** **[v2] + `templates/doc-project-context-detail.md`** — Tier 1 and Tier 2 skeletons.
- **`skills/discover/references/example-session.md`** — worked session, including the 5-question interview.
- **README.md + README.vi.md** — skill-table row; bump **63 → 64** everywhere kit-lint checks (badge, layout) and in the long `description` strings in `package.json` / `plugin.json` / `marketplace.json`.
- **`explain-skills/discover.md` + `.vi.md`** — bilingual deep-dive (parity is lint-enforced).
- **guides + huong-dan** — setup note (run `/discover` first); keep file-count parity.
- **CHANGELOG `[2.7.0]` — Added.** Version trio → 2.7.0. *(Fold onto the next release if 2.6.0 hasn't shipped.)*

---

## 12. Verification

1. `npm run typecheck` — catches `inferSpec()` / kit-lint edits.
2. `npm test` — add a `doc-validate` test for `project-context` + `project-context-detail`; **[v2]** add a test asserting the Tier-1 60-line cap fails a 61-line file; confirm kit-lint clean at 64 skills.
3. `bash scripts/tsrun.sh scripts/kit-lint.ts` — clean.
4. `bash scripts/tsrun.sh scripts/doc-validate.ts example/atlas-re` — validates the new context set.
5. **[v2]** `bash scripts/context-load.sh` unit check — three states: absent → hint message; fresh → verbatim; stale → banner + content.
6. **Spot-check:** run `/discover` on a small repo → confirm Tier 1 ≤60 lines with confidence + provenance + hash; then `/srs <feature>` and confirm the profile is in context and known facts are not re-asked.
7. **[v2] §9 efficacy A/B — a Wave-1 exit gate, not optional.**
8. CI (`.github/workflows/ci.yml`) runs the same gates + diagram drift.

---

## 13. Execution phasing

1. **[v2]** Tiered schema + `rules/project-context.md` (incl. the content test) + both templates + `doc-validate` / `naming-conventions` / `doc-selection` registration + the 60-line cap check.
2. **[v2]** `scripts/context-load.sh` (three states, staleness banner) + `doctor.sh` line.
3. `skills/discover/SKILL.md` + `references/example-session.md` (with the 5-question protocol).
4. Example context set from `DOMAIN.md` (§10) — needed as the A/B fixture.
5. `/scan-project` consume refactor.
6. **[v2]** Wave-1 wiring: 6 pilot skills.
7. **[v2] §9 A/B → gate.**
8. Wave-2 wiring (~29 skills), scoped by what Wave 1 showed.
9. Staleness read in `/dashboard`; README / explain-skills / guides EN+VI; version bump 2.7.0 + CHANGELOG (citing the A/B numbers).

---

## 14. Out of scope / deferred

- **CLAUDE.md** — user locked `docs/_shared` only. *(Tradeoff worth naming: agents outside this kit — Codex, Cursor, plain Claude Code — look at `AGENTS.md`/`CLAUDE.md` and will never find the profile. A **single pointer line**, not content, would fix that at near-zero context cost. Flagging only; respecting the lock.)*
- **A real `staleness.log` hook** — vaporware; the loader + `profile_hash` cover it.
- **`/update-overview`, `/delegate`** — other Group C ghosts; separate work.
- **Auto-trigger in `install.sh`** — the `doctor.sh` nudge (§11) is the cheap version.
- **Per-skill *behavioral* use of the profile** (a skill auto-filling entities) — v1 correctly deferred this. **[v2] Sharpened:** deferring is right, because F1 suggests *availability alone* may do little. §9 is what tells you whether behavioral consumption is where the value actually is. If the A/B is flat, this deferred item is not a nice-to-have — it is the real work.
- **EARS notation for `/srs` acceptance criteria** — adjacent and well-evidenced (Kiro's production pipeline; Rolls-Royce origin; IEEE RE 10-year most-influential paper). Out of scope here, worth its own plan.

---

## Sources

- Gloaguen, Mündler, Müller, Raychev, Vechev — *Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?* — https://arxiv.org/abs/2602.11988
- Anthropic — *Effective context engineering for AI agents* — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Vercel — *AGENTS.md outperforms skills in our agent evals* — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
- Cloudflare — *Internal AI engineering stack* — https://blog.cloudflare.com/internal-ai-engineering-stack/ · commentary: https://dosu.dev/blog/a-stale-agents-md-is-worse-than-no-agents-md
- Kiro — *Steering* https://kiro.dev/docs/steering/ · *Specs* https://kiro.dev/docs/specs/
- GitHub Spec Kit — https://github.com/github/spec-kit (`templates/commands/clarify.md`, `constitution.md`, `analyze.md`; issues #1279, #1027)
- Böckeler / Fowler — *Context Engineering for Coding Agents* — https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
- Chroma — *Context Rot* — https://research.trychroma.com/context-rot
- alexop.dev — *Stop Bloating Your CLAUDE.md* — https://alexop.dev/posts/stop-bloating-your-claude-md-progressive-disclosure-ai-coding-tools/
- Augment Code — *Your agent's context is a junk drawer* — https://www.augmentcode.com/blog/your-agents-context-is-a-junk-drawer
- Mavin — *EARS* — https://alistairmavin.com/ears/
- Wen et al. — outdated documentation prevalence — *Empirical Software Engineering* (2024) — https://link.springer.com/article/10.1007/s10664-023-10397-6
- METR — *Impact of Early-2025 AI on Experienced OSS Developer Productivity* — https://arxiv.org/abs/2507.09089
