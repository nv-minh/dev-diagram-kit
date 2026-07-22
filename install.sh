#!/usr/bin/env bash
# install.sh — install the dev-diagram-kit into a workspace using copy mode (NO /plugin needed).
# Use when you want the skills to sit directly in the project's .claude/ (or your tool has no plugin support).
#
#   ./install.sh [workspace-path]      (default: current directory)
#
# If you use a Claude Code build with plugin support, the shorter way is:
#   /plugin marketplace add <this-repo-or-path>
#   /plugin install dev-diagram-kit
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-.}"
TARGET="$(cd "$TARGET" && pwd)"
DEST="$TARGET/.claude"

echo "📦 Installing dev-diagram-kit into: $DEST"
mkdir -p "$DEST/skills" "$DEST/agents" "$DEST/rules" "$DEST/scripts" "$DEST/templates" "$DEST/assets/icons"

cp -R "$SRC/skills/."    "$DEST/skills/"
cp -R "$SRC/agents/."    "$DEST/agents/"
cp -R "$SRC/rules/."     "$DEST/rules/"
cp -R "$SRC/scripts/."   "$DEST/scripts/"
cp -R "$SRC/templates/." "$DEST/templates/"
[ -d "$SRC/assets/icons" ] && cp -R "$SRC/assets/icons/." "$DEST/assets/icons/"

# Make the scripts executable (render.sh, doctor.sh, icon-path.sh).
find "$DEST/skills" -name '*.sh' -exec chmod +x {} \; 2>/dev/null || true
chmod +x "$DEST"/scripts/*.sh 2>/dev/null || true

echo "  ✅ Copied 14 skills + agents + rules + scripts + templates + assets/icons."

# BPMN engine: copy mode → node_modules live right inside the engine dir.
ENGINE="$DEST/skills/bpmn/engine"
if [ -f "$ENGINE/package.json" ] && command -v npm >/dev/null 2>&1; then
  echo "📦 npm install for the BPMN engine..."
  ( cd "$ENGINE" && npm install --silent --no-fund --no-audit ) && echo "  ✅ BPMN engine ready." \
    || echo "  ⚠️  npm install for the BPMN engine failed — run manually: (cd \"$ENGINE\" && npm install)"
elif [ -f "$ENGINE/package.json" ]; then
  echo "  ⚠️  npm not found — /bpmn needs: (cd \"$ENGINE\" && npm install) after installing Node."
fi

echo ""
echo "🩺 Running the render-tools health check:"
echo ""
bash "$DEST/scripts/doctor.sh" || true

echo ""
echo "Done. Open Claude Code at $TARGET then try:  /sequence \"...\" --feature demo"
