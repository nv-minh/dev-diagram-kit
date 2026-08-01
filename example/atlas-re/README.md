# Atlas Re — worked example (one diagram per skill)

> A *fictional, anonymized* reinsurance underwriting platform (see [`DOMAIN.md`](./DOMAIN.md)) used to
> showcase **every** diagram skill in the kit — including the draw.io cloud-architecture skills and the
> new node-shape catalog (`rules/node-shapes.md`): gateways are hexagons, caches `stored_data`, DBs
> cylinders, queues `queue`, CDNs `cloud`, pipelines `parallelogram`. Every artifact below is generated
> by the skill's real render pipeline and passes `diagram-validate`.

## Documents (wave 1 — the requirements chain)

The full discovery chain for one feature slice, **claim approval**, cross-linked with the diagrams below (the swimlane, BPMN process, and state machines cover the same domain). Every doc passes `doc-validate` in CI.

| Skill | What it shows | File |
|---|---|---|
| `/brainstorm` | The idea, decisions, and Open Questions that seed the chain | [`brainstorms/claim-approval-idea.md`](./brainstorms/claim-approval-idea.md) |
| `/urd` | Personas + user needs (mints `UN-atlas-re-001…006`) | [`atlas-re-urd.md`](./atlas-re-urd.md) |
| `/brd` | Business objectives covering those needs (`BO-` ← `UN-`) | [`atlas-re-brd.md`](./atlas-re-brd.md) |
| `/prd-epic` | Capabilities P0/P1/P2 covering the objectives (`CAP-` ← `BO-`) | [`atlas-re-prd.md`](./atlas-re-prd.md) |
| `/srs` | Testable FRs, NFRs, rules, error matrix (`FR-/NFR-/BR-/E-` ← `CAP-`) | [`srs/atlas-re-spec.md`](./srs/atlas-re-spec.md) |

Follow one thread to see the spine: `UN-atlas-re-005` (approvals without the Head of Claims) → `BO-atlas-re-03` (remove the bottleneck) → `CAP-atlas-re-04` (tier routing) → `FR-atlas-re-006` + `BR-atlas-re-001` + `E-atlas-re-002`. Note how the one unresolved OQ (committee quorum) cascades from the brainstorm all the way into the SRS instead of being silently answered.

## Documents (wave 2 — specification)

The same claim-approval slice carried into the spec artifacts. Note the content/metadata split: `uc-*.md` and `us-*.md` are zero-frontmatter prose; status, FR links, and jira-keys live in the two index files.

| Skill | What it shows | File |
|---|---|---|
| `/usecase` | Cockburn UC — MSS + extensions, each citing its `E-` code | [`usecases/uc-approve-claim.md`](./usecases/uc-approve-claim.md) |
| `/usecase` (+`/usecase-diagram`) | The index whose table IS the traceability matrix (UC↔FR↔Screen↔Error↔OQ) + CRUD matrix | [`usecases/atlas-re-usecase-index.md`](./usecases/atlas-re-usecase-index.md) |
| `/userstory` | INVEST slices of the FRs (`US-001…003`) + coverage map | [`userstories/atlas-re-story-index.md`](./userstories/atlas-re-story-index.md) |
| `/ac` | Full Given-When-Then in US-001 — boundary triple at/below/above 50k + one AC per error code | [`userstories/us-001.md`](./userstories/us-001.md) |
| `/user-flow` | Flow division (`approve-claim`, `review-history`) + numbered screens `[1]…[6]`, `stage: approved` + hash | [`srs/atlas-re-userflow.md`](./srs/atlas-re-userflow.md) |

The thread continues: `FR-atlas-re-006` → `UC-approve-claim` (extensions 3a/3b) → `US-001` (AC-002/003 pin the 50k boundary) → screens `[2][3][4]`. The quorum OQ is still open — it now blocks US-001's committee-tier ACs, visibly.

## Documents (wave 3 — UI design)

The `approve-claim` flow drawn as ASCII wireframes with the 5-column description tables — every control cited back to the SRS (FR/BR/E-), device desktop 1024. The HTML/prototype shells (`skills/wireframe-html/resources/`, `skills/prototype-html/resources/`) show the next fidelities.

| Skill | What it shows | File |
|---|---|---|
| `/wireframe-ascii` | Screens `[1]…[4]` — ASCII frames + 5-column description tables (6 layers each, sourced) | [`ascii-wireframe/approve-claim.md`](./ascii-wireframe/approve-claim.md) |
| `/wireframe-ascii` | Screen index — metadata + per-screen purpose, 6 screens across 2 flows | [`ascii-wireframe/atlas-re-wireframe-index.md`](./ascii-wireframe/atlas-re-wireframe-index.md) |

The thread reaches the screen: `FR-atlas-re-006` (tier routing) → screen `[3]` Decision panel, where `E-atlas-re-001` (validator conflict) and `E-atlas-re-004` (concurrency) surface as button-level errors in the description table.

## Documents (wave 4 — testing, traceability & change)

The verification tail of the spine: the test outline + cases, the cross-doc coverage report from a real `/gap` run, and a sample Change Request.

| Skill | What it shows | File |
|---|---|---|
| `/test-checklist` | 9 `CHK-` rows derived from the spec's FR/E + the story ACs, layered functional/boundary/error/non-functional | [`test/checklist/atlas-re-checklist-index.md`](./test/checklist/atlas-re-checklist-index.md) |
| `/test-cases` | 11 `TC-` expanding the checklist — boundary 50k → at/below/above triple, errors → one TC per `E-` | [`test/testcases/atlas-re-testcase-index.md`](./test/testcases/atlas-re-testcase-index.md) |
| `/gap` | The traceability report — spine intact, 3 deliberately-unsliced FRs surfaced as a visible decision | [`_shared/traceability.md`](./_shared/traceability.md) |
| `/cr` | A threshold change (50k→60k) with its full Impact Matrix + dependency-ordered Apply plan + Rollback | [`cr/CR-20260801-001.md`](./cr/CR-20260801-001.md) |

The spine is now provably complete end to end: `UN-005 → BO-03 → CAP-04 → FR-006 → UC-approve-claim → US-001 → AC-002/003 → CHK-002 → TC-002/003/004`. The `/gap` report confirms zero uncited error codes; the CR shows how a one-number change propagates in safe dependency order.

## Documents (wave 5 — API integration)

The integration chain documented ahead of the spec slice: a fictional **CatModel** catastrophe-model provider feeding the pricing engine.

**In this example (artifact committed):** digest → blueprint → map — the path that shows provenance, webhook⇄reconciliation pairing, and source-of-truth ownership.

| Skill | Status in example | File |
|---|---|---|
| `/api-doc` | artifact | [`integration/api-summary-catmodel.md`](./integration/api-summary-catmodel.md) |
| `/api-design` | artifact | [`integration/api-design.md`](./integration/api-design.md) |
| `/api-map` | artifact | [`integration/api-map.md`](./integration/api-map.md) |
| `/api-assess` · `/api-checklist` · `/api-test` · `/api-readiness` | guide-only | See `guides/07-api-and-delivery.md` — not committed here (provider scorecard / Bruno collection / go-live pack are session- or secrets-shaped) |

Note the disciplines in the committed trio: the `quote.completed` webhook is paired with a polling reconciliation (no silent data loss); `loss_estimate` is explicitly `theirs` (CatModel authority) while `priced_at` is `derived`; the currency transform cites the same BR-atlas-re-001 FX path the claim-approval spine uses.

## Documents (wave 6 — delivery)

| Skill | Status in example | File |
|---|---|---|
| `/meeting` | artifact | [`meetings/2026-08-01-review-authority-threshold.md`](./meetings/2026-08-01-review-authority-threshold.md) |
| `/jira` · `/confluence` · `/export` · `/userguide` · `/inbox` · `/doc-review` · `/dashboard` | guide-only | External-write or large generated output — documented in `guides/07-api-and-delivery.md`, not committed as fixtures |

This meeting is the origin of `CR-20260801-001` (the 50k→60k threshold change) — follow the decision's `Affects` link to the SRS, then to the CR's Impact Matrix, to see how a discussion becomes a traced change.

## Diagrams

### Batch 1 — core
| Skill | What it shows | File |
|---|---|---|
| `/d2-architect` | system architecture (FE → API Gateway → services → Postgres + Redis + Kafka) | [`d2-architect/atlas-re.d2`](./d2-architect/atlas-re.d2) → `.svg` |
| `/system-design` | C4 Context + Container (+ HTML deck) | [`system-design/`](./system-design/) |
| `/erd` | data model (inline) | [`srs/atlas-re-erd.md`](./srs/atlas-re-erd.md) |
| `/d2-erd` | data model (standalone) | [`d2-erd/atlas-re.d2`](./d2-erd/atlas-re.d2) → `.svg` |
| `/sequence` | submission → quote → bind flow | [`srs/atlas-re-flows.md`](./srs/atlas-re-flows.md) |
| `/state` | Contract + Claim state machines | [`srs/atlas-re-states.md`](./srs/atlas-re-states.md) |
| `/dbdiagram` | DBML schema (types/enums/indexes) | [`dbdiagram/atlas-re.dbml`](./dbdiagram/atlas-re.dbml) |
| `/drawio-azure` | Azure architecture (App Gateway → AKS → Postgres + Redis + Service Bus) | [`drawio/atlas-re-azure.drawio`](./drawio/atlas-re-azure.drawio) |

### Batch 2 — the rest
| Skill | What it shows | File |
|---|---|---|
| `/activity` | claim registration (compact flow) | [`srs/atlas-re-flows.md`](./srs/atlas-re-flows.md) |
| `/activity-swimlane` | claim approval (4 roles, real lanes) | [`activity-swimlane/`](./activity-swimlane/) |
| `/d2-activity` | claim with appeal/reopen branches | [`d2-activity/atlas-re.d2`](./d2-activity/atlas-re.d2) |
| `/dfd` | data flow (Insured → submission → pricing → contract → claim → payment) | [`dfd/`](./dfd/) |
| `/journey` | underwriter submission-to-bind (10 steps + satisfaction) | [`srs/atlas-re-journey.md`](./srs/atlas-re-journey.md) |
| `/mindmap` | scope decomposition | [`srs/atlas-re-scope.md`](./srs/atlas-re-scope.md) |
| `/timeline` | roadmap milestones | [`atlas-re-timeline.md`](./atlas-re-timeline.md) |
| `/orgchart` | reporting tree + stakeholder power/interest | [`orgchart/`](./orgchart/) |
| `/bpmn` | claim approval (OMG, multi-lane) | [`bpmn/`](./bpmn/) |
| `/usecase-diagram` | actors + use cases | [`usecases/`](./usecases/) |
| `/code-flow` | trace `bindContract()` (sample code, no real paths) | [`code-flow/`](./code-flow/) |
| `/drawio-aws` | fabricated AWS migration | [`drawio/atlas-re-aws.drawio`](./drawio/atlas-re-aws.drawio) |
| `/drawio-gcp` | fabricated GCP migration | [`drawio/atlas-re-gcp.drawio`](./drawio/atlas-re-gcp.drawio) |
| `/drawio-databricks` | fabricated analytics lakehouse | [`drawio/atlas-re-databricks.drawio`](./drawio/atlas-re-databricks.drawio) |
| `/drawio-sequence` | bind flow as UML sequence (service-to-service + event fan-out) | [`drawio/atlas-re-sequence.drawio`](./drawio/atlas-re-sequence.drawio) |

## Regenerate

```bash
# D2 family
bash skills/d2-activity/render.sh example/atlas-re/d2-architect/atlas-re.d2
# Mermaid (compile-check + PNGs)
bash scripts/tsrun.sh scripts/mermaid-verify.ts --file example/atlas-re/srs/atlas-re-flows.md --png example/atlas-re/_rendered
# draw.io
bash scripts/tsrun.sh skills/drawio/engine/drawio-build.ts --dir example/atlas-re/drawio --cloud azure
# BPMN
bash scripts/tsrun.sh skills/bpmn/engine/bpmn-build.ts --dir example/atlas-re/bpmn
# validate everything
bash scripts/tsrun.sh scripts/diagram-validate.ts example/atlas-re
```

## Privacy

`DOMAIN.md` is anonymized — no real project names, fields, or paths. (A grep for the source project's name across this folder returns 0 hits.)
