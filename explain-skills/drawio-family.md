---
type: skill-explainer
skill: drawio-family
updated: 2026-07-26
---

# Five commands that draw in draw.io — which one to pick?

**English** · [Tiếng Việt](drawio-family.vi.md)

> This document explains **how the five `/drawio-*` commands relate** to each other. Four of them draw **cloud architecture with the vendor's official icons** — `/drawio-aws`, `/drawio-azure`, `/drawio-gcp`, `/drawio-databricks` — and the fifth, `/drawio-sequence`, draws a **UML sequence diagram**. All five produce the same kind of deliverable: an **editable `.drawio` file**.

## 1. Why do draw.io commands exist next to the D2 / C4 ones?

The toolkit already has commands that draw architecture: `/d2-architect` (a quick one-level context picture) and `/system-design` (a multi-level C4 drawing). Both draw with **generic boxes** — a database is a rectangle labeled "Database," a queue is a rectangle labeled "Queue." That is exactly what a **logical** picture should look like: the reader focuses on responsibilities and relationships, not on which vendor product sits behind each box.

But some audiences think in **the vendor's products**, not in logical roles. In an AWS architecture review, the cloud engineers don't ask "what is your storage component?" — they ask "is that S3 or EFS? Is the Lambda inside a private subnet?" For that conversation you want a picture where **every service carries its official icon**: the orange Lambda symbol, the green S3 bucket. A cloud team recognizes those shapes at a glance, faster than reading any label. That is what the `/drawio-*` commands are for — **cloud-brand-accurate** pictures.

There is a second difference, just as practical: **the output format**. The D2 commands hand you a finished image. The `/drawio-*` commands hand you a `.drawio` file — a **live diagram** that anyone can open in the free draw.io app (or the web version diagrams.net, or the VS Code draw.io extension) and keep editing by hand: drag a box, add a note, move an arrow. That makes it the right deliverable when an architect or a customer wants to **take the picture over** and evolve it themselves.

**One sentence to remember:** generic logical picture → the D2 commands; the real cloud services with official icons, in a file people can edit by hand → the `/drawio-*` family.

---

## 2. Quick-pick table

If you only read one part, read this table:

```
 QUESTION                                            → PICK COMMAND

 Architecture runs on AWS (S3, Lambda, VPC, RDS...)
 and the picture must show official AWS icons?       → /drawio-aws

 Architecture runs on Microsoft Azure (AKS,
 Cosmos DB, Application Gateway, Key Vault...)?      → /drawio-azure

 Architecture runs on Google Cloud (GKE, Cloud SQL,
 BigQuery, Cloud Storage...)?                        → /drawio-gcp

 A Databricks lakehouse / data-platform picture
 (Delta Lake, SQL Warehouse, Unity Catalog...)?      → /drawio-databricks

 "Who calls whom, in what order" — and you want a
 STANDALONE, hand-editable diagram file?             → /drawio-sequence

 "Who calls whom" but embedded INSIDE the feature's
 Markdown documentation (shows on GitHub)?           → /sequence  (Mermaid — see its own explainer)

 A logical architecture picture, no vendor
 branding needed?                                    → /d2-architect or /system-design
```

Two rules of thumb: pick the **cloud command by where the system actually runs** (they are the same tool underneath, only the icon set changes), and for sequence diagrams ask **"where will people read it?"** — inside the docs → `/sequence` (Mermaid), as a standalone file someone will open and edit → `/drawio-sequence`.

---

## 3. The five commands side by side

| | `/drawio-aws` | `/drawio-azure` | `/drawio-gcp` | `/drawio-databricks` | `/drawio-sequence` |
|---|---|---|---|---|---|
| **Draws** | AWS architecture | Azure architecture | Google Cloud architecture | Databricks lakehouse | UML sequence (lifelines + messages over time) |
| **Icons** | official AWS | official Azure | official GCP | official Databricks | none — plain headers (a stick figure for human actors) |
| **Icon catalog** | ships with the kit | downloaded once on first use (~13MB) | downloaded once on first use (~2MB) | ships with the kit (~400KB) | not needed |
| **Typical occasion** | AWS review / Well-Architected discussion | Azure design review | GCP design review | data-platform / ML architecture | request-response walkthrough with devs or partners |

All four cloud commands accept the same topology hint (`--type pipeline | network | hierarchy | hubspoke | mesh | sequence`) that describes the **shape of the flow** — left-to-right pipeline, VPC/network layout, hub with spokes... — so the layout engine knows how to arrange the picture. You rarely need it: the default `pipeline` fits most feature-level architectures.

---

## 4. The run — one shared flow

All five commands run through the same steps, with two safety mechanisms worth knowing in advance: an **approval gate** (nothing is written until you say yes) and a **validation hard gate** (a broken diagram is never delivered).

```
 YOU TYPE THE COMMAND
 /drawio-aws "serverless upload pipeline" --feature upload
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 1 — Understand the architecture                  │
 │  Reads existing docs (system overview, feature spec). │
 │  Nothing to read → interviews you: which services,    │
 │  what is the main flow. Does NOT invent services.     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 2 — Preview, ask permission (approval gate)      │
 │  Plain-language plan: "N services, this flow, this    │
 │  topology, output file here." You nod (Y) → continue. │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 3 — Look up every icon in the stencil catalog    │
 │  One batch search ("s3, lambda, dynamodb...") against │
 │  the vendor's ground-truth catalog. Only names the    │
 │  catalog returns may be used. (Skipped for            │
 │  /drawio-sequence — it uses no cloud icons.)          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 4 — Write the build-script {slug}.src.ts         │
 │  A small script that DECLARES the picture: which      │
 │  icons, which groups, which arrows. No coordinates —  │
 │  the layout engine computes every position itself.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 5 — Build + validate (HARD GATE)                 │
 │  The engine checks: every stencil exists, no dangling │
 │  arrows, correct nesting (e.g. VPC→AZ→Subnet), no     │
 │  overlaps. ANY error → the .drawio is NOT written;    │
 │  the system fixes the build-script and reruns.        │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ STEP 6 — Deliver                                      │
 │  {slug}.drawio in docs/{feature}/drawio/ — open it in │
 │  the draw.io app / diagrams.net / VS Code extension.  │
 │  (+ {slug}.svg if the desktop app is installed.)      │
 └──────────────────────────────────────────────────────┘
```

Note what you keep at the end: **both files**. The `.drawio` is the picture; the `.src.ts` build-script is the *recipe* for the picture. When the architecture changes, you rerun the command — it updates the recipe and rebuilds, rather than you untangling a hand-edited drawing.

---

## 5. Why look every icon up in a catalog? (the anti-hallucination step)

This is the family's signature move, and it exists because of a real failure mode. AWS alone has hundreds of services, and inside a draw.io file each icon is referenced by an exact internal code name (in the style of `mxgraph.aws4.something`). An AI writing those names **from memory** will sooner or later produce one that *sounds* right but doesn't exist — say `s3_storage` instead of the real name. The resulting file would open with blank or broken shapes, and you'd only find out when you looked at it.

So the rule is: **memory is never trusted; the catalog is the ground truth.** Every icon name must come out of a search against the vendor's real stencil catalog (Step 3), and the validator re-checks every name again at build time (Step 5). A wrong name is caught **before the file is written** — the error message even suggests close matches — instead of surfacing as a broken picture on your screen. The same hard gate also enforces design rules per vendor: AWS containers must nest Cloud→Region→VPC→AZ→Subnet, and the validator will even raise **advice** (not errors) when it spots a real design smell in your diagram, like a database sitting in a public subnet.

---

## 6. Why do Azure and GCP need a one-time download?

Those ground-truth catalogs are big — the Azure one is ~13MB, mostly embedded icon images. Shipping all of them with the kit would bloat it for everyone, including people who never draw Azure. So the kit ships the AWS and Databricks catalogs in-repo, and fetches the Azure and GCP ones **on demand, once**:

```
bash scripts/drawio-catalog-ensure.sh azure   # or: gcp
```

You normally don't run this yourself — the first time you call `/drawio-azure` or `/drawio-gcp`, the command notices the catalog is missing and fetches it (or tells you the one-line fix). After that first run it's cached locally and never downloaded again.

---

## 7. What you receive, and how to open it

- **`{slug}.drawio`** — the deliverable. It opens in three free places: the **draw.io desktop app**, the **web app** (app.diagrams.net), or the **VS Code draw.io extension**. Anyone on the team can edit it by hand there.
- **`{slug}.src.ts`** — the build-script (the recipe). Keep it next to the `.drawio`; it's what makes updates cheap.
- **`{slug}.svg`** — optional. Exporting PNG/SVG requires the **draw.io desktop app** installed; without it, nothing fails — you simply get the `.drawio` only, which is still fully usable.

Like the other diagram commands in this kit, there is no look-and-edit loop in the chat window — draw.io XML doesn't render in chat. You review the real picture in draw.io, then either **edit it by hand there** (it's your file now) or **call the command again** with the change and let it rebuild.

---

## 8. A real-world example

**Minh**, a developer doing BA work, has to present the "upload" feature's architecture to the customer's cloud team. Last time he showed a generic box diagram, the first question was *"which storage is this exactly?"* — so this time he wants the real AWS icons. He types:

```
/drawio-aws "users upload files via CloudFront + S3; API Gateway → Lambda → DynamoDB for metadata; an S3 event triggers a thumbnail Lambda" --feature upload
```

1. The system reads the existing `upload` docs to confirm the services and the flow — nothing to invent.
2. It previews in plain language: *"6 services (CloudFront, S3, API Gateway, 2× Lambda, DynamoDB), pipeline topology, output `docs/upload/drawio/upload-aws.drawio`. Apply?"* Minh types `Y`.
3. It searches the AWS catalog in one batch — "cloudfront, s3, api gateway, lambda, dynamodb" — and gets back the exact official stencil name for each service.
4. It writes `upload-aws.src.ts`: just the topology and the arrows, no coordinates.
5. Build + validate: the first run fails — one stencil name was mistyped — and the validator rejects the file *with a suggestion for the correct name*. The system fixes the build-script, reruns, and the gate passes clean.
6. Minh gets `upload-aws.drawio`. He opens it on app.diagrams.net — every service wears its official icon. In the review, the customer's architect opens the very same file and drags in two annotation notes himself. No special tooling on their side.

A week later the same architect asks to walk through the upload **call sequence** — and wants to edit the picture live in a workshop. Minh uses `/drawio-sequence "browser → API Gateway → Lambda → DynamoDB, with the async thumbnail event" --feature upload`, which produces a standalone, hand-editable sequence file. (If it had been for the team's own docs on GitHub, he'd have used `/sequence` instead — Mermaid, embedded right in the Markdown.)

---

## See also

This document explains the family at an easy-to-understand level. Full technical details live in the source files: `skills/drawio-aws/SKILL.md`, `skills/drawio-azure/SKILL.md`, `skills/drawio-gcp/SKILL.md`, `skills/drawio-databricks/SKILL.md`, `skills/drawio-sequence/SKILL.md`.

Related explainers in the same toolkit:

- `explain-skills/d2-architect.md` — `/d2-architect`, the **generic-box logical architecture** picture (D2). Reach for it when vendor branding doesn't matter.
- `explain-skills/sequence.md` — `/sequence`, the **Mermaid sequence diagram embedded in the docs**. Same question ("who calls whom, in what order"), different home for the picture.
- The full rule for choosing a diagram type across the whole kit lives in the source file: `.claude/rules/diagram-selection.md`.
