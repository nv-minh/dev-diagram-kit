#!/usr/bin/env sh
# SessionStart hook (plugin mode) — install node_modules for the BPMN engine into
# ${CLAUDE_PLUGIN_DATA} (a persistent dir that survives plugin updates). Idempotent:
# only npm install when package.json changes. NEVER blocks the session (always exits 0).
#
# Copy mode (installed via install.sh, no CLAUDE_PLUGIN_DATA) → skip; install.sh
# already npm-installed directly in .claude/skills/bpmn/engine/.
set -u

# Only run in plugin mode (this variable exists only when Claude Code loads a plugin).
[ -n "${CLAUDE_PLUGIN_DATA:-}" ] || exit 0
[ -n "${CLAUDE_PLUGIN_ROOT:-}" ] || exit 0
command -v npm >/dev/null 2>&1 || exit 0   # no npm → /bpmn will report it at run time

ENGINE="${CLAUDE_PLUGIN_ROOT}/skills/bpmn/engine"
[ -f "$ENGINE/package.json" ] || exit 0

mkdir -p "$CLAUDE_PLUGIN_DATA" 2>/dev/null || exit 0

# Already installed + package.json unchanged → nothing to redo.
if [ -d "$CLAUDE_PLUGIN_DATA/node_modules" ] && cmp -s "$ENGINE/package.json" "$CLAUDE_PLUGIN_DATA/package.json" 2>/dev/null; then
  exit 0
fi

cp "$ENGINE/package.json" "$CLAUDE_PLUGIN_DATA/package.json" 2>/dev/null || exit 0
[ -f "$ENGINE/package-lock.json" ] && cp "$ENGINE/package-lock.json" "$CLAUDE_PLUGIN_DATA/package-lock.json" 2>/dev/null

# Install inside CLAUDE_PLUGIN_DATA; /bpmn sets NODE_PATH=${CLAUDE_PLUGIN_DATA}/node_modules at run time.
( cd "$CLAUDE_PLUGIN_DATA" && npm install --silent --no-fund --no-audit ) >/dev/null 2>&1 \
  || rm -f "$CLAUDE_PLUGIN_DATA/package.json"   # fail → remove the marker so it retries next time

exit 0
