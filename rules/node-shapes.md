---
paths:
  - ".claude/skills/d2-architect/**"
  - ".claude/skills/d2-erd/**"
  - ".claude/skills/d2-activity/**"
  - ".claude/skills/system-design/**"
  - ".claude/skills/dfd/**"
  - ".claude/skills/scan-project/**"
---

# Node shapes — node type → D2 shape + icon + color

> Shared reference for the architecture-drawing skills (`/d2-architect`, `/system-design`, `/scan-project`,
> `/d2-erd`, `/d2-activity`, `/dfd`). Pick a node's **shape** from its TYPE, its **icon** from its TECH,
> its **color** from its ROLE. Colors live in `@./diagram-style.md`; icon resolution in `@./icon-map.md`.

## Principle — 3 visual levers, don't collapse them into one

| Lever | Answers | Source |
|---|---|---|
| **shape** | *what kind of thing is this?* (DB? gateway? queue? pipeline?) | this file |
| **icon** | *which technology?* (Postgres? Redis? Kafka? OpenAI?) | `icon-map.md` → `scripts/icon-path.sh` |
| **color** | *what role?* (frontend / backend / data / external / …) | `diagram-style.md` |

A plain "Auth Service" with no specific tech → **rectangle + green** (no icon — honest, no better shape).
A "Redis cache" → **`stored_data` + redis icon + teal**. An "API Gateway" → **`hexagon` + kong/nginx icon + indigo**.
Do NOT make every box a rectangle — pick the shape that reveals the type. Do NOT force an icon onto
an abstract business box (wrong altitude).

**Icons are ON by default for EVERY tech-recognizable node** — not just DB/queue/gateway. A React web
app gets the `react` icon, a NestJS service gets `nestjs`, an Azure external gets `azure`, a Postgres
store gets `postgresql`, a CDN gets `cloudflare`… Only *abstract* nodes stay plain (a generic business
service with no tech, an actor/person, a use-case, a decision). `--no-icons` turns ALL icons off. The
aim: a reader recognizes each block at a glance from its logo.

## The 12 D2 shapes used (and what each means)

D2 has no `component`/`shield` shape — work within these (verified to render in the installed d2):

| shape | use for |
|---|---|
| `person` (C4: `c4-person`) | user / actor / role |
| `cylinder` | database / data store / warehouse / vector DB / search index |
| `stored_data` | cache / object store / file store / data lake / feature store / dataset |
| `queue` | message bus / queue / topic / pub-sub / event bus |
| `hexagon` | gateway / reverse proxy / load balancer / ingress / NAT |
| `cloud` | CDN / DNS / VPN / cloud-hosted external |
| `parallelogram` | pipeline / ETL / stream / CI-CD / training job (data-in-motion) |
| `package` | container image / artifact / registry / k8s cluster / pod (a bundled unit) |
| `document` | config / schema / log / notebook / IaC (a file/artifact) |
| `oval` | trigger / scheduler / cron (a start event) |
| `diamond` | decision / policy gate / conditional branch (rare in architecture) |
| `rectangle` | service / function / worker / generic component (the default) |

## How to attach (shape + icon + color together)

```bash
ICON="$("${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/icon-path.sh" redis)"   # abs bundle path, or CDN, or empty
```
```ini
vars: {  # from diagram-style.md
  gatewayFill:"#E0E7FF"; cacheFill:"#CCFBF1"; dbFill:"#F1EAFB"; busFill:"#FFF1E6"
  cloudFill:"#E0F2FE"; beFill:"#E6F4EA"; aiFill:"#FCE7F3"; secFill:"#FFE4E6"; obsFill:"#F1F5F9"
}
Cache: Redis cache { shape: stored_data; icon:"${ICON redis}"; style.fill:${cacheFill}; style.stroke:"#14B8A6" }
GW:    API Gateway { shape: hexagon;      icon:"${ICON nginx}"; style.fill:${gatewayFill} }
DB:    PostgreSQL  { shape: cylinder;     icon:"${ICON postgres}"; style.fill:${dbFill} }
```
`shape:` + `icon:` combine (D2 embeds the icon base64 at compile → SVG/PNG self-contained). If `icon-path.sh`
returns empty (keyword unknown) → drop the `icon:` (shape + color still carry the type). `--no-icons`
disables all icons.

## Catalog (software · data · devops · infra · AI)

`icon` = a keyword `icon-path.sh` resolves (bundled unless marked ¹ = CDN-only, needs net). `—` = no icon.

### Software / application
| Type | shape | icon | color |
|---|---|---|---|
| User / actor | `person` | — | personFill |
| Web app / SPA / frontend | `rectangle` | react/vue/nextjs/nuxt/svelte | feFill |
| Mobile app | `rectangle` | flutter/reactnative/android/ios | feFill |
| Desktop app | `rectangle` | electron | feFill |
| **API Gateway** | **`hexagon`** | kong/nginx/envoy/traefik | gatewayFill |
| **Reverse proxy** | **`hexagon`** | nginx/apache/envoy | gatewayFill |
| **Load balancer (L4/L7)** | **`hexagon`** | nginx/envoy/haproxy¹ | gatewayFill |
| **Ingress controller** | **`hexagon`** | nginx/traefik | gatewayFill |
| BFF (backend-for-frontend) | `rectangle` | — | beFill |
| Microservice / service | `rectangle` | spring/express/nodejs/dotnet/go/nestjs/fastapi | beFill |
| Function / serverless (Lambda) | `rectangle` | amazonwebservices | beFill |
| Worker / job consumer | `rectangle` | nodejs/python/go | beFill |
| Cron / scheduler / trigger | `oval` | — | beFill |
| Sidecar | `rectangle` | envoy | beFill |
| Service mesh control plane | `rectangle` | istio/envoy/linkerd¹ | beFill |
| Webhook receiver | `rectangle` | — | beFill |
| GraphQL endpoint | `rectangle` | graphql/apollographql | beFill |
| gRPC service | `rectangle` | grpc | beFill |
| Monolith | `rectangle` | — | ownFill |

### Data
| Type | shape | icon | color |
|---|---|---|---|
| Relational DB | `cylinder` | postgres/mysql/mariadb/oracle/mssql/sqlite | dbFill |
| Columnar / OLAP DB | `cylinder` | clickhouse/druid¹ | dbFill |
| Document DB | `cylinder` | mongodb | dbFill |
| Graph DB | `cylinder` | neo4j | dbFill |
| Timeseries DB | `cylinder` | influxdb | dbFill |
| Vector DB | `cylinder` | pinecone/milvus/weaviate¹ | dbFill |
| Search index | `cylinder` | elasticsearch/opensearch | dbFill |
| Data warehouse | `cylinder` | snowflake/bigquery/databricks/redshift¹ | dbFill |
| Data lake / lakehouse | `stored_data` | databricks/hadoop/apachespark | cacheFill |
| **Cache** | **`stored_data`** | redis/memcached | cacheFill |
| Object storage / blob (S3) | `stored_data` | amazonwebservices/minio | cacheFill |
| File store / NFS | `stored_data` | — | cacheFill |
| ETL / ELT pipeline | `parallelogram` | apacheairflow/apachespark/dbt¹ | beFill |
| Stream / table | `parallelogram` | apachekafka/flink¹ | busFill |
| Schema registry | `document` | — | dbFill |

### DevOps
| Type | shape | icon | color |
|---|---|---|---|
| CI/CD pipeline | `parallelogram` | githubactions/jenkins/gitlab/circleci | beFill |
| Build server | `rectangle` | jenkins/githubactions | beFill |
| Container registry | `package` | docker | gatewayFill |
| Artifact repo | `package` | maven/npm | gatewayFill |
| Config server | `document` | spring/consul | dbFill |
| Secret manager / vault | `rectangle` | vault | secFill |
| Monitoring / metrics | `rectangle` | prometheus/datadog | obsFill |
| Logging | `document` | elasticsearch/splunk | obsFill |
| Tracing | `rectangle` | jaegertracing/opentelemetry | obsFill |
| Alerting | `rectangle` | pagerduty/sentry | secFill |
| IaC | `document` | terraform/ansible | beFill |

### Infra / cloud
| Type | shape | icon | color |
|---|---|---|---|
| VPC / network | `rectangle` (dashed container) | amazonwebservices | — |
| Subnet | `rectangle` (nested) | — | — |
| Region / AZ | `rectangle` (dashed container) | — | — |
| Load balancer | `hexagon` | (see Software) | gatewayFill |
| NAT gateway | `hexagon` | amazonwebservices | gatewayFill |
| **CDN / edge** | **`cloud`** | cloudflare/amazonwebservices | cloudFill |
| **DNS** | **`cloud`** | cloudflare | cloudFill |
| Firewall / WAF | `rectangle` | — | secFill |
| Bastion / jump host | `rectangle` | — | secFill |
| VPN | `cloud` | — | cloudFill |
| Kubernetes cluster | `package` | kubernetes | — |
| Node / VM | `rectangle` | docker/linux | beFill |
| Pod / container | `package` | docker | beFill |
| Queue / topic | `queue` | apachekafka/rabbitmq/nats | busFill |
| Pub-Sub / event bus | `queue` | googlecloud/sqs/sns | busFill |
| IAM / identity | `rectangle` | auth0/okta/keycloak | secFill |
| Key vault | `rectangle` | vault | secFill |

### AI / ML
| Type | shape | icon | color |
|---|---|---|---|
| LLM / foundation model | `rectangle` | openai/anthropic/huggingface | aiFill |
| Vector DB | `cylinder` | (see Data) | dbFill |
| Embedding service | `rectangle` | huggingface/openai | aiFill |
| Training job | `parallelogram` | tensorflow/pytorch | aiFill |
| Inference endpoint / serving | `rectangle` | tensorflow/pytorch | aiFill |
| Feature store | `stored_data` | — | aiFill |
| Dataset | `stored_data` | — | aiFill |
| Pipeline / orchestrator | `parallelogram` | apacheairflow/kubeflow¹ | aiFill |
| Notebook | `document` | jupyter | aiFill |
| GPU / accelerator | `rectangle` | — | aiFill |
| Agent / RAG | `rectangle` | langchain¹ | aiFill |

## Rules / gotchas

- **≤8 fill colors per diagram** (from `diagram-style.md`). 14 tokens exist; pick the subset a given
  diagram needs. Don't color every node — 1-2 accents + the type colors.
- **External systems** ALWAYS `style.stroke-dash: 3` + real name + one-phrase purpose (C4 convention).
- **Don't force a shape where none fits.** A generic business service IS a rectangle — inventing a
  fake shape confuses more than it helps. Shape is for *recognisable types*.
- **Icons best-effort, and a bad icon URL can break the render.** `icon-path.sh` skips unknown keywords
  (returns empty), but a CDN-fallback URL that 403s (e.g. some `openai-original.svg` variants) makes
  d2 **fail to compile the whole file** (d2 does not gracefully skip a failed remote image). If a render
  fails with "failed to bundle remote images" → remove that `icon:` (or run with the offline bundle
  installed so it resolves locally). Prefer icons that resolve to the **bundled** `assets/icons/*.svg`.
- **C4 purity** (`/system-design`): C4 containers are conventionally boxes; this catalog lets a gateway
  be a `hexagon` and a datastore a `cylinder` for recognisability — a soft deviation that aids reading.
  If strict C4 is required, keep containers as rectangles.
- For **cloud-brand-accurate** glyphs (actual AWS/Azure/GCP service icons), use the `/drawio-*` skills —
  complementary to this D2 shape system, not a replacement.

## One-line summary

> **shape = TYPE (person·cylinder·stored_data·queue·hexagon·cloud·parallelogram·package·document·oval·diamond·rectangle) · icon = TECH (`icon-path.sh`) · color = ROLE (`diagram-style.md`). Pick all three; don't default everything to a rectangle.**
