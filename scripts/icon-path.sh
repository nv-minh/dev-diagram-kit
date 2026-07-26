#!/usr/bin/env sh
# icon-path.sh <keyword> — print the value to use for D2 `icon:` of a technology/vendor.
#
# Hybrid: prefer the offline BUNDLE `assets/icons/<name>.svg` → print the **ABSOLUTE path**
# (absolute is required because the render pipeline runs with cwd = project root while the .d2 file
# lives deep under docs/… → a relative path won't resolve correctly). No bundle → print a **CDN URL**
# (Devicon MIT, or Simple Icons CC0 for stripe/nats) — but ONLY if the URL is reachable (a 404/403
# remote image makes D2 fail to compile the WHOLE file; see "gotcha" in rules/node-shapes.md).
# Unreachable / not recognized → print empty (skill drops the icon, diagram still renders).
#
# Used inside a skill (D2 embeds the icon as base64 at compile time → self-contained SVG/PNG/HTML):
#   ICON="$("${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh" redis)"
#   [ -n "$ICON" ] && echo "Cache: Redis { icon: \"$ICON\" }"

[ -n "${1:-}" ] || exit 0
kw="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr -d ' _-')"

case "$kw" in
  postgres|postgresql|postgre|pg) name=postgresql;;
  mysql) name=mysql;;
  mariadb) name=mariadb;;
  mongo|mongodb) name=mongodb;;
  redis) name=redis;;
  sqlite) name=sqlite;;
  elastic|elasticsearch|es|opensearch) name=elasticsearch;;
  cassandra|apachecassandra) name=apachecassandra;;
  kafka|apachekafka) name=apachekafka;;
  rabbit|rabbitmq|amqp) name=rabbitmq;;
  nats) name=nats;;
  aws|amazon|amazonwebservices|s3|sqs|sns|lambda|dynamodb|ec2|rds|cloudfront) name=amazonwebservices;;
  gcp|googlecloud|gcs|bigquery|pubsub) name=googlecloud;;
  azure) name=azure;;
  docker) name=docker;;
  k8s|kube|kubernetes) name=kubernetes;;
  nginx) name=nginx;;
  apache|httpd) name=apache;;
  node|nodejs) name=nodejs;;
  python|py) name=python;;
  java) name=java;;
  go|golang) name=go;;
  rust) name=rust;;
  dotnet|dotnetcore) name=dotnetcore;;
  csharp|cs) name=csharp;;
  php) name=php;;
  ruby) name=ruby;;
  react|reactjs) name=react;;
  vue|vuejs) name=vuejs;;
  angular|angularjs) name=angular;;
  next|nextjs) name=nextjs;;
  django) name=django;;
  spring|springboot) name=spring;;
  express|expressjs) name=express;;
  rails|ror|rubyonrails) name=rails;;
  laravel) name=laravel;;
  fastapi) name=fastapi;;
  graphql) name=graphql;;
  grafana) name=grafana;;
  prometheus) name=prometheus;;
  stripe) name=stripe;;
  ts|typescript) name=typescript;;
  js|javascript) name=javascript;;
  mssql|sqlserver) name=microsoftsqlserver;;
  cpp|c++|cplusplus) name=cplusplus;;
  tf|terraform) name=terraform;;
  gha|githubactions) name=githubactions;;
  *) name="$kw";;
esac

# Resolve the kit ROOT: explicit env → else the parent of THIS script's dir (scripts/ → repo root,
# which holds assets/icons/ in dev/copy mode) → else the legacy ".claude" fallback.
ROOT="${CLAUDE_PLUGIN_ROOT:-}"
if [ -z "$ROOT" ]; then
  _self="$0"
  case "$_self" in /*) ;; *) _self="$PWD/$_self" ;; esac
  _root="$(cd "$(dirname "$_self")/.." 2>/dev/null && pwd)" || _root=""
  [ -n "$_root" ] && [ -d "$_root/assets/icons" ] && ROOT="$_root"
fi
[ -n "$ROOT" ] || ROOT=".claude"

bundle="$ROOT/assets/icons/$name.svg"
if [ -f "$bundle" ]; then
  d="$(cd "$(dirname "$bundle")" 2>/dev/null && pwd)" && [ -n "$d" ] && { printf '%s/%s.svg\n' "$d" "$name"; exit 0; }
fi

# CDN fallback (only needs network AT render time; D2 fetches + embeds base64, output stays self-contained).
# Pick the URL, then VERIFY reachability — a 404/403 makes D2 fail to compile the whole diagram, so an
# unreachable icon is dropped (empty output) instead. Verdict cached per-session to avoid re-HEADing.
case "$name" in
  stripe) url='https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/stripe.svg';;
  nats)   url='https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/natsdotio.svg';;
  *)      url="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/$name/$name-original.svg";;
esac

_cache="${TMPDIR:-/tmp}/dev-diagram-kit-icon-cdn.tsv"
# cached verdict?
if [ -f "$_cache" ]; then
  _hit="$(grep -F "$url " "$_cache" 2>/dev/null | head -1)"
  if [ -n "$_hit" ]; then
    case "$_hit" in *" ok") printf '%s\n' "$url"; exit 0;; *) exit 0;; esac   # cached bad → empty
  fi
fi
# live HEAD-check (jsdelivr supports HEAD; short timeout; no curl → can't verify, return URL as before)
if command -v curl >/dev/null 2>&1; then
  code="$(curl -sIL -o /dev/null -w '%{http_code}' --max-time 4 "$url" 2>/dev/null || echo 000)"
  case "$code" in
    2*|3*) printf '%s ok\n' "$url" >> "$_cache" 2>/dev/null; printf '%s\n' "$url";;
    *)     printf '%s bad\n' "$url" >> "$_cache" 2>/dev/null;;   # 404/403/000 → drop icon (empty)
  esac
else
  printf '%s\n' "$url"   # no curl to verify → best-effort, return URL (rare; pre-existing behavior)
fi
