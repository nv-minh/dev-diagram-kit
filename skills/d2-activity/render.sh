#!/usr/bin/env bash
# render.sh — compile one .d2 file → .svg (default) and .png (if --png).
# ELK layout (orthogonal lines, grouped channels, fewer overlaps) — different from Mermaid's default dagre.
# Used by the /d2 skill. The AI does NOT need to remember the d2/Chrome paths — just call this script.
#
#   ./render.sh <file.d2>            → produces <file>.svg
#   ./render.sh <file.d2> --png      → also produces <file>.png (via Chrome puppeteer-cache)
#
# Exit != 0 if the compile fails (the skill must tell the user, NOT write a broken diagram).

set -euo pipefail

SRC="${1:?Need the path to a .d2 file}"
WANT_PNG="${2:-}"

# d2 is installed via install.sh into ~/.local/bin
D2_BIN="$HOME/.local/bin/d2"
[ -x "$D2_BIN" ] || D2_BIN="$(command -v d2 || true)"
[ -n "$D2_BIN" ] || { echo "❌ d2 not installed. Install: curl -fsSL https://d2lang.com/install.sh | sh -s --"; exit 1; }

SVG="${SRC%.d2}.svg"

# --layout elk: nice layout for multi-branch flows. --theme 1: clean neutral gray for BA docs.
"$D2_BIN" --layout elk --theme 1 --pad 40 "$SRC" "$SVG"
echo "✅ SVG: $SVG"

if [ "$WANT_PNG" = "--png" ]; then
  CHROME="$(find "$HOME/.puppeteer-cache/chrome" -name 'Google Chrome for Testing' -type f 2>/dev/null | head -1)"
  [ -n "$CHROME" ] || CHROME="$(command -v google-chrome-stable || command -v chromium || true)"
  if [ -z "$CHROME" ]; then
    echo "⚠️  No Chrome found to render PNG — SVG only. (SVG opens in a browser/IDE.)"
    exit 0
  fi

  # D2's native `d2 file.d2 file.png` needs the Playwright driver to self-download — often 404s offline / when the CDN changes.
  # Use the existing Chrome (already installed for PDF/Mermaid export) to screenshot the SVG, but we MUST read the real
  # size from the viewBox of the <svg> tag D2 produced — a fixed window-size would crop / leave whitespace depending on the diagram.
  VIEWBOX="$(grep -o 'viewBox="[0-9. ]*"' "$SVG" | head -1 | sed -E 's/viewBox="([0-9. ]*)"/\1/')"
  W="$(echo "$VIEWBOX" | awk '{print int($3+0.5)}')"
  H="$(echo "$VIEWBOX" | awk '{print int($4+0.5)}')"
  if [ -z "$W" ] || [ -z "$H" ] || [ "$W" -le 0 ] || [ "$H" -le 0 ]; then
    echo "⚠️  Could not read the viewBox from $SVG — falling back to 1600x2200 (may crop / leave whitespace)."
    W=1600; H=2200
  fi

  PNG="${SRC%.d2}.png"
  "$CHROME" --headless --disable-gpu --screenshot="$PNG" \
    --window-size="${W},${H}" --default-background-color=FFFFFFFF "$SVG" >/dev/null 2>&1
  echo "✅ PNG: $PNG (${W}x${H}, matches the real viewBox)"
fi
