#!/usr/bin/env bash
# doctor.sh — check the render tools for the dev-diagram-kit. Prints ✅/❌ + how to install.
# Run standalone: bash scripts/doctor.sh   (or .claude/scripts/doctor.sh after install)
# There's no dependency-declaration mechanism for plugins → this script is a manual "health check".
set -u

ok=0; warn=0; miss=0
green() { printf "  ✅ %s\n" "$1"; ok=$((ok+1)); }
yellow(){ printf "  ⚠️  %s\n" "$1"; warn=$((warn+1)); }
red()   { printf "  ❌ %s\n     ↳ %s\n" "$1" "$2"; miss=$((miss+1)); }

echo "🩺 dev-diagram-kit — render tools check"
echo ""

# Determine the skill-set root (plugin mode or copy mode) to locate the BPMN engine.
ROOT="${CLAUDE_PLUGIN_ROOT:-}"
if [ -z "$ROOT" ]; then
  SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  # scripts/doctor.sh (repo root) or .claude/scripts/doctor.sh (copy mode)
  ROOT="$(cd "$SELF_DIR/.." && pwd)"
fi

# Platform-aware install hints (the kit is developed macOS-first but must not confuse Linux users).
IS_MAC=false; [ "$(uname -s)" = "Darwin" ] && IS_MAC=true
if $IS_MAC; then
  PY_HINT="macOS: preinstalled; or brew install python"
  CURL_HINT="macOS: preinstalled"
else
  PY_HINT="Install via your package manager, e.g. apt/dnf install python3"
  CURL_HINT="Install via your package manager, e.g. apt/dnf install curl"
fi

echo "== General =="
if command -v node >/dev/null 2>&1; then green "node $(node --version)"; else red "node — NOT found (needed for Mermaid + BPMN + DBML)" "Install Node LTS: https://nodejs.org (or nvm)"; fi
if command -v npm  >/dev/null 2>&1; then green "npm $(npm --version)"; else red "npm — NOT found" "Bundled with Node LTS"; fi
if command -v python3 >/dev/null 2>&1; then green "python3 $(python3 --version 2>&1 | awk '{print $2}')"; else red "python3 — NOT found (needed for PlantUML encode)" "$PY_HINT"; fi
if command -v curl >/dev/null 2>&1; then green "curl"; else red "curl — NOT found (needed for PlantUML render via plantuml.com)" "$CURL_HINT"; fi

echo ""
echo "== Mermaid (/sequence /activity /state /erd) =="
if command -v mmdc >/dev/null 2>&1; then green "mmdc $(mmdc --version 2>/dev/null || echo '?')"; else red "mmdc (@mermaid-js/mermaid-cli) — NOT found" "npm i -g @mermaid-js/mermaid-cli"; fi
if find "$HOME/.puppeteer-cache/chrome" "$HOME/.cache/puppeteer/chrome" -name 'Google Chrome for Testing' 2>/dev/null | grep -q . ; then
  green "Chrome (puppeteer cache) — for PNG rendering"
elif command -v google-chrome-stable >/dev/null 2>&1 || command -v chromium >/dev/null 2>&1; then
  green "System Chrome/Chromium — for PNG rendering"
else
  yellow "Chrome not found — Mermaid/D2 still produce SVG, only PNG is missing. (npx puppeteer browsers install chrome)"
fi

echo ""
echo "== D2 (/d2-activity /d2-erd /d2-architect /system-design) =="
if [ -x "$HOME/.local/bin/d2" ]; then green "d2 $("$HOME/.local/bin/d2" --version 2>/dev/null)";
elif command -v d2 >/dev/null 2>&1; then green "d2 $(d2 --version 2>/dev/null)";
else red "d2 — NOT found" "curl -fsSL https://d2lang.com/install.sh | sh -s --"; fi

echo ""
echo "== Icons (/d2-architect /system-design /scan-project) =="
ICONS_DIR="$ROOT/assets/icons"; [ -d "$ICONS_DIR" ] || ICONS_DIR="$ROOT/.claude/assets/icons"
if [ -d "$ICONS_DIR" ] && [ "$(ls "$ICONS_DIR"/*.svg 2>/dev/null | wc -l | tr -d ' ')" -gt 0 ]; then
  green "icon bundle: $(ls "$ICONS_DIR"/*.svg 2>/dev/null | wc -l | tr -d ' ') offline icons"
else
  yellow "No icon bundle — skills use the Devicon CDN (needs network at render time; output is still self-contained after compile)"
fi

echo ""
echo "== DBML (/dbdiagram) =="
if command -v dbml2sql >/dev/null 2>&1; then green "@dbml/cli (dbml2sql)"; else red "@dbml/cli — NOT found (only needed when exporting SQL)" "npm i -g @dbml/cli"; fi

echo ""
echo "== PlantUML (/activity-swimlane /usecase-diagram) =="
if command -v java >/dev/null 2>&1; then
  green "java $(java -version 2>&1 | head -1 | awk -F\" '{print $2}')"
  PLANTUML_JAR_PATH="${PLANTUML_JAR:-$ROOT/assets/plantuml/plantuml.jar}"
  # PlantUML -version exits non-zero (16) → validate by rendering a tiny diagram instead.
  if [ -f "$PLANTUML_JAR_PATH" ] && printf '@startuml\nBob -> Alice: hi\n@enduml' | java -jar "$PLANTUML_JAR_PATH" -pipe -tsvg >/dev/null 2>&1; then
    green "plantuml.jar (OFFLINE render) — diagram content stays on this machine"
  else
    yellow "No local plantuml.jar — render goes via plantuml.com (content sent online). Enable offline: bash \"$ROOT/scripts/plantuml-ensure.sh\""
  fi
else
  yellow "java not found — PlantUML renders via plantuml.com (content sent online). Install a JDK/JRE for offline."
fi
if command -v curl >/dev/null 2>&1; then
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 https://www.plantuml.com/plantuml/ 2>/dev/null || echo 000)"
  if [ "$code" = "200" ] || [ "$code" = "302" ] || [ "$code" = "301" ]; then green "plantuml.com reachable (fallback server)";
  else yellow "Cannot reach plantuml.com (HTTP $code) — offline jar needed for sensitive content"; fi
fi

echo ""
echo "== BPMN (/bpmn) =="
ENGINE="$ROOT/skills/bpmn/engine"
[ -d "$ENGINE" ] || ENGINE="$ROOT/.claude/skills/bpmn/engine"   # in case ROOT is the workspace
if [ -f "$ENGINE/package.json" ]; then
  if [ -d "$ENGINE/node_modules" ] || { [ -n "${CLAUDE_PLUGIN_DATA:-}" ] && [ -d "$CLAUDE_PLUGIN_DATA/node_modules" ]; }; then
    green "BPMN engine node_modules installed"
  else
    red "BPMN engine not yet npm-installed" "cd \"$ENGINE\" && npm install   (plugin mode: the hook auto-installs on the next session open)"
  fi
else
  yellow "BPMN engine not found at $ENGINE (ignore if you don't use /bpmn)"
fi

echo ""
echo "== draw.io (/drawio-aws /drawio-azure /drawio-gcp /drawio-databricks /drawio-sequence) =="
DRAWIO_ENG="$ROOT/skills/drawio/engine"
if [ -f "$DRAWIO_ENG/core.ts" ] && [ -f "$DRAWIO_ENG/drawio-build.ts" ]; then
  # Real smoke: load the shipped aws catalog + searchIcon("s3") via the ported engine.
  if command -v node >/dev/null 2>&1; then
    SMOKE="$(bash "$ROOT/scripts/tsrun.sh" "$DRAWIO_ENG/drawio-build.ts" search s3 --cloud aws 2>/dev/null \
      | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const o=JSON.parse(s);process.stdout.write(o.s3&&o.s3[0]&&o.s3[0].name==="s3"?"ok":"bad")}catch{process.stdout.write("bad")}})' 2>/dev/null)"
    if [ "$SMOKE" = "ok" ]; then green "draw.io engine + aws catalog (smoke: searchIcon s3 → ok)"
    else red "draw.io engine smoke failed (catalog load / searchIcon)" "Re-check skills/drawio/engine + skills/drawio/catalog/aws.json"; fi
  else
    yellow "node missing — cannot smoke the draw.io engine (it needs node/tsx)"
  fi
else
  red "draw.io engine not found at $DRAWIO_ENG" "Ignore if you don't use /drawio-*"
fi
# Catalogs: aws/databricks ship in-repo; azure/gcp are large + gitignored (download on demand).
for c in aws databricks; do
  [ -f "$ROOT/skills/drawio/catalog/$c.json" ] && green "$c.json catalog (shipped)" || yellow "$c.json missing (should ship in-repo)"
done
for c in azure gcp; do
  if [ -f "$ROOT/skills/drawio/catalog/$c.json" ]; then green "$c.json catalog (downloaded)"
  else yellow "$c.json not downloaded — run: bash \"$ROOT/scripts/drawio-catalog-ensure.sh\" $c"; fi
done
# draw.io desktop app = OPTIONAL (only for PNG/SVG export; .drawio opens everywhere without it).
DRAWIO_CLI="${DRAWIO_CLI:-}"
if [ -n "$DRAWIO_CLI" ] && [ -x "$DRAWIO_CLI" ]; then green "draw.io desktop (\$DRAWIO_CLI) — PNG/SVG export"
elif command -v drawio >/dev/null 2>&1; then green "draw.io desktop ($(command -v drawio)) — PNG/SVG export"
elif $IS_MAC && [ -x "/Applications/draw.io.app/Contents/MacOS/draw.io" ]; then green "draw.io desktop (/Applications) — PNG/SVG export"
else yellow "draw.io desktop not found — .drawio files still open in draw.io web/VS Code; only PNG/SVG export is skipped"
fi

echo ""
echo "──────────────────────────────────────────"
printf "Total: ✅ %d OK · ⚠️  %d warnings · ❌ %d missing\n" "$ok" "$warn" "$miss"
[ "$miss" -eq 0 ] && echo "Ready to draw. (⚠️ warnings only affect the corresponding skill.)" || echo "Install the ❌ items using the hints above, then run doctor again."
exit 0
