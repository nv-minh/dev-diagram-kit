#!/usr/bin/env bash
# context-load.sh — emit the Tier-1 project context (docs/_shared/project-context.md),
# prefixed with a STALE banner when git drift exceeds the file's staleness_budget_commits.
#
# Pasted into consuming skills' ## Context (dynamic) block as:
#   Project context: !`bash "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/context-load.sh"`
#
# Three states:
#   1. No docs/_shared/project-context.md → print a hint, exit 0.
#   2. Present + fresh (commits since source_watermark ≤ staleness_budget_commits) → emit verbatim.
#   3. Present + stale (drift > budget) → emit a loud banner, then the content.
#
# Staleness = git commits between the recorded source_watermark (HEAD at scan time) and the
# current HEAD, vs the file's staleness_budget_commits (default 200). profile_hash is stamped
# by /discover for traceability but not recomputed here (the scanned input set isn't recorded).
# Always exits 0 so the Context block never errors.
set -u

PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CTX="$PROJ/docs/_shared/project-context.md"

if [ ! -f "$CTX" ]; then
  echo "(no project context — run /discover for more accurate output)"
  exit 0
fi

# Extract a frontmatter value (first match) from the top --- block.
fm() { awk -v k="$1" '/^---$/{f++} f==1 && $0 ~ "^"k":"{sub("^"k":[ \t]*",""); print; exit}' "$CTX"; }

WATERMARK="$(fm source_watermark)"
BUDGET="$(fm staleness_budget_commits)"
[ -n "$BUDGET" ] || BUDGET=200

# Compute commit drift only inside a git repo with a valid watermark commit.
if [ -n "$WATERMARK" ] && git -C "$PROJ" rev-parse --is-inside-work-tree >/dev/null 2>&1 \
   && git -C "$PROJ" cat-file -e "${WATERMARK}^{commit}" 2>/dev/null; then
  DRIFT="$(git -C "$PROJ" rev-list --count "${WATERMARK}..HEAD" 2>/dev/null || true)"
  if [ -n "$DRIFT" ] && [ "$DRIFT" -gt "$BUDGET" ] 2>/dev/null; then
    printf '⚠️ PROJECT CONTEXT IS STALE (%s commits since scan; budget %s). Treat every claim below as a HINT, not fact — verify against code before relying on it. Re-run /discover.\n\n' "$DRIFT" "$BUDGET"
  fi
fi

cat "$CTX"
exit 0
