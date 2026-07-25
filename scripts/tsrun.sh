#!/usr/bin/env bash
# tsrun.sh — run a TypeScript (.ts) script with tsx, locating tsx across install modes.
#
# The kit's scripts are TypeScript source (.ts); they run via tsx (no separate compile step).
# tsx is installed by:
#   - plugin mode: the SessionStart hook npm-installs the BPMN engine package.json (which lists
#     tsx) into ${CLAUDE_PLUGIN_DATA}/node_modules.
#   - copy mode:   install.sh runs `npm install` inside skills/bpmn/engine/ → tsx in its node_modules.
#   - dev/global:  `npm install` at the repo root, or a global `tsx`.
#
#   bash tsrun.sh <script.ts> [args...]
#
# Locates tsx in priority order; falls back to `npx tsx` (may download once) if none is present.
set -euo pipefail

SCRIPT="${1:?need a .ts path}"
[ $# -gt 0 ] && shift

ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

# Resolve a relative script path against the kit ROOT (cwd is the user's project, not the kit).
case "$SCRIPT" in
  /*) ;;
  *) SCRIPT="$ROOT/$SCRIPT" ;;
esac

tsx_bin=""
# 1. plugin data dir (plugin mode — installed by the SessionStart hook)
if [ -n "${CLAUDE_PLUGIN_DATA:-}" ] && [ -x "$CLAUDE_PLUGIN_DATA/node_modules/.bin/tsx" ]; then
  tsx_bin="$CLAUDE_PLUGIN_DATA/node_modules/.bin/tsx"
fi
# 2. kit-local root node_modules (dev / copy-mode repo)
[ -n "$tsx_bin" ] || { [ -x "$ROOT/node_modules/.bin/tsx" ] && tsx_bin="$ROOT/node_modules/.bin/tsx"; }
# 3. BPMN engine node_modules (copy mode — install.sh npm-installs the engine, which lists tsx)
[ -n "$tsx_bin" ] || { [ -x "$ROOT/skills/bpmn/engine/node_modules/.bin/tsx" ] && tsx_bin="$ROOT/skills/bpmn/engine/node_modules/.bin/tsx"; }
# 4. global tsx on PATH
[ -n "$tsx_bin" ] || tsx_bin="$(command -v tsx 2>/dev/null || true)"

if [ -z "$tsx_bin" ]; then
  echo "⚠️  tsx not found — using npx (may download tsx once). For a quiet install, run the kit's SessionStart hook / install.sh, or: npm i -g tsx" >&2
  exec npx --yes tsx "$SCRIPT" "$@"
fi

exec "$tsx_bin" "$SCRIPT" "$@"
