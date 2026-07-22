# 02 — Chọn skill nào? (cây quyết định)

> 14 skill nghe nhiều, nhưng chọn đúng rất nhanh nếu hỏi đúng câu. Bản này là rút gọn; bản đầy đủ ở `explain-skills/diagram-selection.vi.md`.

---

## Cây quyết định 30 giây

**Bạn muốn thể hiện điều gì?**

- **Ai gọi ai, theo trình tự thời gian** (login, thanh toán, webhook, gọi API bên ngoài)
  → **`/sequence`**

- **Một đối tượng có nhiều trạng thái + chuyển trạng thái** (Đơn: chờ → đã trả → đang giao → hoàn tất)
  → **`/state`**

- **Một quy trình có nhiều bước + nhánh quyết định**
  - Nhiều vai trò làm bước khác nhau, tương tác chéo nhiều → **`/activity-swimlane`** ⭐ (swimlane thật)
  - Cần chuẩn OMG / import Camunda-Bizagi → **`/bpmn`**
  - 1-2 vai, đơn giản, muốn nhúng thẳng vào file .md (GitHub/Obsidian tự hiện) → **`/activity`**
  - Nhiều nhánh, muốn hình **đẹp** đứng riêng (slide/export), không cần swimlane thật → **`/d2-activity`**

- **Mô hình dữ liệu (bảng + quan hệ)**
  - Cho BA đọc trong tài liệu, nhúng inline → **`/erd`**
  - Hình đẹp standalone (PK/FK rõ, cho slide) → **`/d2-erd`**
  - Bàn giao dev / export SQL / dbdocs (có enum, index, kiểu DB thật) → **`/dbdiagram`**

- **Phạm vi hệ thống — ai (actor) làm được những gì (use case)**
  → **`/usecase-diagram`**

- **Kiến trúc / thiết kế hệ thống**
  - Cần **nhanh 1 bức tranh bối cảnh** (app, service, DB, dịch vụ ngoài lồng nhau) → **`/d2-architect`**
  - Cần **thiết kế theo C4 đa tầng** (System Context → Container → Component) + bản HTML trình bày (export PNG/PDF) → **`/system-design`**

---

## 2 skill mở rộng (không vẽ từ mô tả — cho dev làm công việc BA)

Hai skill này khác cả nhóm trên: chúng **không** vẽ từ lời mô tả bạn gõ.

- **Đã có codebase (brownfield), muốn tự sinh BỘ diagram kiến trúc từ CODE** (C4 + bản đồ module + quan hệ + ERD + sequence luồng chính)
  → **`/scan-project`** — reverse-engineer bằng cách **đọc mã nguồn** (khác `/system-design`/`/d2-architect` vẽ từ mô tả/phỏng vấn). 2 pha: scan → plan (HARD STOP xác nhận) → sinh. Cần `d2`. Output cố định `docs/_shared/architecture/`.

- **Code hoặc quyết định vừa đổi, muốn cập nhật lại trang Confluence cho khớp**
  → **`/sync-confluence`** — sync **git diff hoặc hội thoại → Confluence**, sửa **in-place** (chỉ section liên quan, giữ macro/bảng), **luôn preview + xác nhận trước khi ghi**. Cần **Atlassian MCP** đã auth (`/mcp`).

---

## Bảng so sánh 3 họ dễ nhầm

### Họ "quy trình" (4 skill cùng vẽ flow)

| | Engine | Swimlane thật? | Nhúng inline? | Import BPM tool? | Khi nào |
|---|---|---|---|---|---|
| `/activity` | Mermaid | ✗ (subgraph giả) | ✓ | ✗ | Flow gọn, muốn hiện thẳng trong .md |
| `/d2-activity` | D2 | ✗ | ✗ | ✗ | Hình đẹp standalone nhiều nhánh |
| `/activity-swimlane` ⭐ | PlantUML | ✓ | ✗ (nhúng ảnh) | ✗ | **Mặc định đa vai trò** |
| `/bpmn` | Engine OMG | ✓ (pool/lane) | ✗ | ✓ | Cần chuẩn OMG / Camunda |

### Họ "dữ liệu" (3 skill cùng vẽ data model)

| | Engine | Ai xem | Enum/index | Export SQL |
|---|---|---|---|---|
| `/erd` | Mermaid | BA trong tài liệu | ✗ | ✗ |
| `/d2-erd` | D2 | Slide/export đẹp | ✗ | ✗ |
| `/dbdiagram` | DBML | **Dev/DBA** | ✓ | ✓ (`dbml2sql`) |

### Họ "kiến trúc" (2 skill cùng vẽ hệ thống)

| | Engine | Số tầng | Output | Khi nào |
|---|---|---|---|---|
| `/d2-architect` | D2 | 1 (bức tranh bối cảnh) | `.d2` + `.svg` | Cần nhanh 1 hình kiến trúc nhét vào doc |
| `/system-design` | D2 | 2-3 (C4: Context / Container / Component) | nhiều `.d2/.svg` theo tầng **+ bản HTML trình bày** (export PNG/PDF) | Kể chuyện hệ thống nhiều mức cho stakeholder/slide |

### Use case: diagram vs text

- **`/usecase-diagram`** = hình tổng quan (actor + use case + include/extend). Trong bộ này.
- **`/usecase`** (skill text, KHÔNG có trong bộ này) = viết chi tiết từng use case dạng prose. Nếu cần, lấy từ bộ DIAGRAM-KIT đầy đủ.

---

## Gợi ý: một feature thường cần nhiều sơ đồ

Xem `example/food-delivery/` — cùng một feature "đặt & giao đồ ăn" được vẽ bằng:

- `/sequence` (đặt món + thanh toán, giao hàng)
- `/activity` + `/activity-swimlane` + `/bpmn` (cùng quy trình xử lý đơn, 3 cách trình bày)
- `/state` (vòng đời Order + Payment)
- `/erd` + `/d2-erd` + `/dbdiagram` (cùng data model, 3 độ chi tiết)
- `/usecase-diagram` (phạm vi hệ thống)
- `/d2-architect` (kiến trúc)

→ Đừng vẽ mọi sơ đồ cho mọi flow. Nguyên tắc: **sơ đồ phục vụ giao tiếp, không phải để khoe.** Vẽ cái giúp người đọc hiểu nhanh nhất.
