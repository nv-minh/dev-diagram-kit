---
type: skill-explainer
skill: sync-confluence
updated: 2026-07-26
---

# What is `/sync-confluence` and how does it run?

**English** · [Tiếng Việt](sync-confluence.vi.md)

## 1. What it is for, and when you should type this command

Every dev-as-BA knows this pain: the code moved on, and the Confluence page describing it quietly became a lie. An endpoint was added, a status field renamed, a business rule agreed in a chat thread — and the spec page still describes last month's world. Nobody updates it, because updating it means re-reading the whole page and hand-editing Confluence.

`/sync-confluence` does that update for you. It takes **what actually changed** — either a **code change** (a git diff) or a **decision just settled in the conversation** — finds **which section of the Confluence page is now out of sync**, and edits **that section in place**, leaving the rest of the page untouched. Think of it as **a careful proofreader with a red pen**: it corrects the outdated paragraph, it doesn't retype the book.

Two modes, picked from how you call it:

- **Code mode** — you pass a git range: the system reads the diff and extracts only the changes a document cares about (API/endpoint shapes, field names and types, statuses, business rules, config defaults, flow steps). Pure refactors, formatting, and test-only changes are ignored.
- **Conversation mode** — no git range: the system takes the decision or spec you just discussed in the current chat as the source.

You type:

```
/sync-confluence confluence:<page-url> --from HEAD~5..HEAD   # code mode
/sync-confluence confluence:<page-url>                       # conversation mode
/sync-confluence confluence:<page-url> --preview             # dry-run: show the diff, write nothing
```

**One sentence to remember:** `/sync-confluence` keeps a Confluence page **matching the latest truth** — from code or conversation — by editing only the stale section, and **never writing without showing you first**.

---

## 2. What you need before it can run

The skill talks to Confluence through the **Atlassian MCP connection** — that connection must be authenticated first (`/mcp` → select Atlassian), and your account needs **read + write** permission on the target page. If the connection is missing, the skill **stops immediately and prints the auth guidance** — it never limps forward or tries to write "partially." This is deliberate: half-working access to an external system is more dangerous than none.

---

## 3. The whole run — a diagram

```
 YOU TYPE THE COMMAND
 /sync-confluence confluence:<url> [--from <range>] [--preview]
        │  (no Atlassian MCP auth → stop, guide /mcp)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Locate the page                              │
 │  Reads the page id out of the url and resolves which  │
 │  Atlassian site it lives on — dynamically, never      │
 │  hardcoded. Several sites available → asks you.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Fetch the page, twice                        │
 │  As plain text (to analyze the content) and as HTML   │
 │  (to preserve structure — macros, tables, panels).    │
 │  Not found / no access → reports clearly and stops.   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Collect "what changed"                       │
 │  Code mode: reads the git diff, keeps only doc-       │
 │  relevant changes. Conversation mode: extracts the    │
 │  decision/spec settled in this chat. Never invents    │
 │  logic that has no source.                            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Map changes onto page sections               │
 │  Matches each change to a section by its heading      │
 │  ("API", "Data model", "Business rules"...). No       │
 │  matching section → proposes ADDING one and asks you  │
 │  where it should go — never shoves it in arbitrarily. │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Compose the in-place edit + conflict check   │
 │  Rewrites only the affected sections, keeping macros  │
 │  and tables intact. Also compares the page against    │
 │  its state at the last sync — changed by someone in   │
 │  the meantime → a warning is attached.                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — PREVIEW + GATE (mandatory, no way around it) │
 │  Shows each section "before → after" in business      │
 │  language, plus the source (commits / conversation)   │
 │  and any conflict warning. You answer Y / edit /      │
 │  cancel. With --preview it STOPS here regardless.     │
 └──────────────────────────────────────────────────────┘
        │  (you answer Y)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 7 — Write, leave a trail, report                 │
 │  Updates the page (new version, with a message saying │
 │  what synced from where), optionally leaves an audit  │
 │  footer comment, records the new page state in a      │
 │  local sync-state file — then reports: sections       │
 │  changed, new version, anything needing a human look. │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     DONE — the page matches the latest code/decision
```

---

## 4. Why is the preview mandatory — with no auto-approve at all?

Most write operations in this kit are gated behind a preview, but here the gate is absolute: **there is no flag to skip it, ever.** The reason is where the write lands.

Everything else the kit writes goes into your repo — protected by git, so any mistake is one `git checkout` away from undone. A Confluence page is different: it lives on an **external server, and edits there are effectively irreversible**. Yes, Confluence keeps page versions, but restoring one is a manual, clumsy operation — and if your bad edit overwrote a colleague's fresh changes, no version restore neatly untangles that. An external write is like sending an email: you can apologize, but you can't unsend.

So the deal is fixed: the system always shows you **each section "before → after"**, in business language, with the source of every change named (which commits, or which conversation decision) — and writes only after your explicit `Y`. Want to look without any risk at all? `--preview` runs the entire analysis and stops dead at the gate.

---

## 5. Why edit in place — and why it refuses to "improve" the rest of the page

A tempting shortcut would be: regenerate the whole page from scratch. The skill explicitly forbids this, for two reasons.

**First, the page contains things you can't see in plain text.** Confluence pages carry **macros** — special blocks like status badges, table-of-contents widgets, embedded Jira tickets — plus hand-crafted tables and panels. A full-page rewrite flattens all of that into plain paragraphs; the page would be "up to date" and ruined at the same time. In-place editing touches only the section that changed and carries everything else through byte-for-byte.

**Second, the skill must not fabricate.** It only writes what can be traced to a real source — an actual diff line, an actual sentence in the conversation. A section that the change doesn't touch is left alone *even if it looks improvable*, because "improving" it would mean inventing content nobody decided on. The same discipline applies to diagrams embedded in the page: if the logic changed, the skill suggests regenerating them with the proper diagram command rather than guessing at a new picture. One more boundary: the sync is strictly **one-way** — the skill reads your code and conversation; it never edits code to match the page.

---

## 6. The conflict warning — what it protects you from

Between your last sync and today, a colleague may have edited the same page by hand. If the system blindly wrote its update, it could overwrite their work without anyone noticing.

To catch this, every successful sync records a **fingerprint of the page** (plus a marker of which commit the sync reached) in a small local state file. On the next run, Step 5 compares the page's current fingerprint against the recorded one. A mismatch means **"this page changed outside the kit since the last sync"** — and the preview then carries a clear warning, so you can look at what the colleague changed before deciding whether to proceed, adjust, or cancel. It's the same reflex as checking "has anyone edited this doc while I was away?" before pasting over it — except the system never forgets to check.

---

## 7. A real-world example

**Huy**, a backend developer who owns the refund service, just merged three commits: a new partial-refund endpoint, and the status field `refund_state` renamed to `status`. The team's Confluence page "Refund Spec" — which the support team reads daily — still describes the old world.

Huy types:

```
/sync-confluence confluence:https://acme.atlassian.net/wiki/spaces/PAY/pages/123456/Refund-Spec --from HEAD~3..HEAD
```

1. The system finds the page and fetches it in both forms. Reading the diff, it keeps two doc-relevant changes (new endpoint, field rename), discards a lockfile update and some test refactoring, and maps the changes onto two sections by heading: **"API"** (add the partial-refund endpoint) and **"Statuses"** (rename the field, update the value table).

2. The conflict check fires: the page changed since Huy's last sync. The preview shows why — a PM fixed a typo in the intro section last week. Different section, no overlap: safe, but now Huy *knows*.

3. The preview lists both sections "before → after" in plain language, names the three source commits, and asks: *Apply changes to Confluence?* Huy reads the "Statuses" table diff, confirms the value mapping is right, and types `Y`.

4. The page becomes version 12, with a version message noting it was synced from those commits; a small footer comment marks the sync, and the local state file records the new fingerprint. The report lists the two changed sections and flags one thing for manual review: an embedded flow diagram that may now be stale — Huy regenerates it with the diagram skill and syncs once more.

Two weeks later the team agrees in a chat thread: refunds get a 48-hour grace period. No code yet — so Huy runs the command **without** `--from`, and conversation mode picks up the decision. There's no "Grace period" section on the page, so the system proposes adding one and asks where; Huy says "after Statuses," approves the preview, done.

---

## See also

This document explains the idea and the run flow at an easy-to-understand level. For the full technical details (page fetching, section mapping, the sync-state file, edge cases), read the source file: `.claude/skills/sync-confluence/SKILL.md`.

Related reading:

- `.claude/rules/approval-gate.md` — the general preview-before-write rule this skill hardens into "no way around it."
- `.claude/rules/atlassian-sync.md` — the shared conventions for talking to Atlassian.
- `explain-skills/gallery.md` — the other handoff-shaped skill: it packages diagrams into one file, while this one keeps a living page truthful.
