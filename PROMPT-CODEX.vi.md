# Prompt cài bộ dev-diagram-kit vào Codex CLI

[English](PROMPT-CODEX.md) · **Tiếng Việt**

> **Cách dùng:** mở thư mục gói này trong project của bạn (hoặc copy gói vào project) → mở Codex CLI tại project → copy NGUYÊN khối prompt dưới đây → dán vào chat → gửi. Codex sẽ tự copy + chuyển đổi skill. Muốn hiểu cơ chế, xem `INSTALL-CODEX.vi.md`.

---

````text
Đây là bộ dev-diagram-kit gồm 14 skill cho dev làm công việc BA (12 skill vẽ sơ đồ + /scan-project
+ /sync-confluence), được viết ban đầu cho Claude Code.
Bạn là Codex CLI. Hãy SAO CHÉP bộ skill Claude Code có sẵn trong thư mục gói
"dev-diagram-kit/" sang .codex/ của project này và CHUYỂN ĐỔI cấu trúc, path và
cơ chế cho tương thích với Codex.

NGUỒN (đọc trước khi làm) — cây chuẩn nay nằm ở GỐC repo (cây claude-code/ cũ đã bỏ):
- 14 skill:   dev-diagram-kit/skills/
              (sequence, activity, activity-swimlane, bpmn, erd, state,
               usecase-diagram, d2-activity, d2-erd, d2-architect, system-design, dbdiagram,
               scan-project, sync-confluence)
- Rules:      dev-diagram-kit/rules/*.md
- Agent:      dev-diagram-kit/agents/diagram-reviewer.md
- Script:     dev-diagram-kit/scripts/  (mermaid-verify.mjs + doctor.sh)
- Templates:  dev-diagram-kit/templates/*.md  (đổi tên từ _templates/)
- Ví dụ mẫu:  dev-diagram-kit/example/food-delivery/  (output đúng trông thế nào;
              example dùng 11/12 skill, chưa gồm system-design)

CÁC BƯỚC:

1. Copy skills + templates GIỮ NGUYÊN:
   cp -R dev-diagram-kit/skills/.       .codex/skills/
   cp    dev-diagram-kit/templates/*.md .codex/templates/
   (tạo .codex/skills/ và .codex/templates/ nếu chưa có; templates diagram-*.md + usecase-index.md
    được /sequence /activity /state /erd /bpmn /usecase-diagram tham chiếu qua @../../templates/;
    KHÔNG còn _templates/ ở gốc project)

2. Copy rules GIỮ NGUYÊN:
   cp dev-diagram-kit/rules/*.md  .codex/rules/

3. Copy script:
   cp dev-diagram-kit/scripts/*  .codex/scripts/   (mermaid-verify.mjs + doctor.sh)

4. SỬA PATH trong mọi SKILL.md: đổi CẢ token "${CLAUDE_PLUGIN_ROOT:-.claude}/" LẪN mọi
   chuỗi ".claude/" thành ".codex/" (Codex KHÔNG set CLAUDE_PLUGIN_ROOT nên token phải rewrite).
   (đặc biệt: node "${CLAUDE_PLUGIN_ROOT:-.claude}/scripts/mermaid-verify.mjs" → node .codex/scripts/mermaid-verify.mjs;
    "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/d2-activity/render.sh" → .codex/skills/d2-activity/render.sh;
    "${CLAUDE_PLUGIN_ROOT:-.claude}/skills/bpmn/engine/bpmn-build.mjs" → .codex/skills/bpmn/engine/bpmn-build.mjs).
   scan-project TÁI DÙNG đúng các path chia sẻ đó (render.sh, mermaid-verify.mjs,
   skills/system-design/resources/c4-export-template.html) → cùng quy tắc rewrite phủ luôn.
   Nếu Codex báo lỗi parse frontmatter SKILL.md, chỉ giữ name + description và
   đưa cú pháp tham số (argument-hint) xuống mục "Cách gọi" trong body.

4b. sync-confluence KHÔNG gọi script/engine — nó dùng ATLASSIAN MCP (updateConfluencePage...),
   không có path để rewrite. Chỉ chạy được nếu Codex có Atlassian MCP tương đương đã cấu hình + auth.
   Nếu bản Codex này không hỗ trợ MCP đó → vẫn copy SKILL.md nhưng BỎ QUA skill (báo trong report).

5. CHUYỂN AGENT REVIEW sang TOML:
   - Tạo .codex/agents/diagram-reviewer.toml với:
       description = '<dòng description trong frontmatter của diagram-reviewer.md>'
       developer_instructions = """<toàn bộ body của diagram-reviewer.md>"""

6. CÀI dependency engine BPMN (một lần):
   cd .codex/skills/bpmn/engine && npm install

RÀNG BUỘC:
- KHÔNG đổi logic nghiệp vụ của skill (hỏi/chọn chi tiết ở đúng altitude theo người đọc — kit phục vụ
  dev làm BA, ĐƯỢC dùng chi tiết kỹ thuật thật; approval gate L1/L2; compile-check/validate/semcheck
  trước khi báo xong; giữ hành vi song ngữ EN/VI theo rules/language.md).
- Engine render (Mermaid mmdc, PlantUML plantuml.com, D2 binary, BPMN engine, dbml2sql)
  cần cài sẵn ở máy — nếu thiếu, báo tôi lệnh cài (xem huong-dan/01-cai-dat-cong-cu.md).
  scan-project cần d2 + mmdc; sync-confluence cần Atlassian MCP (không phải engine render).

BÁO CÁO sau khi xong:
1. Cây thư mục .codex/ đã tạo.
2. Danh sách path đã sửa (cả ".claude/" LẪN token "${CLAUDE_PLUGIN_ROOT:-.claude}/" → .codex/).
3. Engine nào chưa cài trên máy này + lệnh cài; sync-confluence có Atlassian MCP hay phải skip.
Rồi chạy thử: /usecase-diagram --feature food-delivery (hoặc 1 skill Mermaid) và xác nhận
skill DỪNG ở L1 plan trước khi ghi, không tự ghi im lặng.
````
