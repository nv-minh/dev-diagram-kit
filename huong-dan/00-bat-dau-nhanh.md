# 00 — Bắt đầu nhanh (5 phút)

> Mục tiêu: cài xong và vẽ được sơ đồ đầu tiên trong ~5 phút. Nếu chỉ muốn thử **một** loại sơ đồ, cài đúng công cụ cho engine đó là đủ (không cần cài hết).

> **Song ngữ EN/VI:** output (nhãn diagram + câu hỏi phỏng vấn + báo cáo) tự bám ngôn ngữ bạn gõ — gõ tiếng Anh → output English, gõ tiếng Việt → output VI; ép bằng `--lang en|vi` (theo `rules/language.md`). Keyword cú pháp engine + tên định danh kỹ thuật thật (table/service/endpoint) luôn giữ English.

---

## Bước 1 — Chọn engine bạn muốn thử

| Muốn vẽ | Skill | Cần cài |
|---|---|---|
| Sequence / flowchart / state / ERD (nhúng inline .md) | `/sequence` `/activity` `/state` `/erd` | Node + `mmdc` + Chrome |
| Swimlane thật / use case diagram | `/activity-swimlane` `/usecase-diagram` | **Chỉ cần internet** (render qua plantuml.com) |
| Sơ đồ D2 đẹp (activity / erd / kiến trúc) | `/d2-activity` `/d2-erd` `/d2-architect` | Binary `d2` |
| Thiết kế hệ thống C4 (Context→Container→Component) + bản HTML | `/system-design` | Binary `d2` |
| BPMN chuẩn OMG | `/bpmn` | Node + `npm install` trong engine |
| Schema DBML + SQL | `/dbdiagram` | `@dbml/cli` |

> **Dễ nhất để thử ngay:** `/activity-swimlane` hoặc `/usecase-diagram` — chỉ cần mạng, không cài gì thêm.

> **2 skill mở rộng** (không vẽ từ mô tả — dành cho **dev làm công việc BA**):
> - `/scan-project` — scan **codebase có sẵn (brownfield)** → tự sinh bộ diagram kiến trúc (C4 + module + quan hệ + ERD + sequence). Cần binary `d2` (+ `mmdc` cho sequence).
> - `/sync-confluence` — sync thay đổi **code/hội thoại → trang Confluence** (sửa in-place, preview trước khi ghi). Cần **Atlassian MCP** đã auth (`/mcp`), không phải render tool.
>
> Xem `02-chon-skill-nao.md` và `03-huong-dan-tung-skill.md`.

Cài chi tiết: `01-cai-dat-cong-cu.md`.

---

## Bước 2 — Cài skill vào workspace BA

Có **2 cách**. Cách A gọn nhất cho Claude Code; cách B dùng được cho mọi trường hợp / tool khác.

### Cách A — Plugin (khuyên dùng cho Claude Code)

Trong Claude Code, chỉ 2 lệnh:
```
/plugin marketplace add <đường-dẫn-hoặc-repo này>
/plugin install dev-diagram-kit
```

Xong — **14 lệnh `/...` có sẵn ngay** (12 vẽ diagram + `/scan-project` + `/sync-confluence`). Engine BPMN tự `npm install` qua SessionStart hook (không phải làm tay).

### Cách B — Copy thủ công (mọi trường hợp / tool khác)

Từ thư mục gốc gói này, chạy script cài:
```bash
# Thay <workspace> bằng workspace BA của bạn (nơi có CLAUDE.md + docs/)
./install.sh <workspace>
```

Script copy `skills/ agents/ rules/ scripts/ templates/` vào `<workspace>/.claude/{skills,agents,rules,scripts,templates}`, tự `npm install` engine BPMN, rồi chạy `scripts/doctor.sh` để health-check công cụ render (in ✅/❌ + cách cài).

> **Lưu ý:** templates giờ nằm ở `<workspace>/.claude/templates/` (KHÔNG còn `_templates/` ở gốc workspace như trước).
> Rule trùng tên với bộ DIAGRAM-KIT sẵn có → cứ giữ bản của workspace, không đè.

---

## Bước 3 — Mở Claude Code tại workspace và chạy

```bash
cd <workspace>
claude
```

Trong chat gõ (không cần chuẩn bị gì — skill sẽ hỏi lại chỗ thiếu):

```
/activity-swimlane "Khách đặt món; hệ thống tính tiền và gọi cổng thanh toán;
nhà hàng xác nhận rồi chuẩn bị; hệ thống gán shipper; shipper giao;
khách nhận. Nhánh lỗi: thanh toán fail, nhà hàng từ chối, giao thất bại" --feature food-delivery
```

Skill sẽ:
1. Hỏi lại vài điểm còn mơ hồ (ai làm bước nào, nhánh rẽ ở đâu).
2. Xem trước kế hoạch ghi file (**L1 plan** — bạn gõ `Y` để đồng ý).
3. Vẽ + render `.svg`/`.png` + tự kiểm.

---

## Bước 4 — Xem kết quả mẫu trước khi tự làm

Mở thư mục `example/food-delivery/` trong gói này — đó là **feature nhiều luồng** đã vẽ sẵn qua **11/12 skill** (chưa gồm `/system-design`), kèm ảnh render trong `example/food-delivery/_rendered/`. Đối chiếu output của bạn với bản mẫu để biết "đúng thì trông thế nào".

Đọc `example/README.md` để có bản đồ file → skill.

---

## Không chắc chọn skill nào?

→ `02-chon-skill-nao.md` (cây quyết định) hoặc `explain-skills/diagram-selection.vi.md` (hub đầy đủ).

## Gặp lỗi?

→ `05-cau-hoi-thuong-gap.md` (FAQ + xử lý sự cố render).
