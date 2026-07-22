# Icon map — insert technology/vendor icons into diagrams (D2)

> Shared rule for architecture-drawing skills (`/d2-architect`, `/system-design`, `/scan-project`). Attach icons (Redis, PostgreSQL, Kafka, AWS, nginx, React...) to infra/tech nodes so the stack is "recognizable at a glance". Skills reference this file in Constraints + References.

## How to use (1 command)

Call the shared resolver — it handles bundle-vs-CDN + absolute path automatically:

```bash
ICON="$("${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh" redis)"
```

Then attach to the D2 node (keep box + label, icon shows inside the shape). D2 **embeds base64 at compile time** → SVG/PNG/HTML gallery are all self-contained:

```
Cache: Redis        { icon: "<ICON>" }
DB:    PostgreSQL   { shape: cylinder; icon: "<ICON postgres>" }
Queue: Kafka        { shape: queue;    icon: "<ICON kafka>" }
Pay:   Stripe       { icon: "<ICON stripe>" }   # external system
```

- **Bundle present** → `icon-path.sh` prints the **absolute path** to `assets/icons/<name>.svg` (absolute is required — render pipeline cwd = project root, `.d2` sits deep under `docs/…`).
- **No bundle** → prints a **CDN URL** (Devicon/Simple Icons); D2 fetches at render time (needs net) then embeds — output stays self-contained.
- **Keyword not recognized** → prints empty → **skip the icon** (diagram still renders normally).

## Rules (right altitude — don't overuse)

- **Only attach icons to infra/technology/external-system nodes** (DB, cache, queue, cloud, tech-specific service, 3rd-party). Do **NOT** attach to abstract business boxes (actor, use case, generic logic block) — wrong altitude, adds noise.
- **Auto on match:** node whose name/tech matches a keyword → icon added automatically. User types `--no-icons` → **disable everything** (plain drawing).
- `/scan-project`: map **tech detected from code** (deps/SDK/env: `redis`, `pg`, `kafka`, `@aws-sdk`...) → corresponding icon; record in `scan-plan.md` which tech has an icon.

## Keyword → icon (~600 bundled — full Devicon catalogue + curated Simple Icons)

The bundle ships the **entire Devicon set**, so most technologies resolve **by exact name** with no alias (e.g. `typescript`, `terraform`, `kotlin`, `oracle`, `apachecassandra`, `tensorflow`). The table below lists only the handy short aliases defined in `icon-path.sh`:

| Group | Keyword (alias) → icon |
|---|---|
| **DB/store** | postgres/pg → postgresql · mysql · mariadb · mongo → mongodb · redis · sqlite · elastic/es → elasticsearch · cassandra → apachecassandra · mssql/sqlserver → microsoftsqlserver · oracle |
| **Messaging** | kafka → apachekafka · rabbit/amqp → rabbitmq · nats |
| **Cloud/infra** | aws/s3/lambda/sqs/... → amazonwebservices · gcp/gcs → googlecloud · azure · docker · k8s/kube → kubernetes · nginx · apache · tf → terraform · ansible |
| **Runtime/lang** | node → nodejs · py → python · ts → typescript · js → javascript · java · go/golang · rust · dotnet → dotnetcore · cs/csharp → csharp · cpp/c++ → cplusplus · php · ruby |
| **Framework** | react · vue → vuejs · angular · next → nextjs · django · spring/springboot · express · rails/ror · laravel · fastapi |
| **Other** | graphql · grafana · prometheus · stripe · sendgrid · cloudflare · vercel · datadog |

Unknown names fall back to the Devicon CDN; not found → skip icon (the diagram still renders). To add a non-obvious keyword permanently, add an alias in `icon-path.sh`.

## Sources + license

- **Devicon** (multi-color, full catalogue bundled) — **MIT** — `cdn.jsdelivr.net/gh/devicons/devicon`.
- **Simple Icons** (mono, for infra/SaaS brands not in Devicon: stripe, sendgrid, cloudflare, vercel, datadog, …) — **CC0** — `cdn.jsdelivr.net/npm/simple-icons`.
- Files are licensed (MIT/CC0); logos are trademarks of their owners — using them to *identify technologies* in diagrams is legitimate. Attribute sources in `NOTICE`.

## One-line summary

> **`icon-path.sh <tech>` → `icon:` value (bundle abs / CDN). Only infra/tech nodes, auto on match, `--no-icons` to disable. D2 embeds base64 → self-contained.**
