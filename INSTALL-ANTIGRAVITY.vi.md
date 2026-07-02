# Port bộ dev-diagram-kit sang Google Antigravity IDE

[English](INSTALL-ANTIGRAVITY.md) · **Tiếng Việt**

> Đưa 14 skill (12 vẽ diagram + `/scan-project` + `/sync-confluence`, vốn viết cho Claude Code) sang **Google Antigravity IDE**. Gồm: (A) cấu trúc cấu hình Antigravity, (B) ánh xạ Claude Code → Antigravity, (C) prompt copy-paste ở `PROMPT-ANTIGRAVITY.vi.md`.
>
> Cập nhật theo tài liệu Antigravity tới ~6/2026. Path có thể đổi giữa các bản — luôn đối chiếu cây thư mục thật trong IDE (xem cảnh báo A.3).
>
> ⚠️ **`/sync-confluence` phụ thuộc Atlassian MCP:** skill này không dùng render engine mà gọi Atlassian MCP (`updateConfluencePage`...). Nó chỉ chạy nếu Antigravity có **Atlassian MCP tương đương** đã cấu hình + auth; nếu không → vẫn copy SKILL.md nhưng skill sẽ không hoạt động, **bỏ qua** nó.

---

## A. Antigravity cấu hình thế nào

### A.1 — Vị trí (workspace / project scope)

| Loại | Đường dẫn | Vai trò |
|---|---|---|
| **Skills** | `<project-root>/.agents/skills/{name}/SKILL.md` | "Sổ tay" agent nạp khi liên quan. Tương đương skill Claude Code. |
| **Rules** | `<project-root>/.agents/rules/*.md` | Như system instruction — luôn áp dụng. |
| **Workflows** | `<project-root>/.agent/workflows/*.md` | Prompt lưu sẵn, gọi bằng `/<tên>` trong chat. |
| **AGENTS.md** | `<project-root>/AGENTS.md` | Nền tảng chung (Antigravity + Cursor + Claude Code đều đọc). |

### A.2 — Global scope (mọi project)

| Loại | Đường dẫn |
|---|---|
| Skills | `~/.gemini/config/skills/` |
| Rules | `~/.gemini/GEMINI.md` |

### A.3 — ⚠️ Cảnh báo tên thư mục (`.agent` vs `.agents`)

Điểm dễ sai nhất — nguồn tài liệu lẫn số ít/số nhiều:
- **Skills/Rules:** đa số dùng **`.agents/`** (số nhiều).
- **Workflows:** có nguồn ghi `.agent/workflows/`, có nguồn `.agents/workflows/`; Antigravity còn cho tạo workflow qua UI.

👉 **Trước khi copy, tạo thử 1 skill rỗng qua UI/lệnh của Antigravity để xem nó đẻ ra thư mục tên gì.** Dùng đúng tên đó. Hướng dẫn dưới mặc định `.agents/`.

### A.4 — SKILL.md của Antigravity

Frontmatter tối giản:
```yaml
---
name: sequence
description: <trigger phrase NGỮ NGHĨA, càng cụ thể càng dễ kích hoạt đúng>
---
```
- `description` là **bắt buộc** và là "trigger phrase" — mô tả cụ thể ("Vẽ sequence diagram cho flow login/thanh toán/webhook, xuất Mermaid vào srs/flows.md") mới được nạp đúng.
- Kích hoạt qua ngôn ngữ tự nhiên; muốn gõ `/sequence` thì tạo thêm Workflow mỏng (B.4).

---

## B. Ánh xạ Claude Code → Antigravity

| Thành phần Claude Code | Trong gói | → Antigravity |
|---|---|---|
| `.claude/skills/{name}/SKILL.md` | `skills/` (14 skill, gồm `system-design`, `scan-project`, `sync-confluence`) | `.agents/skills/{name}/SKILL.md` (sửa frontmatter, B.1) |
| `.claude/agents/diagram-reviewer.md` | `agents/` | nhúng inline vào skill (B.2) hoặc subagent Antigravity 2.0 |
| `.claude/rules/*.md` | `rules/` | `.agents/rules/*.md` (giữ nội dung) |
| `.claude/scripts/mermaid-verify.mjs` | `scripts/` (+ `doctor.sh`) | `.agents/skills/_shared/mermaid-verify.mjs` (hoặc cạnh skill dùng nó) |
| `.claude/templates/*.md` | `templates/` (đổi tên từ `_templates/`) | `.agents/templates/` (để `@../../templates/` trong SKILL.md resolve được) |
| engine (render.sh, plantuml_encode.py, bpmn/engine/) | trong từng skill | giữ trong `.agents/skills/{name}/` |

> **Nguồn copy nằm ở GỐC repo gói này**: `skills/ agents/ rules/ scripts/ templates/`. Cây `claude-code/...` cũ đã bỏ — không tham chiếu nữa.

### B.1 — Frontmatter SKILL.md

- **Giữ:** `name`, `description`.
- **Bỏ:** `allowed-tools`, `user-invocable`, `context`, `argument-hint`.
- Cú pháp tham số (`/sequence "<desc>" --feature <slug>`) → chuyển xuống mục "Cách gọi" trong body.

### B.2 — Agent review (`diagram-reviewer`)

Claude Code spawn qua Task tool; Antigravity không có y hệt. Hai cách:
1. **Inline (khuyến nghị khi mới port):** nhúng nội dung `diagram-reviewer.md` thành mục "Tiêu chí tự review diagram" trong SKILL.md của `/sequence` + `/activity`, để agent tự soi coverage (actor/lane thiếu, nhánh error bỏ sót, dead-end) trước khi báo xong.
2. **Subagent (Antigravity 2.0):** nếu bản của bạn hỗ trợ subagents, tách thành subagent và gọi như một bước.

### B.3 — Path scripts/engine trong SKILL.md

SKILL.md gọi script/engine qua token **dual-mode** `${CLAUDE_PLUGIN_ROOT:-.claude}/...` (ví dụ `node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs"`, `"${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh"`, `node "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/bpmn-build.mjs"`). Antigravity không set `CLAUDE_PLUGIN_ROOT` → rà và đổi **cả token `${CLAUDE_PLUGIN_ROOT:-.claude}/` LẪN mọi chuỗi `.claude/`** cho khớp vị trí mới trong `.agents/`. Reference `@../../rules/...` → bỏ (rule ở `.agents/rules/` được auto-load) hoặc sửa path.

`/scan-project` tái dùng đúng các path chia sẻ đó (`skills/d2-activity/render.sh`, `scripts/mermaid-verify.mjs`, `skills/system-design/resources/c4-export-template.html`) → cùng quy tắc rewrite phủ luôn. `/sync-confluence` **không** gọi script/engine — nó dùng **Atlassian MCP**, không có path để rewrite; chỉ chạy nếu Antigravity có Atlassian MCP tương đương đã auth (không có → bỏ qua, xem caveat đầu file).

### B.4 — (Tùy chọn) Lệnh `/sequence`, `/erd`...

Muốn gõ lệnh như Claude Code: tạo Workflow mỏng `.agent/workflows/{name}.md` (frontmatter có `description`) trỏ về skill.

---

## C. Điểm cần chú ý

- **Engine render vẫn cần cài ở máy** (mmdc, d2, dbml2sql, npm install bpmn engine) — Antigravity chỉ thay lớp điều phối AI, không thay engine. Xem `huong-dan/01-cai-dat-cong-cu.md`. `/scan-project` cần `d2` + `mmdc`.
- **PlantUML** (`/activity-swimlane`, `/usecase-diagram`) render qua internet — giữ nguyên.
- **`/sync-confluence` (Atlassian MCP):** không phải engine render mà là MCP tool. Chỉ hoạt động nếu Antigravity có Atlassian MCP tương đương đã auth; không có → bỏ qua skill này.

---

## D. Prompt tự động

Không cần làm tay từng bước — mở gói này trong Antigravity IDE, **mở `PROMPT-ANTIGRAVITY.vi.md` và dán toàn bộ prompt trong đó vào chat agent**. AI sẽ tự sao chép + chuyển đổi bộ skill Claude Code sang chuẩn Antigravity IDE (prompt đã dặn agent bám tài liệu Antigravity mới nhất ~06/2026).

---

## E. Checklist sau khi port

- [ ] `.agents/skills/` có đủ 14 skill (gồm `system-design`, `scan-project`, `sync-confluence`), frontmatter chỉ còn `name` + `description`.
- [ ] `.agents/rules/` có các rule (gồm `language.md` + `atlassian-sync.md`); `.agents/templates/` có `diagram-*.md` + `usecase-index.md`.
- [ ] Path scripts/engine trong SKILL.md đã trỏ đúng vị trí `.agents/` — đã đổi **cả `.claude/` lẫn token `${CLAUDE_PLUGIN_ROOT:-.claude}/`** (gồm cả path chia sẻ mà `/scan-project` gọi).
- [ ] Tiêu chí `diagram-reviewer` nằm inline trong `/sequence` + `/activity` (hoặc subagent).
- [ ] Engine đã cài (mmdc/d2/dbml2sql/bpmn npm install).
- [ ] `/sync-confluence`: xác nhận Antigravity có Atlassian MCP tương đương (đã auth) — nếu không, đánh dấu skill này "skip".
- [ ] Chạy thử 1 skill mỗi engine → render OK.

---

## Nguồn tham khảo (Antigravity, tới ~6/2026)

- [Getting Started with Google Antigravity — Codelabs](https://codelabs.developers.google.com/getting-started-google-antigravity)
- [Authoring Antigravity Skills — Codelabs](https://codelabs.developers.google.com/getting-started-with-antigravity-skills)
- [Antigravity Docs — Skills](https://antigravity.google/docs/skills) · [Rules & Workflows](https://antigravity.google/docs/rules-workflows)
