---
type: skill-explainer
skill: wireframe-family
updated: 2026-08-01
---

# Họ skill wireframe — /wireframe-ascii /wireframe-html /prototype-html /figma

[English](wireframe-family.md) · **Tiếng Việt**

## 1. Vì sao có họ skill này

Khi user flow đã chốt có những màn hình nào và nối nhau ra sao, phải có người vẽ. Bốn skill này là lớp vẽ — bốn mức trung thực, một nguồn chân lý. Tất cả đều gate trên file đã duyệt của `/user-flow` (số màn hình `[n]` và `primary_device` là hợp đồng mà mọi skill tuân theo).

## 2. Chọn nhanh

| Bạn cần… | Chạy | Sản phẩm |
|---|---|---|
| Phác màn hình xem trong chat | `/wireframe-ascii <feature> --flow <slug>` | Khung ASCII + bảng 5 cột |
| Cùng màn hình đó xem trên trình duyệt | `/wireframe-html <feature> --flow <slug>` | HTML tĩnh đen-trắng + entry điều hướng |
| Chứng minh navigation chạy thật | `/prototype-html <feature>` | một prototype clickable tự chứa |
| Đẩy khung lên Figma | `/figma <feature>` | Frame Figma (URL vào index) |

## 3. Thang trung thực + nguồn chân lý duy nhất

```
   /user-flow  (srs/{f}-userflow.md — màn hình [n], flow, primary_device, stage: approved + hash)
        │  hợp đồng mọi skill đọc
        ▼
   /wireframe-ascii  ──nguồn chân lý nội dung──▶  /wireframe-html  ──▶  /prototype-html
   (chat, L3)                                       (trình duyệt, tĩnh)    (clickable)
        │                                                  │                    │
        └──────────────────── cả ba cùng ghi {f}-wireframe-index.md (cột Figma/HTML/HTML-prototype)
                                                                            ▲
   /figma đọc wireframe, đẩy frame Figma, ghi URL vào index (cổng external-write)
```

**ASCII là nguồn chân lý cho nội dung.** Nếu HTML hay prototype lệch ASCII, ASCII đúng — sync lại, không tự thiết kế lại ở mức cao hơn.

## 4. Hai quy tắc mọi màn hình tuân theo

- **Một màn hình = một trạng thái tại một thời điểm** (`ba-conventions.md` §8) — trạng thái lỗi là màn hình riêng, không gộp lộn xộn.
- **Bảng mô tả 5 cột mới là sản phẩm, không phải khung** (`ba-conventions.md` §6) — `# / Items / Control type / Data type / Description`, 6 lớp thông tin mỗi phần tử, lấy từ SRS/UC/URD (không bịa; chỗ thiếu thì hỏi hoặc đánh dấu).

## 5. Ví dụ làm sẵn

`example/atlas-re/ascii-wireframe/approve-claim.md` + `atlas-re-wireframe-index.md` mang flow `approve-claim`: màn hình `[1]…[4]` vẽ ASCII kèm bảng 5 cột dẫn chiếu mã FR/BR/E- của SRS, device desktop 1024. Hai shell HTML và prototype (`skills/wireframe-html/resources/`, `skills/prototype-html/resources/`) cho thấy hai mức trung thực kế tiếp.

## Xem thêm

- `explain-skills/spec-family.vi.md` — `/user-flow`, mà output các skill này gate trên
- `rules/doc-selection.md` — ma trận đầy đủ + trạng thái wave
