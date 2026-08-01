# 07 — Hướng dẫn tích hợp API & bàn giao

[English](../guides/07-api-and-delivery.md) · **Tiếng Việt**

> Chuỗi tích hợp API (wave 5) và sau này là họ bàn giao & sync (wave 6). Mỗi skill: cú pháp, cần chuẩn bị gì, hỏi gì, output ở đâu. Tất cả tuân **approval gate** và qua **`doc-validate`** trước khi báo xong.

Ký hiệu: `<slug>` = tên feature dạng kebab-case. Thứ tự chuỗi 7 bước bắt buộc (với hai điểm bỏ qua); xem `rules/api-integration.md`.

---

## Chuỗi tích hợp API — `/api-assess → /api-doc → /api-design → /api-map → /api-checklist → /api-test → /api-readiness`

### 1. `/api-assess` — build-vs-buy / chọn provider [0]

**Cú pháp:** `/api-assess <feature> ["<nhu cầu>"]`

**Dùng khi:** feature cần tích hợp bên thứ ba và chưa chọn provider. **Bỏ qua được** khi provider đã chốt (đi thẳng `/api-doc`).

**Output:** `docs/{slug}/integration/api-assess.md` — bảng điểm có trọng số (ứng viên × tiêu chí) + khuyến nghị dẫn tiêu chí quyết định.

**Mẹo:** mỗi ô điểm cần căn cứ (docs provider, báo giá); chỗ chưa rõ → OQ, không đoán SLA.

---

### 2. `/api-doc` — tiêu hoá hợp đồng bên thứ ba [1]

**Cú pháp:** `/api-doc <feature> [--provider <tên>] <nguồn-openapi-hoặc-docs>`

**Dùng khi:** đã chọn provider và cần tóm tắt nội bộ cái HỌ cung cấp. **Từ chối bịa** — không nguồn thì hỏi.

**Output:** `docs/{slug}/integration/api-summary.md` (hoặc `api-summary-{provider}.md`) — endpoint/auth/webhook/rate-limit/lỗi, mỗi dòng dẫn provenance tới trang spec.

**Mẹo:** ghi phiên bản spec; bump v2→v3 âm thầm làm hỏng design.

---

### 3. `/api-design` — Integration Blueprint [2]

**Cú pháp:** `/api-design <feature>`

**Dùng khi:** thiết kế TA orchestrate tích hợp. Cần tóm tắt từ `/api-doc`.

**Output:** `docs/{slug}/integration/api-design.md` — orchestration + state-map + source-of-truth từng trường + xử lý webhook (mỗi cái có cặp reconciliation) + retry + degraded-UX.

**Mẹo:** webhook không có đường reconciliation là bug mất dữ liệu thầm lặng — self-check có sẵn cho nó.

---

### 4. `/api-map` — mapping trường 3 lớp [3]

**Cú pháp:** `/api-map <feature> [--provider <tên>]`

**Dùng khi:** map trường đầu cuối (payload provider ↔ model ↔ UI). **Bỏ qua được** cho tích hợp trigger thuần không có dữ liệu.

**Output:** `docs/{slug}/integration/api-map.md` — một dòng mỗi trường với chủ (ta/họ/dẫn xuất) + direction + transform. Đánh dấu trường không chủ + lệch tên ERD.

---

### 5. `/api-checklist` — đề cương test tích hợp [4]

**Cú pháp:** `/api-checklist <feature>`

**Dùng khi:** đề cương test toàn tích hợp. Cần design (+ map).

**Output:** `docs/{slug}/test/api/api-checklist.md` — cột `CHK-` với `test_layer` (own/3rd/mixed) + `direction` (out/in). CHK theo path (độc lập với checklist feature-wide).

---

### 6. `/api-test` — bộ sưu tập Bruno + bảng test [5]

**Cú pháp:** `/api-test <feature>`

**Dùng khi:** chứng minh call chạy được. Cần checklist.

**Output:** `docs/{slug}/test/api/api-tests.md` + `docs/{slug}/bruno/` (một collection mỗi provider; `.bru` mỗi CHK tự động hoá; env var cho auth, không bao giờ secret).

**Mẹo:** chỉ sandbox — không chạy production từ doc; secret không bao giờ vào `.bru`.

---

### 7. `/api-readiness` — cổng go-live [6]

**Cú pháp:** `/api-readiness <feature>`

**Dùng khi:** tích hợp đã xây+xong test; cổng go-live. Đọc cả chuỗi. **Từ chối cứng "go" nếu thiếu kết quả `/api-test`.**

**Output:** `docs/{slug}/integration/api-readiness.md` — cutover + feature flag (kill switch) + monitoring + rollback + SLA/deprecation + bảng go/no-go (mỗi cổng ready/blocked kèm bằng chứng).

---

## Bàn giao & sync (wave 6 — đang lên sóng)

Họ delivery (`/jira` `/confluence` `/export` `/userguide` `/meeting` `/inbox` `/doc-review` `/dashboard`) lên sóng ở wave 6. Guide này sẽ thêm các mục đó lúc đó; trước mắt xem `rules/doc-selection.md` cho đường dẫn output và trạng thái `planned (wave 6)`.
