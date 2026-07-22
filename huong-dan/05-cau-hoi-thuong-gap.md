# 05 — Câu hỏi thường gặp & xử lý sự cố

---

## Cài đặt & môi trường

**H: Tôi chỉ muốn dùng `/sequence`, có phải cài hết không?**
Không. Cài đúng engine của skill bạn dùng. `/sequence /activity /state /erd` chỉ cần Mermaid (Node + mmdc + Chrome). Xem bảng ở `01-cai-dat-cong-cu.md`.

**H: `mmdc` báo không tìm thấy Chrome.**
Cài Chrome cho headless: `npx puppeteer browsers install chrome`, rồi set `export PUPPETEER_EXECUTABLE_PATH="/đường/dẫn/Google Chrome for Testing"`. Script `mermaid-verify.mjs` tự tìm ở `~/.puppeteer-cache`.

**H: `d2: command not found`.**
Cài: `curl -fsSL https://d2lang.com/install.sh | sh -s --`. D2 vào `~/.local/bin` — đảm bảo thư mục này trong `PATH` (`export PATH="$HOME/.local/bin:$PATH"`).

**H: `/bpmn` báo thiếu module.**
Chạy `npm install` trong `.claude/skills/bpmn/engine/` (gói không kèm `node_modules`). Cần một lần. Cài bằng **plugin** hoặc **`./install.sh`** thì bước này đã tự chạy — chỉ chạy tay khi báo thiếu.

**H: `/dbdiagram` báo `dbml2sql` không có.**
`npm install -g @dbml/cli`.

**H: `/sync-confluence` báo chưa có Atlassian MCP.**
Skill này ghi qua **Atlassian MCP**, không phải render tool. Gõ `/mcp` → chọn Atlassian (Rovo) → hoàn tất OAuth, và đảm bảo tài khoản có quyền **ghi** trang đích. Xem `01-cai-dat-cong-cu.md` Mục 7 + `rules/atlassian-sync.md`.

---

## Song ngữ EN/VI

**H: Output ra tiếng Việt hay tiếng Anh?**
Tự bám ngôn ngữ bạn gõ: mô tả tiếng Anh → nhãn diagram + câu hỏi + báo cáo bằng English; tiếng Việt → VI. Ép bằng `--lang en|vi`. Keyword cú pháp engine (Mermaid/D2/PlantUML/BPMN/DBML) và tên định danh kỹ thuật thật (table/service/endpoint) **luôn** giữ English. Chi tiết: `rules/language.md`.

**H: Chạy lại trên file đã có, đổi ngôn ngữ được không?**
Update mode mặc định theo **ngôn ngữ file đang có** cho nhất quán. Muốn đổi → thêm `--lang` tường minh.

---

## Render & hiển thị

**H: File .md có mermaid nhưng không thấy hình.**
Mở bằng VS Code (có extension Mermaid), Obsidian, hoặc xem trên GitHub — chúng tự render. Chat của Claude Code **không** render mermaid (chỉ hiện code) — đó là lý do skill ghi ra file để bạn xem từ IDE, và tự compile-check thay vì bắt bạn kiểm mắt.

**H: PlantUML render ra ảnh nhưng tôi lo nội dung nhạy cảm.**
`/activity-swimlane` và `/usecase-diagram` gửi nội dung diagram tới `plantuml.com` để render. Nghiệp vụ nhạy cảm → cài PlantUML + Java local và sửa `render.sh` trỏ server nội bộ, hoặc dùng Mermaid/D2 (render offline).

**H: BPMN editor HTML mở ra trắng.**
Editor tải bpmn-js qua CDN (unpkg) — cần internet khi mở. Không có mạng → import file `.bpmn` vào Camunda Modeler / draw.io (offline). File `.bpmn` đã chứa cả toạ độ diagram.

**H: D2 chỉ ra SVG, không có PNG.**
PNG cần Chrome. Không có Chrome → vẫn có SVG (mở bằng browser là đủ). Muốn PNG: cài Chrome rồi chạy lại với `--png`.

---

## Chọn skill

**H: Quy trình của tôi có nhiều vai trò, dùng `/activity` hay `/activity-swimlane`?**
Nhiều vai + tương tác chéo → **`/activity-swimlane`** (swimlane thật). `/activity` (Mermaid) chỉ hợp flow gọn 1-2 vai cần nhúng inline. Xem `02-chon-skill-nao.md`.

**H: `/activity-swimlane` với `/bpmn` khác gì?**
Cả 2 đều swimlane đa vai. `/activity-swimlane` nhẹ, mô tả nghiệp vụ trong tài liệu BA. `/bpmn` khi cần **chuẩn OMG** hoặc **import Camunda/Bizagi** (file .bpmn chạy được trên workflow engine).

**H: `/erd`, `/d2-erd`, `/dbdiagram` — data model 3 skill?**
Ba độ chi tiết: `/erd` (BA đọc, nhúng inline) → `/d2-erd` (hình đẹp standalone) → `/dbdiagram` (gần dev, có enum/index, export SQL). Chọn theo *ai xem + làm gì*.

**H: `/scan-project` với `/system-design` khác gì?**
Nguồn khác nhau: `/system-design` vẽ **từ mô tả/phỏng vấn** (feature chưa/đang thiết kế); `/scan-project` **đọc CODE** của project có sẵn (brownfield) để reverse-engineer **cả bộ** (C4 + module + quan hệ + ERD + sequence) vào `docs/_shared/architecture/`. Có codebase rồi → `/scan-project`; thiết kế mới từ đầu → `/system-design`.

**H: `/sync-confluence` có sửa code không?**
Không. Nó **read-only** phía code/vault — chỉ đọc `git diff` hoặc hội thoại rồi cập nhật **trang Confluence** in-place (có preview + xác nhận). Nó không ghi file trong `docs/`.

---

## Hành vi skill

**H: Skill hỏi lại cái tôi đã ghi trong mô tả.**
Không nên xảy ra (no re-ask rule). Nếu có, nhắc "cái này em đã nói ở trên" — skill sẽ bỏ qua. Báo lại nếu lặp nhiều.

**H: Skill hỏi tôi tên bảng DB / endpoint — có sao không?**
Không sao. Kit phục vụ **dev làm công việc BA**, nên với **diagram kỹ thuật** (`/erd` `/dbdiagram` `/sequence` · C4 Container · `/scan-project`) skill **được** dùng/hỏi chi tiết kỹ thuật thật (column/endpoint/schema/framework) — rule cũ cấm chuyện này đã bỏ (`rules/ba-conventions.md` Mục 3). Chỉ với **diagram giao tiếp nghiệp vụ** (use case, activity nghiệp vụ, C4 Context) thì skill giữ ngôn ngữ dễ hiểu, đúng altitude cho người đọc.

**H: Skill ghi file mà không hỏi tôi.**
Không được phép. Mọi skill qua L1 (xem trước) rồi mới ghi. Nếu thấy ghi im lặng → có thể chạy trong môi trường không tương tác (fork) — chạy skill ở phiên chat bình thường của Claude Code.

**H: Feature chưa tồn tại, skill có tạo được không?**
Có. Skill diagram là "điểm vào" — derive slug + hỏi phạm vi + tạo `docs/{slug}/`. Không cần chạy skill khác trước.

---

## Vẫn kẹt?

- Đối chiếu output của bạn với `example/food-delivery/` (bản mẫu đúng).
- Đọc `explain-skills/<skill>.md` để hiểu skill làm gì (ngôn ngữ nghiệp vụ).
- Đọc SKILL.md gốc trong `skills/<skill>/` (chi tiết kỹ thuật cho AI).
