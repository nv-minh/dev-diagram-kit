---
type: skill-explainer
skill: api-family
updated: 2026-08-01
---

# Họ skill tích hợp API — chuỗi 7 bước

[English](api-family.md) · **Tiếng Việt**

## 1. Vì sao có họ skill này

Tích hợp API bên thứ ba là một chuỗi quyết định có thể dự đoán, và làm sai thứ tự là nơi tích hợp hay hỏng (thiết kế orchestration trước khi đọc hợp đồng; test trước khi thiết kế retry). Bảy skill này ép đúng thứ tự, mỗi skill đọc skill thượng nguồn.

## 2. Chuỗi

```
/api-assess ──▶ /api-doc ──▶ /api-design ──▶ /api-map ──▶ /api-checklist ──▶ /api-test ──▶ /api-readiness
  [0] chọn       [1] tiêu hoá  [2] blueprint   [3] trường   [4] đề cương test   [5] chứng minh [6] go/no-go
  (bỏ qua nếu    (không bịa)                   (bỏ qua nếu  (test_layer +       (Bruno)        (từ chối cứng
   đã chốt)                                     không map    direction)                         nếu thiếu [5])
                                                dữ liệu)
```

## 3. Chọn nhanh

| Bạn cần… | Chạy |
|---|---|
| Quyết định build-vs-buy / chọn provider | `/api-assess` |
| Hiểu API của họ thực sự cung cấp gì | `/api-doc <nguồn>` |
| Thiết kế TA orchestrate thế nào | `/api-design` |
| Map trường provider ↔ model ↔ UI | `/api-map` |
| Đề cương test tích hợp | `/api-checklist` |
| Chứng minh call chạy được (Bruno) | `/api-test` |
| Cổng go-live | `/api-readiness` |

## 4. Hai điểm bỏ qua + một cổng cứng

- **[0] `/api-assess`** bỏ qua được khi provider đã chốt (hợp đồng ký, nội bộ bắt buộc) — đi thẳng `/api-doc`. Đừng bịa biên bản quyết định giả.
- **[3] `/api-map`** bỏ qua được cho tích hợp trigger/webhook thuần không có dữ liệu map — nói vậy rồi đi tiếp.
- **[6] `/api-readiness` từ chối cứng "go" nếu thiếu kết quả `/api-test`** — không bật cái gì chưa chứng minh chạy được. Doc vẫn ghi, verdict `blocked`.

## 5. Những kỷ luật giúp tích hợp không bị cắn

- **`/api-doc` từ chối bịa** — mọi endpoint/auth/limit có provenance tới trang spec; chỗ chưa rõ thành OQ. Một rate limit đoán mò là bịa nguy hiểm nhất trong kit.
- **`/api-design` ghép cặp mọi webhook với đường reconciliation** — webhook không có "nếu lỡ, poll X" là bug mất dữ liệu thầm lặng; self-check bắt được.
- **`/api-design` khai báo source-of-truth từng trường** — khi cả hai bên giữ giá trị, ai đúng? Trả lời lúc thiết kế, không phải lần xung đột đầu.
- **`/api-map` đánh dấu trường không chủ + lệch tên ERD** — trường không chủ sẽ drift; đổi tên thầm lặng làm hỏng model.

## 6. Rule chung

`rules/api-integration.md` định nghĩa thứ tự chuỗi, điều kiện bỏ qua, ngữ nghĩa cột `test_layer`/`direction`, quy tắc provider-suffix, layout Bruno, và bảng go/no-go. Mọi skill tham chiếu nó.

## 7. Ví dụ làm sẵn

`example/atlas-re/integration/` mang `api-design.md` + `api-map.md` cho một provider dữ liệu catastrophe-model hư cấu (tích hợp cấp số liệu cho pricing engine), cho thấy orchestration, cặp webhook⇄reconciliation, và bản đồ trường 3 lớp kèm chủ.

## Xem thêm

- `explain-skills/testing-family.vi.md` — `/test-checklist`/`/test-cases`, phiên bản feature-wide của `/api-checklist`/`/api-test`
- `rules/api-integration.md` — hợp đồng chuỗi
- `rules/doc-selection.md` — ma trận đầy đủ + trạng thái wave
