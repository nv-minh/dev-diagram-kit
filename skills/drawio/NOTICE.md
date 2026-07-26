# NOTICE — draw.io engine (skills/drawio/)

The draw.io XML generation engine, stencil catalogs, and design-principle rules under
`skills/drawio/` are adapted from **drawio-ai-kit** by sparklabx.

    drawio-ai-kit
    Copyright (c) 2026 sparklabx
    Licensed under the MIT License.
    Source: https://github.com/sparklabx/drawio-ai-kit

**What is adapted (MIT):** the engine modules (`engine/core.ts`, `builder.ts`,
`layout-engine.ts`, `layout.ts`, `types.ts`, `theme.ts`, `cli-lib.ts`), the stencil
catalog *metadata* (`catalog/*.json` — stencil names, category colors, draw.io style
strings, connection points), and the design-principle rules (`rules/*.md`). The original
is shipped as zero-dependency `.mjs` invoked via a `drawio-ai` CLI; this adaptation ports
the modules to TypeScript and re-exposes them through the kit's `drawio-build.ts` entry
(run via `scripts/tsrun.sh`, same pattern as the BPMN engine).

The MIT License of sparklabx applies to these adapted portions:

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

## Cloud icon artwork — NOT MIT (trademarks / separate terms)

The **stencil metadata** (names, colors, style strings) is MIT. The **icon bitmaps**
themselves remain the property of their respective owners — they are used here only to
identify the corresponding cloud service within architecture diagrams:

- **AWS Architecture Icons** (`mxgraph.aws4.*`) — © Amazon Web Services, subject to the
  [AWS Architecture Icons usage terms](https://aws.amazon.com/architecture/icons/).
- **Azure / Microsoft** icons — © Microsoft, subject to the Microsoft trademarks/icons guidelines.
- **Google Cloud / GCP** icons — © Google LLC, subject to the Google Cloud brand guidelines.
- **Databricks** icons — © Databricks, subject to the Databricks brand guidelines.

Review those terms before redistributing the icon bitmaps. The `azure.json` and `gcp.json`
catalogs are large (mostly embedded base64 bitmaps) and are NOT shipped in-repo — they are
downloaded on demand by `scripts/drawio-catalog-ensure.sh` (see doctor.sh).

## Catalog provenance

The catalog data is generated from the official draw.io / diagrams.net shape libraries via
the `shape-index` from [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp)
(Apache License 2.0). See upstream's `THIRD_PARTY_NOTICES.md` for the full provenance chain.
