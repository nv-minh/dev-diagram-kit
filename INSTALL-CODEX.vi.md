# Port bộ dev-diagram-kit sang Codex CLI

[English](INSTALL-CODEX.md) · **Tiếng Việt**

> Đưa 14 skill (12 vẽ diagram + `/scan-project` + `/sync-confluence`, vốn viết cho Claude Code) sang **Codex CLI**. Codex đọc thư mục `.codex/` ở gốc project (song song với `.claude/` của Claude Code) và file nền `AGENTS.md`. Gồm: (A) cấu trúc Codex, (B) ánh xạ Claude Code → Codex, (C) prompt copy-paste ở `PROMPT-CODEX.vi.md`.
>
> ⚠️ **`/sync-confluence` phụ thuộc Atlassian MCP:** skill này không dùng render engine mà gọi Atlassian MCP (`updateConfluencePage`...). Nó chỉ chạy nếu Codex có **Atlassian MCP tương đương** đã cấu hình + auth; nếu Codex bản của bạn không có MCP này → vẫn copy SKILL.md nhưng skill sẽ không hoạt động, **bỏ qua** nó.

---

## A. Codex đọc cấu hình thế nào

| Loại | Claude Code | Codex CLI |
|---|---|---|
| Skills | `.claude/skills/{name}/SKILL.md` | `.codex/skills/{name}/SKILL.md` |
| Rules | `.claude/rules/*.md` | `.codex/rules/*.md` |
| Agents | `.claude/agents/{name}.md` (Markdown + frontmatter) | `.codex/agents/{name}.toml` (`description` + `developer_instructions`) |
| Scripts | `.claude/scripts/*.mjs` (`mermaid-verify.mjs`, `doctor.sh`) | `.codex/scripts/*` (giữ nguyên, Node/bash) |
| Templates | `.claude/templates/*.md` (đổi tên từ `_templates/`) | `.codex/templates/*.md` |
| File nền | `CLAUDE.md` | `AGENTS.md` |

> **Nguồn copy nằm ở GỐC repo gói này**: `skills/` (14 skill), `agents/`, `rules/`, `scripts/`, `templates/`. (Cây `claude-code/...` cũ đã bỏ — không còn tham chiếu.)

Điểm khác chính: **skill/rule/script gần như giữ nguyên**; chỉ **agent** đổi định dạng (Markdown → TOML). Engine (D2 `render.sh`, PlantUML `plantuml_encode.py`, BPMN engine, `mermaid-verify.mjs`) là script độc lập engine, chạy y hệt.

---

## B. Ánh xạ chi tiết

### B.1 — Skills (giữ nguyên)

```bash
mkdir -p <project>/.codex/skills <project>/.codex/templates
cp -R skills/.       <project>/.codex/skills/       # 14 skill (gồm system-design, scan-project, sync-confluence)
cp    templates/*.md <project>/.codex/templates/    # khung file diagram
```

> `templates/diagram-*.md` + `usecase-index.md` được `/sequence /activity /state /erd /bpmn /usecase-diagram` tham chiếu (`@../../templates/...`). Copy đủ, nếu không skill thiếu khung file. (Templates nay ở `.codex/templates/`, KHÔNG còn `_templates/` ở gốc project.)

SKILL.md frontmatter của Claude Code (`allowed-tools`, `user-invocable`, `argument-hint`, `context`) — Codex chủ yếu dùng `name` + `description` để kích hoạt. Các field thừa Codex bỏ qua, **không cần xóa** nhưng nên rà: nếu Codex báo lỗi parse frontmatter, chỉ giữ `name` + `description` và đưa cú pháp tham số xuống một mục "Cách gọi" trong body.

### B.2 — Rules (giữ nguyên)

```bash
mkdir -p <project>/.codex/rules
cp rules/*.md  <project>/.codex/rules/
```

Sửa reference trong SKILL.md nếu trỏ `@.claude/rules/...` → `.codex/rules/...`. (Hoặc để nguyên tương đối `rules/...` nếu Codex resolve được — kiểm thử.)

### B.3 — Scripts / engine (giữ nguyên)

```bash
mkdir -p <project>/.codex/scripts
cp scripts/*  <project>/.codex/scripts/   # mermaid-verify.mjs + doctor.sh
```

Engine sống trong từng skill (`bpmn/engine/`, `d2-activity/render.sh`, `usecase-diagram/` + `activity-swimlane/` `plantuml_encode.py`) — đã copy cùng B.1. Nhớ `npm install` trong `.codex/skills/bpmn/engine/` một lần.

> **QUAN TRỌNG — SKILL.md gọi script/engine qua token dual-mode** `${CLAUDE_PLUGIN_ROOT:-.claude}/...`, ví dụ `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs"`, `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`, `node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/bpmn-build.mjs"`. Codex KHÔNG set `CLAUDE_PLUGIN_ROOT` → phải rewrite **cả token `${CLAUDE_PLUGIN_ROOT:-.claude}/` LẪN mọi chuỗi `.claude/`** thành `.codex/` (thành `.codex/scripts/mermaid-verify.mjs`, `.codex/skills/d2-activity/render.sh`...).
>
> `/scan-project` **tái dùng đúng các path chia sẻ đó** — nó gọi `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`, `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs"` và `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/system-design/resources/c4-export-template.html"` → cùng quy tắc rewrite trên phủ luôn, không cần xử lý riêng.
>
> `/sync-confluence` **không** gọi script/engine nào — nó dùng **Atlassian MCP** (`getAccessibleAtlassianResources`, `getConfluencePage`, `updateConfluencePage`...). MCP không port theo path như script: chỉ chạy nếu Codex có Atlassian MCP tương đương đã auth. Không có → bỏ qua skill này (xem caveat đầu file).

### B.4 — Agents (đổi Markdown → TOML)

Agent `diagram-reviewer` cần chuyển sang `.toml`:

```toml
# .codex/agents/diagram-reviewer.toml
description = '<copy dòng mô tả từ frontmatter description của diagram-reviewer.md>'
developer_instructions = """
<copy TOÀN BỘ nội dung body của diagram-reviewer.md vào đây>
"""
```

Nội dung review giữ nguyên, chỉ đổi vỏ.

---

## C. Điểm cần xử lý tay

- **Path trong SKILL.md:** rà mọi chuỗi `.claude/` **VÀ token `${CLAUDE_PLUGIN_ROOT:-.claude}/`** → `.codex/` (scripts, render.sh, engine). Đây là chỗ hay sót nhất. `/scan-project` dùng chung các path này → cùng được phủ.
- **BPMN engine:** `npm install` trong `.codex/skills/bpmn/engine/`.
- **`/sync-confluence` (Atlassian MCP):** không có script để rewrite; chỉ chạy nếu Codex có Atlassian MCP tương đương đã auth. Nếu bản Codex của bạn không hỗ trợ MCP này → bỏ qua skill (copy SKILL.md vẫn được nhưng không hoạt động).
- **Kiểm thử từng engine:** chạy thử 1 skill mỗi engine (Mermaid / PlantUML / D2 / BPMN / DBML) và xác nhận render + compile-check chạy.

---

## D. Prompt tự động

Không cần làm tay từng bước — mở project trong Codex CLI, **mở `PROMPT-CODEX.vi.md` và dán toàn bộ prompt trong đó vào chat**. Codex sẽ tự sao chép + chuyển đổi bộ skill Claude Code sang thư mục `.codex/` đúng chuẩn.

---

## E. Checklist sau khi port

- [ ] `.codex/skills/` có đủ 14 skill (gồm `system-design`, `scan-project`, `sync-confluence`).
- [ ] `.codex/templates/` có `diagram-*.md` + `usecase-index.md`.
- [ ] `.codex/rules/` có các rule (approval-gate, ba-conventions, diagram-selection, feature-bootstrap, naming-conventions, language, atlassian-sync...).
- [ ] `.codex/scripts/mermaid-verify.mjs` có; SKILL.md đã rewrite **cả `.claude/` lẫn token `${CLAUDE_PLUGIN_ROOT:-.claude}/`** → `.codex/` (gồm cả path chia sẻ mà `/scan-project` gọi).
- [ ] Agent `diagram-reviewer` thành `.codex/agents/diagram-reviewer.toml`.
- [ ] `npm install` xong trong `.codex/skills/bpmn/engine/`.
- [ ] `/sync-confluence`: xác nhận Codex có Atlassian MCP tương đương (đã auth) — nếu không, đánh dấu skill này "skip".
- [ ] Chạy thử mỗi engine 1 skill → render OK, compile-check OK.
