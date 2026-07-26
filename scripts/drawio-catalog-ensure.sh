#!/usr/bin/env bash
# drawio-catalog-ensure.sh — make the LARGE draw.io cloud catalogs available on demand.
#
# The 10 smaller catalogs (aws, databricks, bpmn, + tooling packs) ship in-repo under
# skills/drawio/catalog/. Two are too large to ship (mostly embedded base64 icon bitmaps):
#   azure.json (~13.5 MB)   gcp.json (~1.9 MB)
# They are gitignored and downloaded here ONCE into skills/drawio/catalog/ — the same
# "large asset, download on demand" pattern as scripts/plantuml-ensure.sh. doctor.sh checks.
#
#   bash scripts/drawio-catalog-ensure.sh              # ensure azure + gcp (the 2 gitignored)
#   bash scripts/drawio-catalog-ensure.sh azure        # ensure one
#   bash scripts/drawio-catalog-ensure.sh azure gcp    # explicit
#
# Override the upstream source (e.g. a fork or a local file server):
#   DRAWIO_CATALOG_BASE=https://example.com/catalogs bash scripts/drawio-catalog-ensure.sh
# Or drop the files in place manually — the script skips anything already present + valid.
set -euo pipefail

ROOT="${CLAUDE_PLUGIN_ROOT:-}"
if [ -z "$ROOT" ]; then
  SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # scripts/
  ROOT="$(cd "$SELF_DIR/.." && pwd)"
fi
CATALOG_DIR="$ROOT/skills/drawio/catalog"
mkdir -p "$CATALOG_DIR"

BASE="${DRAWIO_CATALOG_BASE:-https://raw.githubusercontent.com/sparklabx/drawio-ai-kit/main/catalog}"

# A catalog is "present" if the file exists AND parses as valid JSON (a truncated download
# is the failure mode to guard against for a 13.5 MB file over a flaky link).
valid_json() {
  [ -f "$1" ] && node -e "JSON.parse(require('fs').readFileSync('$1','utf8'))" 2>/dev/null
}

# Only the large/gitignored catalogs need fetching; the rest ship in-repo.
DEFAULTS="azure gcp"
WANT="${*:-$DEFAULTS}"

need=0; got=0
for name in $WANT; do
  file="$CATALOG_DIR/$name.json"
  if valid_json "$file"; then
    size="$(du -h "$file" | awk '{print $1}')"
    echo "✅ $name.json already present ($size)"
    got=$((got+1)); continue
  fi
  need=$((need+1))
  url="$BASE/$name.json"
  echo "⬇️  Downloading $name.json → $file"
  if curl -fSL --max-time 300 -o "$file" "$url"; then
    if valid_json "$file"; then
      size="$(du -h "$file" | awk '{print $1}')"
      echo "✅ $name.json installed ($size) — /drawio-$name is ready."
      got=$((got+1))
    else
      echo "❌ Downloaded $name.json failed JSON validation (truncated/corrupt). Delete $file and re-run."
      rm -f "$file"; exit 1
    fi
  else
    rm -f "$file"
    echo "⚠️  Download failed ($url)."
    echo "   /drawio-$name needs this catalog. Options:"
    echo "     • re-run later (transient network issue)"
    echo "     • copy it from a local drawio-ai-kit clone: cp <clone>/catalog/$name.json $file"
    echo "     • point at a mirror: DRAWIO_CATALOG_BASE=https://… bash $0 $name"
    exit 0
  fi
done

if [ "$need" -eq 0 ]; then
  echo "All requested catalogs ready (nothing to download)."
else
  echo "Done: $got newly/currently ready."
fi
