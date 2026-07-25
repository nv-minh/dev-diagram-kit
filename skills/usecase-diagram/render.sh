#!/usr/bin/env bash
# render.sh — compile one .puml (use case) → .svg, LOCAL-FIRST with server fallback.
#
# Order: (1) local java + plantuml.jar (content stays on this machine) →
#        (2) public plantuml.com server (content is sent over the internet — privacy gotcha).
# Enable offline once:  bash scripts/plantuml-ensure.sh   (downloads plantuml.jar; needs java).
# (Same local-first / server-fallback policy as activity-swimlane/render.sh.)
#
#   ./render.sh <file.puml>            → produces <file>.svg
#
# Exit != 0 if both local and server fail (the skill must tell the user, NOT write a broken diagram).

set -euo pipefail

SRC="${1:?Need the path to a .puml file}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENCODER="$SCRIPT_DIR/plantuml_encode.py"

ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
JAR="${PLANTUML_JAR:-$ROOT/assets/plantuml/plantuml.jar}"

[ -f "$SRC" ] || { echo "❌ File not found: $SRC"; exit 1; }
SVG="${SRC%.puml}.svg"

# ---------- (1) LOCAL: java + plantuml.jar ----------
if [ -f "$JAR" ] && command -v java >/dev/null 2>&1; then
  if java -jar "$JAR" -charset UTF-8 -tsvg "$SRC" >/dev/null 2>&1 \
     && [ -f "$SVG" ] && [ "$(wc -c < "$SVG" | tr -d ' ')" -ge 200 ] \
     && ! grep -q "Syntax Error\|An error has occured\|cannot find message" "$SVG" 2>/dev/null; then
    echo "✅ SVG: $SVG (rendered locally with java — content stayed on this machine)"
    exit 0
  fi
  echo "❌ Local PlantUML produced an error — open $SVG for the error-line details (likely a .puml syntax error)."
  exit 1
fi

# ---------- (2) FALLBACK: public server (content sent online) ----------
echo "⚠️  No local plantuml.jar/java — rendering via plantuml.com (content is sent over the internet)."
echo "    Run \`bash scripts/plantuml-ensure.sh\` once to enable offline rendering."

[ -f "$ENCODER" ] || { echo "❌ Missing $ENCODER"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 required (PlantUML encode). Not found."; exit 1; }

ENCODED="$(python3 "$ENCODER" "$SRC")" || { echo "❌ PlantUML encode failed — check the syntax of $SRC"; exit 1; }

URL="https://www.plantuml.com/plantuml/svg/${ENCODED}"
HTTP_CODE="$(curl -s -o "$SVG" -w "%{http_code}" --max-time 15 "$URL" || echo "000")"

if [ "$HTTP_CODE" != "200" ]; then
  rm -f "$SVG"
  echo "❌ PlantUML render failed (HTTP $HTTP_CODE). Check (1) internet reach to plantuml.com, (2) .puml syntax."
  exit 1
fi

SIZE="$(wc -c < "$SVG" | tr -d ' ')"
if [ "$SIZE" -lt 200 ]; then
  echo "⚠️  Returned SVG is suspiciously small (${SIZE} bytes) — likely a .puml syntax error. Open $SVG."
  exit 1
fi
echo "✅ SVG: $SVG (via plantuml.com)"
