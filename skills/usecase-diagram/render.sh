#!/usr/bin/env bash
# render.sh — compile one .puml file → .svg via the public PlantUML server (plantuml.com).
#
# No local Java/plantuml.jar — this machine has no Java runtime. Use the public server
# instead, like the way the bpmn-js viewer uses a CDN. TRADE-OFF confirmed with the user: the
# diagram content (actor / use-case names) is sent over the internet to plantuml.com on every render — if
# the content is sensitive, do NOT use this skill; consider installing Java locally instead.
#
#   ./render.sh <file.puml>            → produces <file>.svg
#
# Exit != 0 if encode/network/server fails (the skill must tell the user, NOT write a broken diagram).

set -euo pipefail

SRC="${1:?Need the path to a .puml file}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENCODER="$SCRIPT_DIR/plantuml_encode.py"

[ -f "$SRC" ] || { echo "❌ File not found: $SRC"; exit 1; }
[ -f "$ENCODER" ] || { echo "❌ Missing $ENCODER"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 required (used to encode PlantUML). Not found."; exit 1; }

SVG="${SRC%.puml}.svg"

ENCODED="$(python3 "$ENCODER" "$SRC")" || { echo "❌ PlantUML encode failed — check the syntax of $SRC"; exit 1; }

URL="https://www.plantuml.com/plantuml/svg/${ENCODED}"

HTTP_CODE="$(curl -s -o "$SVG" -w "%{http_code}" --max-time 15 "$URL" || echo "000")"

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

echo "✅ SVG: $SVG (via plantuml.com — content was sent over the internet; see the gotcha in SKILL.md if you need offline)"
