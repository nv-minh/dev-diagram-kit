---
name: d2-activity
description: Use when you need a PRETTY standalone activity/flowchart diagram (many decision branches, swimlanes) in D2 — ELK layout markedly more compact than Mermaid. Trigger with `/d2-activity "<process description>" --feature <slug>`. Differs from `/activity` (inline Mermaid in flows.md, lays out poorly with many branches), `/d2-erd` (ERD), `/d2-architect` (system architecture) and `/bpmn` (OMG standard, Camunda import).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "\"<process description>\" [--feature <slug>]"
---

# /d2-activity — Activity / Flowchart Diagram (D2, ELK layout)

> D2 skill family: `/d2-activity` (this flow) · `/d2-erd` (data model) · `/d2-architect` (system architecture). All 3 share `render.sh` at `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/`.

## Goal

Draw a multi-branch business process (decision/parallel/loop/swimlane) as a **pretty, compact diagram with non-overlapping orthogonal edges** using [D2](https://d2lang.com) + the **ELK** layout engine. Fully standalone, do NOT mix into `srs/{feature}-flows.md`.

Output in `docs/{feature}/d2/`:
1. `{process-slug}.d2` — D2 **source** written by the AI (text, git-tracked). Edit this when calling the skill again (auto update mode).
2. `{process-slug}.svg` — pre-rendered (open in browser/IDE/Obsidian, no server needed).

Plus `d2/{feature}-d2-index.md` (metadata + process table).

## Why D2 instead of Mermaid?

Mermaid (`/activity`) uses the dagre layout — for a flow with >5 branches + many convergence points, it lays out arbitrary curved arrows, crosses through nodes, and merge points bunch up messily. **You describe the logic, the engine lays it out, you take what you get** — no control.

D2 + ELK give: **orthogonal, channeled** edges, nodes **aligned in columns/rows**, **true swimlanes** (no subgraph hack), distinguished by shape+color (decision ◇ / start-end ○ / process ▭). For the same flow, D2 is visibly cleaner than Mermaid.

> Keep `/activity` (Mermaid) for cases needing **inline embedding** with auto-render on GitHub/Obsidian. Use `/d2-activity` when you need a **pretty standalone version** for stakeholders to view / export.

## Constraints

- **Fixed output** `docs/{feature}/d2/{slug}.d2` + `.svg`. Do NOT write into `flows.md`. NO layout/theme/direction flags (ELK + neutral theme are fixed in `render.sh`).
- **`--feature` optional** — auto-detect from context/the feature in progress; only ask when ambiguous. File already exists → enter update mode automatically, no flag needed. **Feature does not exist + arg is a process description → auto-derive slug + create feature** (entry point, see `feature-bootstrap.md` group A). Everything else is inferred from the description (per flag-diet).
- **AI writes the .d2 source, does NOT compute coordinates** — ELK handles the layout. The AI's role = describe the business correctly (nodes/branches/lanes), like writing Mermaid.
- **Render via `render.sh`** — do NOT call `d2`/Chrome directly in the skill (the script handles paths + flags).
- **Compile must PASS** before reporting done. Syntax fail → fix the source, do NOT leave a broken/missing .svg.
- **Review the image yourself** (accuracy): if Chrome is available, render `--png` then Read the image to inspect overlaps/overlapping edges/wrong labels before reporting; without Chrome, inspect the source + `.svg` carefully.
- **L1 approval** before Write — BA-friendly prose (see `ba-conventions.md` Section 5), described in business terms (steps / decision branches / roles), do NOT dump the D2 source.
- **NO L3 iterate** — D2 does not render in chat; the user reviews from the .svg file (per `approval-gate.md` + the skip-L3-mermaid memory, applied to D2 too).
- **Bilingual (mirror input — @../../rules/language.md)** in labels (D2 supports Unicode); syntax keywords in English.
- **Per `diagram-selection.md`** — `/d2-activity` when you need a pretty standalone activity. Need the OMG standard/Camunda import → `/bpmn`. Need inline auto-render embedding on GitHub → `/activity`.
- **Idempotent** — `d2/{feature}-d2-index.md` tracks processes; matching slug → enter update mode automatically (L2 diff), no refusal.

## Inputs

```
/d2-activity "<process description>" --feature <slug>          # create a new diagram
/d2-activity --feature <slug>                              # interactive: ask which process to draw
/d2-activity "<process description>"                           # feature doesn't exist → derive slug + interview + create (entry point)
```

Matching existing slug → the skill recognizes it and enters update mode (L2 diff), no extra typing needed.

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
Features with d2/: !`for d in docs/*/d2/*-d2-index.md; do [ -f "$d" ] && dirname "$d" | xargs dirname | xargs basename; done 2>/dev/null | head -10`
d2 installed: !`test -x "$HOME/.local/bin/d2" && echo "✅ $($HOME/.local/bin/d2 --version)" || echo "❌ not installed — curl -fsSL https://d2lang.com/install.sh | sh -s --"`

## Flow runtime (how the skill runs)

```
User calls /d2-activity "<description>" --feature X
   │
   ▼
1. Resolve feature + process slug (verb-object kebab-case from the description)
   │  d2 not installed? → stop, give a 1-line install hint (see Context)
   │  ┌─ Feature does not match any docs/{feature}/ (entry point, feature-bootstrap.md group A):
   │  │  arg is a raw process description → derive feature slug from it (kebab-case, ASCII,
   │  │  ≤50 chars), confirm the slug at L1 (user can override), create docs/{feature}/d2/ on Write.
   │  │  arg is a 1-word unknown slug → ask "new feature or typo?" (list existing features).
   │  └─ Do NOT require the user to run /brainstorm first.
   ▼
2. Read the business context:
   │  ┌─ Feature exists: read docs/X/srs/{feature}-spec.md, usecases/uc-*.md (if any) → understand steps,
   │  │  error branches, business rules to draw CORRECTLY (no fabrication), no-re-ask what exists.
   │  └─ NO source yet (new feature or old feature lacking spec/UC): interview EXACTLY the scope
   │     the activity needs (feature-bootstrap.md group A step 3), gather 1 business-language batch
   │     (do NOT ask about DB/SDK): sequential steps · branch points (decision question + branches) ·
   │     roles/lanes (if multi-role) · loops. Ask about whatever is missing, don't ramble like /brainstorm.
   │  Ambiguous description even though the feature has a source (process description too short, branches/roles
   │  unclear, the readable source also lacks detail) → MUST ask clarifying questions before generating,
   │  do NOT guess. This is not a bootstrap interview — just 1-2 short questions to fill the gaps.
   ▼
3. Determine: sequential steps | decision branches (◇) | roles/lanes | loop/parallel
   ▼
3.5. Confirm lanes before drawing (MANDATORY if ≥1 lane detected from description/source) — print
   │  "Detected {N} participating roles: {list}. Complete?" before moving to step 4. An actor hidden/
   │  implied in the text (not named explicitly) is easily missed if you just infer and draw right away.
   ▼
4. Write the .d2 source (formula below) — the AI only describes structure, NO coordinates
   ▼
5. L1 plan preview (BA-friendly prose: N steps, M branches, K lanes). User Y → continue
   ▼
6. Write {slug}.d2 → run render.sh → produce {slug}.svg
   │  compile fail? → fix the source, re-render (up to 2 times), only then report
   ▼
7. Update d2/{feature}-d2-index.md (add a row) — env note → activity.log. Tell the user to open the .svg.
```

## How to build (build step-by-step)

### Step 1 — Skeleton d2/ if it doesn't exist

`docs/{feature}/d2/{feature}-d2-index.md` (type `d2-index`): standard frontmatter + process table (slug / title / decisions / lanes / updated). Lifecycle inherited from `srs/{feature}-spec.md`.

### Step 2 — Formula for writing the .d2 source

```
direction: down        # vertical; change to 'right' if the flow is short-wide

# Node — set shape + color by TYPE (helps quick reading):
start: <label>    { shape: circle;  style.fill: "#E8F0FE" }   # start
end:   <label>    { shape: circle;  style.fill: "#E6F4EA" }   # end
dec:   <ask what?> { shape: diamond; style.fill: "#FFF4E5" }  # decision
step:  <action>                                              # processing step (default ▭)

# Edge — branch label on the arrow:
start -> dec
dec -> stepA: Yes
dec -> stepB: No
stepA -> end
stepB -> end
```

**Swimlane (multiple roles)** — use containers, ELK lays out true lanes:
```
User: {
  u1: Submit request
  u2: Receive result
}
Support: {
  c1: Review request
  approve: Approve? { shape: diamond }
}
User.u1 -> Support.c1
Support.approve -> User.u2: Approved
```

**Rules:**
- Natural Vietnamese labels; break lines with `\n` in long labels.
- Decision with >3 branches: just have multiple edges out of one diamond (D2 handles it, unlike Mermaid).
- Loop `A -> B -> A` is OK; ≥2 overlapping loops → split into 2 diagrams.
- Do NOT set width/height/coordinates — let ELK handle it.

### Step 3 — Render + verify

```bash
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/d2/{slug}.d2
# compile fail → read the error, fix the source, re-run. Do NOT report done when the .svg is missing.
```

## L1 plan preview (BA-friendly template)

> I will create a process diagram **{name}** at `docs/{feature}/d2/{slug}.d2` (+ a viewable `.svg` image):
>
> **Content:**
> - {N} processing steps, {M} decision branches (e.g. "Assessment result?", "interval ≥ 30 days?")
> - {K} roles/lanes: {list if any}
> - Start point: {...}; end: {...}
>
> **Drawn with D2 + ELK** for compact, non-overlapping edges (nicer than Mermaid with many branches).
>
> **Logged:** activity log "{note}".
>
> Apply? (Y / edit)

## Output report

```
✅ D2 activity diagram: docs/{feature}/d2/{slug}.svg
   Steps: {N} | Decision branches: {M} | Lanes: {K}

Open {slug}.svg in browser/IDE/Obsidian to view (orthogonal, channeled edges).
Need changes? /d2-activity "<change>" --feature {feature} (the skill enters update mode automatically)
```

## Gotchas

- **d2 not installed** → stop right at step 1, print exactly 1 install line. Do NOT write an empty file.
- **QUOTE labels with special characters** (the most common gotcha) — D2 reads `[] {} / () :` as syntax. A label containing these MUST be wrapped in `"..."`. E.g.: `A -> B: "POST /review {id}"` (correct) vs `A -> B: POST /review {id}` (compile fail). Vietnamese/spaces/diacritics → OK without quotes; only quote when there are structural characters.
- **Compile fail** — read the d2 error (it points to line:column), usually a missing quote (see above) or a missing `:` before an edge label. Fix, re-render.
- **SVG opens blank** → usually an empty label or an orphan node. Check every node has at least 1 edge.
- **PNG (when export is needed)** → `render.sh {file}.d2 --png` (via Chrome puppeteer-cache). Default is SVG only, to stay light. The script reads the `viewBox` in the SVG to set the correct Chrome `--window-size` (matching the real diagram size) — do **NOT** switch to D2 native PNG (`d2 file.d2 file.png`) to "simplify": D2 v0.7.1 native PNG export depends on a self-downloaded Playwright driver, and the D2-required driver build (`playwright-1.47.2-mac-arm64.zip`) has been removed from every Playwright CDN mirror (permanent 404 as of 2026-07, not a transient network error) — the available Chrome/Puppeteer is the only stable path in this environment.
- **Don't lock in lanes from the heuristic** — step 3.5 mandatorily asks the user to confirm the detected role list before generating, because inferring from the description easily misses actors hidden/implied in the text.
- **Don't over-engineer** — a linear 3-4 step flow does not need a diagram; numbered steps suffice.
- **Don't mix with /activity** — if the feature already has an activity in flows.md, /d2 still writes separately in d2/, does NOT delete/edit flows.md.
- **Update mode (slug exists)** → Read the old .d2 source, L2 diff the changed part, re-render after user Y.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
