---
type: skill-explainer
skill: ba
updated: 2026-08-01
---

# /ba là gì và chạy như thế nào?

[English](ba.md) · **Tiếng Việt**

## 1. Dùng để làm gì

`/ba` là **router tài liệu** — người anh em phía tài liệu của `/diagram`. Bạn mô tả tài liệu BA cần viết bằng lời thường ("viết business case cho checkout", "spec luật hoàn tiền", "user story cho payment") — nó chọn đúng skill tài liệu, hỏi tối đa 2 câu làm rõ, rồi chạy skill đó với mô tả của bạn được truyền tiếp.

Nó tồn tại vì họ skill tài liệu của kit rất rộng (discovery → spec → thiết kế UI → tích hợp API → testing → traceability → bàn giao) và đang lên sóng theo wave. Thay vì phải nhớ skill nào làm gì, bạn chỉ cần mô tả nhu cầu.

## 2. Toàn bộ một lần chạy — sơ đồ

```
bạn: /ba "viết business case cho checkout v2"
        │
        ▼
┌─────────────────────────────┐
│ đọc nhu cầu                 │  mô tả trong ngoặc, --feature, @file
├─────────────────────────────┤
│ khớp bảng routing           │  rules/doc-selection.md = nguồn chân lý
├─────────────────────────────┤
│ mơ hồ? hỏi ≤2 câu           │  Q1 độ cao/giai đoạn · Q2 phạm vi/nguồn
├─────────────────────────────┤
│ kiểm cột status             │  planned (wave N) → báo bạn + gợi ý skill gần nhất
├─────────────────────────────┤
│ công bố + bàn giao          │  → /brd "checkout v2" (vì là business case)
└─────────────────────────────┘
```

## 3. Hai câu hỏi

1. **Độ cao/giai đoạn** — đang khai phá, định nghĩa business/product, đặc tả hệ thống, thiết kế màn hình, kiểm thử, hay bàn giao?
2. **Phạm vi hoặc nguồn** — cả product hay một feature? Từ ý tưởng trong đầu, từ code/tài liệu cũ, hay từ API bên thứ ba?

Nếu bảng routing quyết được trong một hàng, nó không hỏi gì cả.

## 4. Những gì nó không bao giờ làm

- Không bao giờ tự viết tài liệu — luôn bàn giao cho skill chuyên trách.
- Không bao giờ route tới skill chưa lên sóng (hàng `planned (wave N)`) — nó báo skill sắp có và gợi ý dùng gì hôm nay.
- Nhu cầu dạng hình ảnh (flow, state, data model, kiến trúc) chuyển sang `/diagram`.

## Xem thêm

- `explain-skills/diagram-selection.md` — biển chỉ đường phía sơ đồ
- `rules/doc-selection.md` — ma trận quyết định đầy đủ sau router này
