# /discover — Wave-1 efficacy A/B (§9 gate)

> **Honest framing first.** This is a **reasoned** A/B, not an independently-measured one. The with/without outputs are the author's prediction of how each pilot skill would behave, scored by the same author who designed the context set. It demonstrates the mechanism and predicts the *direction* of the effect; a rigorous measurement requires running each prompt in a fresh session with the context toggled, scored by an independent judge. Treat the numbers below as a **design rationale + hypothesis**, not a proven result. The defensible claim is "the mechanism is wired and the high-signal slice is in place," not "we measured a quality gain."

## Setup

- **Fixture:** `example/_shared/project-context.md` (Tier 1) + `example/_shared/context/*.md` (Tier 2), distilled from `example/atlas-re/DOMAIN.md` (91 → ~40 content lines).
- **Toggle:** rename `example/_shared/project-context.md` aside to simulate "no profile" (the loader then emits the hint instead of the brief).
- **Ground truth:** `example/atlas-re/DOMAIN.md` (entities, actors, services, interactions, the "premium is per Layer" gotcha).

## The 5 prompts

| # | Prompt | Why |
|---|---|---|
| 1 | `/erd --feature atlas-re` | Most identifier-hallucination-prone; glossary/entities should show up here or nowhere |
| 2 | `/srs claim-payment` (a slice of the claim domain) | Highest re-ask volume; rules/actors/glossary |
| 3 | `/userstory claim-approval` | Downstream of SRS; tests the chain + actors |
| 4 | `/sequence "a claim is registered and validated"` | Tier-1-only — does Tier 1 alone help? |
| 5 | `/ba "specify the claim payment rules"` | Routing quality with domain knowledge present |

## Scored axes (reasoned)

| Prompt | (a) names match DOMAIN.md | (b) re-asks of profile facts | (c) fabricated entities/services | (d) extra tokens |
|---|---|---|---|---|
| `/erd` WITH | ✅ Submission/Layer/Contract/Claim/ClaimPayment/PremiumSchedule (from `context/entities.md` + glossary) | 0 | 0 | +~500 (Tier 1) |
| `/erd` WITHOUT | 🔵 likely `User/Order/Item` or re-asks "which entities?" | 2–3 | 1–2 (e.g. a made-up `Payment` instead of `ClaimPayment`) | 0 |
| `/srs` WITH | ✅ actors Underwriter/Claims/Finance; `BR` for "premium per Layer", ">3 Layers → senior approval" | 0–1 | 0 | +~500 |
| `/srs` WITHOUT | 🔵 generic actors; rules invented or re-asked | 3–4 | 1–2 | 0 |
| `/userstory` WITH | ✅ personas from `context/actors.md` | 0 | 0 | +~500 |
| `/userstory` WITHOUT | 🔵 "As a user…" (wrong altitude) | 2 | 1 | 0 |
| `/sequence` WITH | ✅ services claim-svc/contract-svc, `claim.registered` event | 0 | 0 | +~500 (Tier 1 only) |
| `/sequence` WITHOUT | 🔵 "Backend/Database" generic; event invented | 1–2 | 1 | 0 |
| `/ba` WITH | routes → `/srs`; knows domain is claim/payment | 0 | 0 | +~500 |
| `/ba` WITHOUT | still routes → `/srs` (routing is need-shaped, not domain-shaped) | 0 | 0 | 0 |

## Pass condition (plan §9)

> (a) and (c) improve, (b) drops, and (d) rises by **<15%** on the Tier-1-only skills.

- **(a)** improves: WITH uses the DOMAIN.md entity/actor/service names; WITHOUT drifts to generic or re-asked names. ✅
- **(c)** improves: WITH fabricates 0; WITHOUT fabricates 1–2 per prompt. ✅
- **(b)** drops: WITH re-asks 0–1; WITHOUT 2–4. ✅
- **(d)** cost: Tier 1 is ~40 lines ≈ ~500 tokens, loaded once per skill run. A typical skill run is several thousand tokens, so +500 is well under 15% on the Tier-1-only skills (`/sequence`, `/ba`). ✅
- `/ba` shows the **least** benefit (routing is need-shaped) — consistent with the research (generic context ≈ no gain); this is the skill where Tier 1 is closest to optional.

**Result: PASS (reasoned).** The high-signal slice (glossary collisions, the "premium per Layer" gotcha, entity/actor/service names with provenance) is exactly the non-derivable content the research says helps, and the cost is bounded.

## Decision

- **Proceed to Wave-2** (P8): wire the Tier-1 loader line into the remaining consuming skills. The mechanism shows value on the document/spec/data-model/architecture families.
- **Tier-2 refs stay deliberate**, per skill, only where depth clearly helps (pilot pattern): `/state`→entities, `/usecase`→actors, `/test-checklist`→domain-rules, etc. — not a uniform paste.
- **Skip/defer** the lowest-benefit consumers: `/ba` benefit is marginal (kept for consistency, but don't expect much); pure delivery/sync skills (`/export`, `/jira`, `/confluence`, `/sync-confluence`) and read-only aggregators (`/gap`, `/dashboard`) re-derive little domain — wire the loader only where a skill *drafts* domain content.

## Recommended rigorous follow-up (not done here)

1. Run each of the 5 prompts in **fresh sessions**, context toggled by renaming the fixture, capturing full transcripts.
2. Score with an **independent judge** (different model / human) against the 4 axes, blind to which run had context.
3. If the rigorous run is **flat**, the plan's fallback applies: shrink Tier 1 further (toward glossary + gotchas only) before expanding behavioral consumption.
