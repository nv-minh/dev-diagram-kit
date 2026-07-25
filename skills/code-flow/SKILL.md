---
name: code-flow
description: Use when you want to draw a FLOW diagram (sequence / activity / state) for ONE specific function or module in EXISTING code — read the code, trace the call chain / control flow / state, and render it with code provenance (file:line). Trigger with `/code-flow <path-or-symbol> [--as sequence|activity|state]`. Differs from `/scan-project` (whole-codebase architecture set) — this traces a SINGLE target's behavior.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
user-invocable: true
argument-hint: "<path-or-symbol> [--as sequence|activity|state] [--feature <slug>] [--lang en|vi] [--no-icons]"
---

# /code-flow — Trace one function/module in code → flow diagram (with provenance)

> Reads CODE (not a description) for a single function/module/file → traces how it behaves → draws a **sequence / activity / state** diagram using the existing flow engines, every element carrying a `file:line` provenance. The targeted sibling of `/scan-project`: scan-project draws the **whole-codebase architecture set**; code-flow draws **one target's behavior**.

## Goal

Given a code target (function / method / module / file path), produce ONE Mermaid flow diagram that explains how it works, plus a **Code provenance** table mapping every diagram element to the line(s) it came from. Output `docs/{feature}/code-flow/{slug}-flow.md` (or `docs/_shared/code-flow/` for cross-feature targets).

## Auto-pick the diagram type (unless `--as` forces one)

Read the target, then choose by what the code actually does:

| The code is mostly… | Diagram | Signal |
|---|---|---|
| A **call chain across ≥2 actors/layers over time** (controller → service → repo → external; webhook handler) | **sequence** (default) | calls/returns, requests, async callbacks |
| **Control-flow with ≥3 branches** (if/else/switch), loops, or **multiple roles doing steps** | **activity** | many decisions, retry/poll loops, role hand-offs |
| A **state machine** — an enum status + transitions, or a `switch` on a state | **state** | `status: pending|paid|cancelled` + the events that flip it |

Tie-breaker / default → **sequence** (the most common "how does this work"). The user can force any with `--as sequence|activity|state`.

## Constraints

- **Target required** — a path (`src/orders/placeOrder.ts`) or a symbol (`OrderService.placeOrder`). Resolve it via Glob/Grep before tracing; if ambiguous (several matches), list them and ask which.
- **2 phases, HARD STOP between** — Phase 1 trace (subagent, READ-ONLY) → L1 preview → user confirms → Phase 2 render. Do NOT draw before confirmation.
- **Read code via a subagent (Task)** to keep the main context lean — the subagent RETURNS findings + `file:line` evidence; the main thread synthesizes and Writes (per `approval-gate.md`).
- **Provenance + confidence on every element** — ✅ read for certain / 🔵 inferred. **Do NOT fabricate**: if a call/branch cannot be read, mark 🔵 + "needs confirmation", never invent it.
- **Render via the existing engines** — Mermaid (`scripts/mermaid-verify.mjs`) for sequence/activity/state (inline, default). Do NOT write a new renderer.
- **Compile must PASS** before reporting done (Mermaid label-safety per `diagram-selection.md`).
- **NO L3 iterate** — review from the rendered file.
- **Right altitude** — the diagram explains behavior of THIS target. Do NOT turn it into a whole-system architecture diagram (that's `/scan-project`); do NOT draw infra. Trace 1 level of calls by default (note deeper/inner calls as "→ …" rather than exploding everything).
- **Bilingual (mirror input — @../../rules/language.md)** for notes; real identifiers (function/class/module names) kept AS-IS from the code.
- **Idempotent** — re-run the same target → update mode (L2 diff).
- **Theme** — apply the global Mermaid init from `@../../rules/diagram-style.md`.

## Inputs

```
/code-flow src/orders/placeOrder.ts                 # trace the file (auto-pick diagram type)
/code-flow OrderService.placeOrder                  # trace the symbol (Grep to locate it)
/code-flow src/auth/login.ts --as state             # force a state diagram
/code-flow src/checkout/ --feature checkout         # scope output to a feature
/code-flow src/shared/logger.ts --no-icons          # (icons unused for Mermaid — flag accepted for parity)
```

## Context (dynamic)

Root: !`echo "${CLAUDE_PROJECT_DIR:-$(pwd)}"`
Has git: !`git rev-parse --is-inside-work-tree 2>/dev/null && echo "✅" || echo "(not a git repo)"`
Detected manifest: !`ls package.json go.mod pom.xml build.gradle requirements.txt pyproject.toml Cargo.toml composer.json Gemfile 2>/dev/null | head`
mmdc installed?: !`command -v mmdc >/dev/null && echo "✅ $(mmdc --version 2>/dev/null || echo '?')" || echo "❌ npm i -g @mermaid-js/mermaid-cli"`

## Flow runtime

```
User calls /code-flow <target> [--as ...] [--feature ...]
   │
   ▼
═══ PHASE 1 — TRACE (ends with a HARD STOP) ═══
1. Resolve the target: Glob/Grep to pin the file:line. Several matches → list + ask which.
2. Spawn 1 subagent (Task, read-only): read the target + 1 level of calls it makes; return:
   • Call chain: who calls whom, in order, with args/return + file:line.
   • Branches: if/switch/loops + their conditions + file:line.
   • State: any status enum + the transitions/events + file:line.
   • External touchpoints: DB/cache/queue/3rd-party calls + file:line.
   Do NOT edit, do NOT draw.
3. Auto-pick the diagram type (table above) unless --as forced one.
4. Synthesize → L1 preview (HARD STOP): "trace <target> → draw <type>, N steps/branches, provenance from <files>. Draw? (Y / edit / change type)".
   ▼  (user Y / edits)
═══ PHASE 2 — GENERATE ═══
5. Write the Mermaid source using the formula of the chosen type (sequence / activity / state) — obey Mermaid syntax-safety (`diagram-selection.md`).
6. Render + verify: `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs" --file <output>`. Fail → fix, ≤2 times.
7. Append the **Code provenance** table (element → file:line → confidence).
8. Output report (list file + 🔵 inferred spots).
```

## How to build

### Phase 1 — Trace (subagent detail)

Prompt for the subagent (Task): *"Read-only. Trace the behavior of `<target>` in `<root>`. Follow 1 level of calls it makes (note deeper calls as '→ <name>' without exploding). Return a findings table with `file:line` evidence for: (a) the call chain in order, (b) branches/loops + conditions, (c) any status enum + transitions, (d) external touchpoints (DB/cache/queue/3rd-party). Mark confidence ✅ read / 🔵 inferred. Do NOT edit files, do NOT draw."* Gather the findings into the main thread.

### Phase 2 — Generate (reuse the flow formulas)

Pick the formula by diagram type:

- **sequence** → the `/sequence` formula (Mermaid `sequenceDiagram`): `actor`/`participant` from the real call chain; `->>` call / `-->>` return; `alt/else` for branches; `loop` for loops. Each message maps to a `file:line`.
- **activity** → the `/activity` formula (Mermaid `flowchart`): decision diamonds for branches, role/lane subgraphs if ≥2 roles. Each node maps to a `file:line`.
- **state** → the `/state` formula (Mermaid `stateDiagram-v2`): states from the enum, `A --> B : event` transitions, `[*]` entry/terminal. Each transition maps to a `file:line`.

### Provenance table (appended under the diagram)

```markdown
### Code provenance
| Diagram element | Code location | Confidence |
|---|---|---|
| BE → DB: INSERT order | src/orders/placeOrder.ts:42 | ✅ |
| alt payment fails | src/orders/placeOrder.ts:58 | ✅ |
| → PaymentService.charge | src/orders/placeOrder.ts:51 (calls into payment/payment.ts) | 🔵 inferred |
```

### Render + verify

```bash
node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs" --file docs/{feature}/code-flow/{slug}-flow.md
```

## L1 plan preview (HARD STOP — template)

> Traced **{target}** (`{resolved file:line}`). It is mostly **{call chain | branching logic | a state machine}** → I'll draw a **{sequence | activity | state}** diagram: **{N}** {messages/steps/branches/states}.
> Provenance from: {file list}.
> 🔵 Inferred (needs your check): {list, or "none"}.
>
> Draw into `docs/{feature}/code-flow/{slug}-flow.md`? (Y / edit / switch to {other type})

## Output report

```
✅ Code-flow: docs/{feature}/code-flow/{slug}-flow.md → ## Flow: {target}
   Type: {sequence|activity|state} | {N} elements | Mermaid compile: OK
   🔵 Inferred: {list, or "none"}

Open the file in IDE/Obsidian/GitHub preview to see the rendered diagram + provenance table.
Need changes? /code-flow {target} again → update mode; or /code-flow {target} --as {other type}.
```

## Gotchas

- **Ambiguous target** — `placeOrder` matches 3 files → list them, ask which; do NOT guess.
- **Target too large** (a whole module / a god-function) → trace the entry point + 1 level, note deeper calls as "→ name"; suggest `/code-flow <sub-target>` to zoom in.
- **Recursion / mutual recursion** → note it ("↺ self-call"), do NOT draw an infinite loop.
- **Cross-repo / can't resolve a call** → mark 🔵 + "needs confirmation"; do NOT fabricate the callee.
- **Dynamic dispatch / interface calls** → mark the concrete callee 🔵 (inferred) unless the wiring is readable.
- **Not a flow** — if the target is pure data (a struct/DTO) or pure config, tell the user a flow diagram doesn't fit; suggest `/erd` or `/d2-architect` instead.
- **Mermaid syntax fail** — render-verify catches it right after Write, self-fix ≤2 times (no nested quotes / no `&amp;` in labels).
- **Do NOT draw deployment** (port/replica/VPC) — wrong altitude.

## References

- @../../rules/ba-conventions.md
- @../../rules/approval-gate.md
- @../../rules/naming-conventions.md
- @../../rules/changelog.md
- @../../rules/diagram-selection.md
- @../../rules/feature-bootstrap.md
- @../../rules/language.md
- @../../rules/diagram-style.md
- @../scan-project/SKILL.md (the whole-codebase sibling — provenance + read-only-subagent pattern)
- @../sequence/SKILL.md · @../activity/SKILL.md · @../state/SKILL.md (formula per diagram type)
- @./references/example-code-flow.md
- @../../scripts/mermaid-verify.mjs (render-verify after Write — Phase 2)
