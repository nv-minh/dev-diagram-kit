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
