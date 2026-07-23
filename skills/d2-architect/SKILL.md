---
name: d2-architect
description: Use when you need a system architecture diagram (nested components, services, DBs) in D2 — ELK layout, nicer than Mermaid for this kind of diagram. Trigger with `/d2-architect --feature <slug>`. Same family as `/d2-activity`, `/d2-erd`.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
argument-hint: "[--feature <slug> | \"<system description>\"] [--no-icons]"
---

# /d2-architect — System / Architecture Diagram (D2, nested container + ELK)

> D2 skill family: `/d2-activity` (flow) · `/d2-erd` (data model) · `/d2-architect` (this architecture). All 3 share `render.sh` at `${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/`.

## Goal

Draw the **system architecture picture** at the business level: blocks (client, backend, external services) nesting sub-components (service, DB, gateway), with business-labeled call flows between them. Use [D2](https://d2lang.com) nested containers — something **Mermaid cannot draw nicely**. Output in `docs/{feature}/d2-architect/`:

1. `{slug}.d2` — D2 source (text, git-tracked). Edit when calling the skill again (auto update mode).
2. `{slug}.svg` — pre-rendered (open in browser/IDE/Obsidian).

Plus `d2-architect/{feature-or-shared}-d2-architect-index.md` (metadata + block table). If drawing the whole-system architecture (not belonging to a single feature) → save under `docs/_shared/d2-architect/`.

## Architecture = business level, NOT a deployment diagram

A skill for **devs acting as BAs** — draw at the **logical architecture** level, NOT a solution architect's deployment diagram. Draw at the level of **"what blocks the system has, which external services it calls, the main data flows"** — enough for stakeholders + devs to understand the context. Do NOT draw: pods/replicas, load balancer config, VPC/subnet, port numbers, container images. If the user needs that level → that is the architect's job, out of scope.

**ALLOWED to draw:** logical blocks (Client/Backend/Mobile), services by business function (Auth, SRS Engine, Import), the database (1 block), external services by name + purpose (Google OAuth, Stripe, SendGrid), business-labeled call flows.

## Constraints

- **Fixed output** `docs/{feature}/d2-architect/{slug}.d2` + `.svg` (or `docs/_shared/d2-architect/` if cross-feature).
- **`--feature` optional** — auto-detect from context; no `--feature` but a WHOLE-system architecture description → draw into `_shared/d2-architect/` (escape hatch, KEEP as is). File already exists → enter update mode automatically, no flag needed. **Want to attach to a specific feature that doesn't exist yet → auto-derive slug + create feature** (entry point, see `feature-bootstrap.md` group A); a whole-system architecture still goes into `_shared/` as before.
- **AI writes the source, NO coordinates** — ELK handles the layout.
- **Render via `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`** (shared). Do NOT call d2/Chrome directly.
- **Compile must PASS** before reporting done.
- **Review the image yourself** (accuracy): if Chrome is available, render `--png` then Read the image to inspect overlaps/overlapping edges/wrong labels before reporting; without Chrome, inspect the source + `.svg` carefully.
- **L1 approval** before Write — BA-friendly prose (blocks + external services + main flows), do NOT dump the source.
- **NO L3 iterate** — review from the .svg.
- **Do NOT ask about/draw infra details** (port, replica, VPC) — see the "business level" section above.
- **Technology icons (optional, per @../../rules/icon-map.md)** — infrastructure/tech/external-system nodes get `icon:` from `"${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh"`; automatic when the name matches a tech, `--no-icons` to disable. ONLY tech nodes (correct altitude).
- **Bilingual (mirror input — @../../rules/language.md)** for flow labels + block names; service names follow the real system.
- **Per `diagram-selection.md`** — `/d2-architect` for the system picture; a multi-branch business flow → `/d2-activity`; a data model → `/d2-erd`.
- **Idempotent** — 1 slug = 1 file; rerun → enter update mode automatically (L2 diff), no refusal.

## Inputs

```
/d2-architect --feature <slug>              # architecture in the context of one feature
/d2-architect "<system description>"            # whole-system architecture → docs/_shared/d2-architect/
/d2-architect "<description>" --feature <new-slug>  # feature doesn't exist → derive/use slug + interview + create (entry point)
```

Slug already exists → the skill recognizes it and enters update mode (L2 diff), no extra typing needed.

## Context (dynamic)

Today: !`date +%Y-%m-%d`
Available features: !`ls -d docs/*/ 2>/dev/null | xargs -I{} basename {} | head -20`
system-overview present (good source): !`test -f docs/_shared/system-overview.md && echo "✅ docs/_shared/system-overview.md" || echo "(not present — /update-overview system)"`
d2 installed: !`test -x "$HOME/.local/bin/d2" && echo "✅ $($HOME/.local/bin/d2 --version)" || echo "❌ not installed — curl -fsSL https://d2lang.com/install.sh | sh -s --"`

## Flow runtime

```
User calls /d2-architect [--feature X | "<description>"]
   │  d2 not installed? → stop, give install instructions
   │  ┌─ Resolve the write target (feature-bootstrap.md group A + _shared escape hatch):
   │  │  • WHOLE-system architecture (whole-system description, no --feature) → docs/_shared/d2-architect/
   │  │    (KEEP this path — the "no feature yet" state is valid, no need to derive).
   │  │  • Want to attach to a specific feature that matches no docs/{feature}/ → entry point:
   │  │    derive/use slug (kebab-case, ASCII, ≤50 chars), confirm at L1 (user can override),
   │  │    create docs/{feature}/d2-architect/ on Write. Do NOT require running /brainstorm first.
   │  │  • ambiguous 1-word unknown slug → ask "new feature, typo, or whole-system architecture?" (list features).
   │  ▼
1. Read the architecture source by priority:
   docs/_shared/system-overview.md (if present — the best source) →
   docs/X/srs/{feature}-spec.md + flows.md (external service mentions, components) →
   NO source yet (new feature / whole-system architecture lacking system-overview): interview EXACTLY the
   scope the architecture needs (feature-bootstrap.md group A step 3), gather 1 business-language batch (do NOT ask
   about port/replica/VPC): logical blocks (Client/Backend/...) · services by function · external
   services (name + purpose) · main call flows. No-re-ask what the source already has.
   Ambiguous description even with a source (system-overview.md only lists block names, call flows unclear) →
   MUST ask clarifying questions before generating, do NOT fabricate call flows/external services.
   ▼
2. Break down: logical blocks (containers) → sub-components → external services → call flows + labels
   ▼
3. Write the .d2 source (formula below) — nested containers
   ▼
4. L1 plan preview (prose: K blocks, N services, M external services). User Y → continue
   ▼
5. Write {slug}.d2 → render.sh → {slug}.svg (compile fail → fix, up to 2 times)
   ▼
6. Update {feature-or-shared}-d2-architect-index.md (env note → activity.log). Tell the user to open the .svg.
```

## How to build (build step-by-step)

### Step 1 — Skeleton d2-architect/ if it doesn't exist

`{feature-or-shared}-d2-architect-index.md` (type `d2-architect-index`): standard frontmatter + diagram table (slug / blocks / external services / updated). Lifecycle inherited from `srs/{feature}-spec.md` (or standalone if `_shared/`).

### Step 2 — Formula for writing the .d2 source (architecture)

```
direction: right       # horizontal architecture reads more easily

# User actor:
Learner: Learner { shape: person; style.fill: "#E8F0FE" }

# Logical block = a container nesting sub-components:
Client: Client (Web / Mobile) {
  UI: Interface
  SW: Service Worker
}

Backend: Backend {
  API: API Gateway
  Auth: Auth Service
  Core: Core Engine { style.fill: "#FFF4E5" }   # highlight the main component
  DB: Database { shape: cylinder; style.fill: "#E6F4EA" }   # DB = cylinder
}

# External services = dashed-border container:
External: External services {
  style.stroke-dash: 3
  Google: Google OAuth
  Pay: Payment Gateway
}

# Call flows = edges, business label, reference children via a dot:
Learner -> Client.UI: uses
Client.UI -> Backend.API: HTTPS / REST
Backend.API -> Backend.Auth: log in
Backend.Core -> Backend.DB: read/write
Backend.Auth -> External.Google: OAuth callback
```

**Rules:**
- Nested container: `Backend: { API: ...; DB: {shape: cylinder} }`. Reference children: `Backend.API`.
- Suggested shapes: `person` (actor), `cylinder` (DB/storage), `queue` (message queue), default ▭ (service).
- **Technology icons (optional, per @../../rules/icon-map.md):** infrastructure/tech/external-system nodes (DB/cache/queue/cloud/3rd-party) → add `icon:` from the resolver: `ICON="$("${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh" redis)"` then `Cache: Redis { icon: "$ICON" }`. Automatic when the node name matches a tech; `--no-icons` to disable; **only infrastructure/tech nodes** (don't stuff every box — wrong altitude).
- External services: wrap in a `style.stroke-dash: 3` container (dashed border) — to distinguish "outside our control".
- Highlight the main component with `style.fill`. Don't color everything — 1-2 accent colors is enough.
- **QUOTE labels/names with special characters** `() / | :` — e.g. `Client (Web / Mobile)` is OK (not merely for spaces), but `"API v2 / gateway"` needs quoting.
- NO coordinates — ELK handles it. NO infra detail (port/replica).

### Step 3 — Render + verify

```bash
"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" docs/{feature}/d2-architect/{slug}.d2
# compile fail → usually a missing quote on a label with special characters → fix, re-render.
```

## L1 plan preview (BA-friendly template)

> I will draw the architecture diagram **{system name}** at `docs/{...}/d2-architect/{slug}.d2` (+ a `.svg` image):
>
> **Blocks ({K}):** {e.g. Client (Web/Mobile), Backend, External services}
> **Main components:** {e.g. API Gateway, Auth Service, SRS Engine, Database}
> **External services ({M}):** {e.g. Google OAuth, Web Speech API, AI Model}
> **Main flows:** {e.g. "Client calls Backend via REST", "Auth calls Google OAuth"}
>
> Source: {system-overview.md | srs/{feature}-spec.md | you provide}.
>
> **Logged:** activity log "{note}".
>
> Apply? (Y / edit)

## Output report

```
✅ D2 architecture: docs/{...}/d2-architect/{slug}.svg
   Blocks: {K} | Services: {N} | External services: {M}

Open {slug}.svg in browser/IDE/Obsidian to view (nested blocks, DB cylinder).
Need changes? /d2-architect --feature {feature} (the skill enters update mode automatically)
```

## Gotchas

- **d2 not installed** → stop, print 1 install line.
- **QUOTE labels with special characters** (gotcha #1) — `/ | ( ) :` in a name/label must be wrapped in `"..."`. Forget → compile fail.
- **Don't draw infra** — port, replica, load balancer, VPC are the deployment level, out of IT-BA scope. Keep at the logical-block + external-service level.
- **The best source is system-overview.md** — if it doesn't exist, suggest the user run `/update-overview system` first to get a proper source.
- **Containers too deep** (nested >3 levels) → hard to read; merge some or split into 2 diagrams (e.g. 1 overview + 1 backend zoom).
- **External services** always in a dashed-border wrapper + real name + a short purpose phrase (Google OAuth, not "IdP #1").
- **Cross-feature** (whole-app architecture) → save under `docs/_shared/d2-architect/`, do NOT stuff into one feature folder.
- **Update mode (slug exists)** → Read the old source, L2 diff, re-render after user Y.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../rules/icon-map.md (inserting technology icons; resolver `scripts/icon-path.sh`)
