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

echo "== General =="
if command -v node >/dev/null 2>&1; then green "node $(node --version)"; else red "node — NOT found (needed for Mermaid + BPMN + DBML)" "Install Node LTS: https://nodejs.org (or nvm)"; fi
if command -v npm  >/dev/null 2>&1; then green "npm $(npm --version)"; else red "npm — NOT found" "Bundled with Node LTS"; fi
if command -v python3 >/dev/null 2>&1; then green "python3 $(python3 --version 2>&1 | awk '{print $2}')"; else red "python3 — NOT found (needed for PlantUML encode)" "macOS: preinstalled; or brew install python"; fi
if command -v curl >/dev/null 2>&1; then green "curl"; else red "curl — NOT found (needed for PlantUML render via plantuml.com)" "macOS: preinstalled"; fi

echo ""
echo "== Mermaid (/sequence /activity /state /erd) =="
if command -v mmdc >/dev/null 2>&1; then green "mmdc $(mmdc --version 2>/dev/null || echo '?')"; else red "mmdc (@mermaid-js/mermaid-cli) — NOT found" "npm i -g @mermaid-js/mermaid-cli"; fi
if find "$HOME/.puppeteer-cache/chrome" -name 'Google Chrome for Testing' 2>/dev/null | grep -q . ; then
  green "Chrome (puppeteer-cache) — for PNG rendering"
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
if command -v curl >/dev/null 2>&1; then
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 https://www.plantuml.com/plantuml/ 2>/dev/null || echo 000)"
  if [ "$code" = "200" ] || [ "$code" = "302" ] || [ "$code" = "301" ]; then green "plantuml.com reachable (render via the public server)";
  else yellow "Cannot reach plantuml.com (HTTP $code) — needs internet; diagram content is sent out (see the privacy gotcha)"; fi
else
  yellow "curl missing → cannot check plantuml.com"
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
echo "──────────────────────────────────────────"
printf "Total: ✅ %d OK · ⚠️  %d warnings · ❌ %d missing\n" "$ok" "$warn" "$miss"
[ "$miss" -eq 0 ] && echo "Ready to draw. (⚠️ warnings only affect the corresponding skill.)" || echo "Install the ❌ items using the hints above, then run doctor again."
exit 0
