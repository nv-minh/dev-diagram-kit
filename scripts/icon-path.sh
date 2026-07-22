#!/usr/bin/env sh
# icon-path.sh <keyword> — print the value to use for D2 `icon:` of a technology/vendor.
#
# Hybrid: prefer the offline BUNDLE `assets/icons/<name>.svg` → print the **ABSOLUTE path**
# (absolute is required because the render pipeline runs with cwd = project root while the .d2 file
# lives deep under docs/… → a relative path won't resolve correctly). No bundle → print a **CDN URL**
# (Devicon MIT, or Simple Icons CC0 for stripe/nats). Not recognized → print empty (skill drops the icon).
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

ROOT="${CLAUDE_PLUGIN_ROOT:-.claude}"
bundle="$ROOT/assets/icons/$name.svg"
if [ -f "$bundle" ]; then
  d="$(cd "$(dirname "$bundle")" 2>/dev/null && pwd)" && [ -n "$d" ] && { printf '%s/%s.svg\n' "$d" "$name"; exit 0; }
fi

# CDN fallback (only needs network AT render time; D2 fetches + embeds base64, output is still self-contained)
case "$name" in
  stripe) printf 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/stripe.svg\n';;
  nats)   printf 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/natsdotio.svg\n';;
  *)      printf 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/%s/%s-original.svg\n' "$name" "$name";;
esac
