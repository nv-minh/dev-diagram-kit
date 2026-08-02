---
type: project-context-detail
status: approved
version: 1.0.0
updated: 2026-08-02
profile_hash: derived-from-DOMAIN-md
source_watermark: static-fixture-not-a-real-scan
links:
  - atlas-re/DOMAIN.md
---

# Actors — Atlas Re

> Tier 2 — actor detail + real-world authority. Read for stories / use cases. ✅ read · 🔵 inferred.

| Actor | System role | Real-world authority |
|---|---|---|
| Underwriter | `UNDERWRITER` | Prices + binds a Submission into a Contract. **Senior** underwriter approves >3-Layer submissions. 🔵 `DOMAIN.md:35` |
| Broker | `BROKER` | Creates Submissions on behalf of an Insured. May NOT bind (no underwrite authority). 🔵 `DOMAIN.md:14` |
| Finance | `FINANCE` | Owns Premium receipts + Claim payments. ✅ `DOMAIN.md:14` |
| Claims | `CLAIMS` | Registers + processes Claims; validates coverage vs Layers. ✅ `DOMAIN.md:14` |
| Admin | `ADMIN` | Platform administration. ✅ `DOMAIN.md:35` |

> Authority notes are inferred from the role enum + lifecycle; confirm against the real authorization policy before relying on them.
