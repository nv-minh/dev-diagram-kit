# Feature Bootstrap — handling input that matches no existing feature

> Shared rule for EVERY skill that takes a `<feature>` argument or a business description. It answers: **when a user invokes a skill with an unexpected flow/description and `docs/{feature}/` does not yet exist, what happens?** Goal: no skill should soft-fail (silent soft-gate warning) or improvise outside the design. Every skill MUST reference this file in Constraints + References if it accepts a feature input.

## The problem

Every bash `## Context (dynamic)` block only lists **existing** features (`ls -d docs/*/`, glob `srs/{feature}-spec.md`...). A brand-new feature never appears → the picker/auto-detect comes back EMPTY. The output path `docs/{feature}/...` needs a resolvable `{feature}` — without one, nothing can be written. Before this rule, each skill handled this differently (four inconsistent quality levels). This rule standardizes into 3 behavior groups.

## Three skill-group classification

| Group | Skill | Behavior when feature does not exist |
|---|---|---|
| **A — Entry point** (can initialize a feature) | `brainstorm`, `urd`, `brd`, `prd-epic`, `usecase` (discovery mode), `user-flow`, `bpmn`, `sequence`, `activity`, `activity-swimlane`, `erd`, `state`, `d2-activity`, `d2-erd`, `d2-architect`, `reverse-doc` | **Derive slug + interview within scope + create the feature.** See the "Group A" section. (`reverse-doc` is a variant: it derives the slug from the SOURCE instead of interviewing, see the note below.) |
| **B — Mid/end of chain** (needs an upstream artifact as source) | `usecase-diagram`, `userstory`, `ac`, `figma`, `prototype`, `jira`, `confluence`, `export`, `preview`, `sync-confluence` | **Refuse explicitly + route specifically to the upstream skill.** Do NOT create a feature. See the "Group B" section. (`sync-confluence` needs **`confluence:<url>`** + a change source (git range/conversation) + Atlassian MCP auth — refuse if the link is missing, do not guess the page.) |
| **C — Read-only / project-level** (no feature needed) | `dashboard`, `gap`, `review`, `prd`, `roadmap`, `meet`, `discover`, `update-overview`, `delegate`, `userguide`, `scan-project` | **Friendly empty-message.** See the "Group C" section. (`scan-project` is special: it **reads source code** instead of vault docs, outputs to `docs/_shared/architecture/` — project-level, no feature needed.) |

> `srs` is a special case: it is an orchestrator, it can initialize `spec.md` (the entry point for the spec part) but the downstream items in its menu follow group B. Handling: `spec.md` missing → follow group A (derive slug + interview Batch 1-2 + create the `srs/` folder); downstream items still need the just-finalized spec.md.

> `usecase` is also a **two-mode** case (unlike `usecase-diagram`/`userstory`, which are pure group B): a use case is an **elicitation** technique — in practice a BA often writes it BEFORE the SRS to explore the business domain. So `srs/{feature}-spec.md` **missing → discovery mode = group A** (derive slug + interview actor/goal/flow/errors + create the feature; draft the UC, leave the FR/errors columns empty, mark OQs, route to `/srs` to formalize). `srs/{feature}-spec.md` **present → downstream mode** (extract FRs, fill in full traceability). The skill picks its own mode. Do NOT refuse when the SRS is missing — that would wrongly block the standard elicitation flow.

## Group A — Entry point: derive slug + interview within scope + create feature

When the arg matches NO existing `docs/{arg}/` folder:

1. **Identify the input type.** Is the arg a business description (prose, multiple words, verb/object) or a mistyped slug (a single kebab-case word)?
   - Prose → treat it as a description, go to step 2.
   - Unknown single-word slug → ask "Feature `{arg}` does not exist. Is this a new feature or a typo? Existing features: {list}." Wait for the reply.
2. **Derive the feature slug** from the description content: main domain noun phrase, kebab-case, ASCII (transliterate Vietnamese), ≤50 characters (per `naming-conventions.md`). E.g. "customer places order, shipper delivers, admin approves refund" → `order-fulfillment` or `ecommerce-order`. If no clear slug can be inferred → ask the user for the desired feature slug.
3. **Interview ONLY WITHIN the scope that skill needs** (do NOT ramble comprehensively like `/brainstorm` — each skill asks only what it needs to produce its own output):
   - `/bpmn`: actors/lanes · steps · branch points · outcomes + error-path.
   - `/sequence`: actors · message order · error branches (alt/opt).
   - `/activity`: sequential steps · decision points · lanes (if multi-role) · loops. (Multi-role with many cross-lane hops → suggest `/activity-swimlane` for real swimlanes.)
   - `/activity-swimlane`: roles/lanes (who does which step) · sequential steps · decision points (question + yes/no branches) · loops. The default for multi-role activity.
   - `/erd` · `/d2-erd`: entities · business attributes per entity · relationships (cardinality).
   - `/state`: which entity · the states · trigger per transition · forbidden transitions.
   - `/usecase` (discovery mode, no SRS yet): primary actor · user goal (sea-level) · main success scenario (steps) · branches + errors · guarantees on success/failure. Unclear business numbers (deadlines, thresholds) → mark as OQs, do NOT fabricate. Route to `/srs` afterward to formalize the FRs.
   - `/d2-activity`: same as `/activity`. `/d2-architect`: logic blocks · services · external services · call flow.
   - `/user-flow`: handles itself (infer mode + clarify). `/urd`: interview user needs. `/brainstorm`: comprehensive interview (that is its role).
   - `/reverse-doc`: **do NOT interview to infer the business** — read the SOURCE (docx/pdf/image...) then cluster into multiple features, deriving each feature's slug from the source content. Can create MULTIPLE features at once. Only ask about GAPS (where the source is missing) in `.reverse-plan.md`, do not ask from scratch. See `reverse-doc/SKILL.md`.
   - Interview using IT-BA framing (`ba-conventions.md` Section 3) — business language, do NOT ask about DB/SDK/endpoint.
4. **Confirm at L1** — a BA-friendly prose preview including the proposed feature slug (user can override) + a summary of the content about to be drawn.
5. **Create the `docs/{feature}/` folder** (+ needed subfolders) at Write time, after the user says Y at L1. This is a new feature — owner comes from the `user-identity` memory (`ba-conventions.md` Section 1).
6. **Suggest the next step** in the Output report: the just-created feature only has one artifact (diagram/flow), so suggest `/brainstorm {feature}` or `/srs {feature}` to flesh it out if the user wants to continue.

> **Reference examples:** `/brainstorm` (derives slug from an idea), `/user-flow` (accepts both a slug and a free-form description + infer mode), `/reverse-doc` (reads a source → clusters into multiple features + creates them, with 2 HARD STOP steps).

## Group B — Mid/end of chain: refuse explicitly + route

These skills need an upstream artifact (SRS/FR/UC/US/screen) as a REAL SOURCE — creating a feature then generating content from zero would fabricate. When the feature does not exist OR a required artifact is missing:

1. **Do NOT create a feature. Do NOT silently soft-gate warn then proceed recklessly.**
2. **Refuse explicitly + list valid features + route specifically** to the upstream skill. Use the standard wording (the "Standard messages" section).
3. Each skill states its own required artifact and which skill produces it:
   - `/usecase-diagram` needs `srs/{feature}-spec.md` OR `usecases/{feature}-usecase-index.md` → route to `/srs` or `/usecase`. (`/usecase` is NO longer in group B — see the two-mode note above.)
   - `/userstory` needs `srs/{feature}-spec.md` (FR) → route to `/srs`.
   - `/ac` needs `us-*.md` (story) → route to `/userstory`.
   - `/figma`, `/prototype-html` need an ASCII screen in `ascii-wireframe/{flow-slug}.md` → route to `/user-flow` + `/wireframe-ascii`.
   - `/jira` needs `userstories/us-*.md` → route to `/userstory`.
   - `/confluence`, `/export`, `/preview` need ≥1 feature doc (usually `srs/{feature}-spec.md`) → route to `/srs`.

> **Reference examples:** `/prototype-html` (refuse + list all of `/srs`+`/user-flow`+`/wireframe-ascii`), `/test-cases` (refuse when the checklist is missing → `/test-checklist`).

## Group C — Read-only / project-level: friendly empty-message

No specific feature needed (scans the whole vault, or produces project-level output). When the vault is empty / the feature filter is wrong:

1. **Do NOT dead-end, do NOT crash.** Print a friendly message + guidance on the initialization step.
2. Read-only (`dashboard`/`gap`/`review`): "Vault is empty / nothing to {analyze|review} yet. Start with `/brainstorm <idea>` or `/urd <feature>`."
3. Project-level (`prd`/`roadmap`/`meet`/`discover`/`update-overview`): these skills run BEFORE any feature exists — the "no feature yet" state is valid (e.g. `/discover` calls it "Greenfield exploration"). No routing needed.
4. `delegate`: does not touch the vault, not applicable.

> **Reference examples:** `/dashboard` (placeholder "Vault empty" + empty-vault template), `/gap` (friendly abort).

## Standard messages (empty picker / wrong feature name)

Group A when an unknown slug needs confirmation:
```
Feature `{arg}` does not exist. Is this a new feature or a typo?
Existing features: {list features}.
→ If new: I will derive the slug `{proposed}`, confirm, then draw it right away.
→ If a typo: retype the correct name.
```

Group B when the feature/artifact is missing:
```
Cannot run /{skill} for `{feature}` — missing {required artifact}.
Existing features: {list}.
→ Run /{upstream-skill} {feature} first to create {artifact}, then come back to /{skill}.
```

## Anti-patterns

- ❌ Soft-gate warning "SRS missing, running anyway" then proceeding to generate content from zero (group B) → fabrication.
- ❌ An empty picker with no message → the user is stuck, not knowing what to do.
- ❌ Improvising an output path when `{feature}` is unresolved → misplaced file.
- ❌ Group A drawing immediately from one vague sentence WITHOUT interviewing to clarify scope → a business-wrong diagram.
- ❌ Group A rambling through a comprehensive interview like `/brainstorm` → role overlap, annoying the user (ask ONLY what the skill needs).

## One-line summary

> **Feature missing → Group A: derive slug + interview within scope + create folder · Group B: refuse + route upstream · Group C: friendly empty-message.**
