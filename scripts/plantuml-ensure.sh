#!/usr/bin/env bash
# plantuml-ensure.sh — make a local plantuml.jar available for OFFLINE PlantUML rendering.
#
# By default /activity-swimlane + /usecase-diagram render via the public plantuml.com server,
# which sends diagram content (lane/use-case names) over the internet. This script downloads
# plantuml.jar ONCE into assets/plantuml/ (gitignored); the per-skill render.sh then renders
# locally with java, keeping content on this machine. doctor.sh checks the result.
#
#   bash scripts/plantuml-ensure.sh
#
# Jar location: assets/plantuml/plantuml.jar   (override: PLANTUML_JAR=/path/to/plantuml.jar)
# Idempotent: exits 0 as soon as a usable jar + java are present.
set -euo pipefail

ROOT="${CLAUDE_PLUGIN_ROOT:-}"
if [ -z "$ROOT" ]; then
  SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # scripts/
  ROOT="$(cd "$SELF_DIR/.." && pwd)"
fi
JAR_DIR="$ROOT/assets/plantuml"
JAR="${PLANTUML_JAR:-$JAR_DIR/plantuml.jar}"

# Validate the jar by actually rendering a tiny diagram. PlantUML's -version exits non-zero (16),
# so a 1-line pipe render is the reliable "does this jar work" check.
jar_works() {
  [ -f "$JAR" ] && command -v java >/dev/null 2>&1 && \
    printf '@startuml\nBob -> Alice: hi\n@enduml' | java -jar "$JAR" -pipe -tsvg >/dev/null 2>&1
}

# Already usable → done.
if jar_works; then
  echo "✅ plantuml.jar ready: $JAR"
  exit 0
fi

# No java → cannot render locally; keep the server fallback.
if ! command -v java >/dev/null 2>&1; then
  echo "⚠️  java not found — PlantUML will keep rendering via plantuml.com (content sent online)."
  echo "   Install a JDK/JRE first (e.g. brew install openjdk), then re-run this script."
  exit 0
fi

mkdir -p "$JAR_DIR"
URL="https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar"
echo "⬇️  Downloading plantuml.jar → $JAR"
if curl -fSL --max-time 120 -o "$JAR" "$URL"; then
  if jar_works; then
    VER="$(java -jar "$JAR" -version 2>&1 | head -1)"
    echo "✅ plantuml.jar installed: $JAR ($VER)"
    echo "   /activity-swimlane + /usecase-diagram now render locally (offline)."
  else
    echo "❌ Downloaded jar failed the smoke render. Delete $JAR and re-run."
    rm -f "$JAR"; exit 1
  fi
else
  rm -f "$JAR"
  echo "⚠️  Download failed ($URL). PlantUML keeps rendering via plantuml.com for now."
  exit 0
fi
