#!/usr/bin/env bash
# render.sh — compile one .puml file (activity swimlane) → .svg via the public PlantUML server.
#
# No local Java/plantuml.jar — this machine has no Java runtime. Use the public server
# plantuml.com, like the way /usecase-diagram renders. TRADE-OFF confirmed with the user: the
# diagram content (lane / step names) is sent over the internet to plantuml.com on every render — if the
# content is sensitive, do NOT use this skill; consider installing Java locally instead.
#
#   ./render.sh <file.puml>            → produces <file>.svg
#   ./render.sh <file.puml> --png      → also produces <file>.png (for export / quick preview)
#
# Exit != 0 if encode/network/server fails (the skill must tell the user, NOT write a broken diagram).

set -euo pipefail

SRC="${1:?Need the path to a .puml file}"
WANT_PNG="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENCODER="$SCRIPT_DIR/plantuml_encode.py"

[ -f "$SRC" ] || { echo "❌ File not found: $SRC"; exit 1; }
[ -f "$ENCODER" ] || { echo "❌ Missing $ENCODER"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 required (used to encode PlantUML). Not found."; exit 1; }

SVG="${SRC%.puml}.svg"

ENCODED="$(python3 "$ENCODER" "$SRC")" || { echo "❌ PlantUML encode failed — check the syntax of $SRC"; exit 1; }

URL="https://www.plantuml.com/plantuml/svg/${ENCODED}"
HTTP_CODE="$(curl -s -o "$SVG" -w "%{http_code}" --max-time 20 "$URL" || echo "000")"

if [ "$HTTP_CODE" != "200" ]; then
  rm -f "$SVG"
  echo "❌ PlantUML render failed (HTTP $HTTP_CODE). Check: (1) whether the internet can reach plantuml.com, (2) whether the .puml syntax has errors (a server error also returns non-200 or an empty SVG)."
  exit 1
fi

# The server may return 200 yet still be a syntax-error image (PlantUML draws error text instead of a diagram) —
# quick check: a .svg file that is too small (<200 bytes) is almost certainly an error, not a real diagram.
SIZE="$(wc -c < "$SVG" | tr -d ' ')"
if [ "$SIZE" -lt 200 ]; then
  echo "⚠️  Returned SVG is suspiciously small (${SIZE} bytes) — likely a .puml syntax error. Open $SVG to inspect the error content PlantUML returned."
  exit 1
fi

# PlantUML embeds the syntax-error text RIGHT INSIDE the svg (without changing the HTTP code) — catch it here too.
if grep -q "Syntax Error\|An error has occured\|cannot find message" "$SVG" 2>/dev/null; then
  echo "❌ PlantUML reported a syntax error inside the SVG (server returned 200 but the content is an error message). Open $SVG for the error-line details."
  exit 1
fi

echo "✅ SVG: $SVG (via plantuml.com — content was sent over the internet; see the gotcha in SKILL.md if you need offline)"

if [ "$WANT_PNG" = "--png" ]; then
  PNG="${SRC%.puml}.png"
  PNG_URL="https://www.plantuml.com/plantuml/png/${ENCODED}"
  PNG_CODE="$(curl -s -o "$PNG" -w "%{http_code}" --max-time 20 "$PNG_URL" || echo "000")"
  if [ "$PNG_CODE" = "200" ] && [ "$(wc -c < "$PNG" | tr -d ' ')" -gt 500 ]; then
    echo "✅ PNG: $PNG"
  else
    rm -f "$PNG"
    echo "⚠️  PNG render failed (HTTP $PNG_CODE) — SVG is still OK, skipping PNG."
  fi
fi
