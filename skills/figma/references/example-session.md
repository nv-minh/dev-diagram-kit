<!--
REFERENCE for /figma — simulated session (external-write, dry-run shape).
Uses atlas-re wireframe screens [1]…[4].
-->

## Command

```
/figma atlas-re --flow approve-claim
```

**Gate:** wireframe index + Figma MCP authenticated.

## L1 hard gate preview

```
[/figma] EXTERNAL WRITE — will create/update frames in Figma:

  Target file: Atlas Re — Claim approval (team library)
  Page: approve-claim
  Frames:
    [1] Claim queue      — mirrors ascii-wireframe/approve-claim.md screen [1]
    [2] Claim detail     — …
    [3] Decision panel   — …
    [4] Confirmation     — …

This WRITES to Figma. Apply? (Y / n):
```

**You:** `Y`

## Skill calls Figma MCP

Creates frames · captures returned URLs · updates wireframe index Figma column.

## Output report

```
✅ Figma: 4 frame URLs recorded in atlas-re-wireframe-index.md
   No local file — URLs are the artifact
   doc-validate: OK (index links only)
```

If MCP unauthenticated → skill stops at preview with auth instructions (no silent skip).
