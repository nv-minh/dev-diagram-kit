# 07 — Hướng dẫn tích hợp API & bàn giao

[English](../guides/07-api-and-delivery.md) · **Tiếng Việt**

> Chuỗi tích hợp API (wave 5) và họ bàn giao & sync (wave 6). Mỗi skill: cú pháp, cần chuẩn bị gì, hỏi gì, output ở đâu. Tất cả tuân **approval gate** và qua **`doc-validate`** trước khi báo xong.

Ký hiệu: `<slug>` = tên feature dạng kebab-case. Thứ tự chuỗi 7 bước bắt buộc (với hai điểm bỏ qua); xem `rules/api-integration.md`.

Phiên mô phỏng cho skill API + bàn giao. API đã commit: [`example/atlas-re/integration/`](example/atlas-re/integration/).

| Skill | Phiên mô phỏng | Ví dụ commit (nếu có) |
|---|---|---|
| `/api-assess` | [`skills/api-assess/references/example-session.md`](../skills/api-assess/references/example-session.md) | [`api-assess.md`](example/atlas-re/integration/api-assess.md) |
| `/api-doc` | [`skills/api-doc/references/example-session.md`](../skills/api-doc/references/example-session.md) | [`api-summary-catmodel.md`](example/atlas-re/integration/api-summary-catmodel.md) |
| `/api-design` | [`skills/api-design/references/example-session.md`](../skills/api-design/references/example-session.md) | [`api-design.md`](example/atlas-re/integration/api-design.md) |
| `/api-map` | [`skills/api-map/references/example-session.md`](../skills/api-map/references/example-session.md) | [`api-map.md`](example/atlas-re/integration/api-map.md) |
| `/api-checklist` | [`skills/api-checklist/references/example-session.md`](../skills/api-checklist/references/example-session.md) | chỉ guide |
| `/api-test` | [`skills/api-test/references/example-session.md`](../skills/api-test/references/example-session.md) | chỉ guide |
| `/api-readiness` | [`skills/api-readiness/references/example-session.md`](../skills/api-readiness/references/example-session.md) | chỉ guide |
| `/jira` | [`skills/jira/references/example-session.md`](../skills/jira/references/example-session.md) | external-write |
| `/confluence` | [`skills/confluence/references/example-session.md`](../skills/confluence/references/example-session.md) | external-write |
| `/export` | [`skills/export/references/example-session.md`](../skills/export/references/example-session.md) | chỉ guide |
| `/userguide` | [`skills/userguide/references/example-session.md`](../skills/userguide/references/example-session.md) | chỉ guide |
| `/meeting` | [`skills/meeting/references/example-session.md`](../skills/meeting/references/example-session.md) | chỉ guide |
| `/inbox` | [`skills/inbox/references/example-session.md`](../skills/inbox/references/example-session.md) | chỉ guide |
| `/doc-review` | [`skills/doc-review/references/example-session.md`](../skills/doc-review/references/example-session.md) | chỉ guide |
| `/dashboard` | [`skills/dashboard/references/example-session.md`](../skills/dashboard/references/example-session.md) | chỉ guide |

Discovery → spec (21 skill): [06 — Tài liệu BA](06-tai-lieu-ba.md).

---

## Chuỗi tích hợp API — `/api-assess → /api-doc → /api-design → /api-map → /api-checklist → /api-test → /api-readiness`

### 1. `/api-assess` — build-vs-buy / chọn provider [0]

**Cú pháp:** `/api-assess <feature> ["<nhu cầu>"]`

**Dùng khi:** feature cần tích hợp bên thứ ba và chưa chọn provider. **Bỏ qua được** khi provider đã chốt (đi thẳng `/api-doc`).

**Output:** `docs/{slug}/integration/api-assess.md` — bảng điểm có trọng số (ứng viên × tiêu chí) + khuyến nghị dẫn tiêu chí quyết định.

**Mẹo:** mỗi ô điểm cần căn cứ (docs provider, báo giá); chỗ chưa rõ → OQ, không đoán SLA.

**Phiên mô phỏng:** [`example-session.md`](../skills/api-assess/references/example-session.md)

---

### 2. `/api-doc` — tiêu hoá hợp đồng bên thứ ba [1]

**Cú pháp:** `/api-doc <feature> [--provider <tên>] <nguồn-openapi-hoặc-docs>`

**Dùng khi:** đã chọn provider và cần tóm tắt nội bộ cái HỌ cung cấp. **Từ chối bịa** — không nguồn thì hỏi.

**Output:** `docs/{slug}/integration/api-summary.md` (hoặc `api-summary-{provider}.md`) — endpoint/auth/webhook/rate-limit/lỗi, mỗi dòng dẫn provenance tới trang spec.

**Mẹo:** ghi phiên bản spec; bump v2→v3 âm thầm làm hỏng design.

**Phiên mô phỏng:** [`example-session.md`](../skills/api-doc/references/example-session.md)

---

### 3. `/api-design` — Integration Blueprint [2]

**Cú pháp:** `/api-design <feature>`

**Dùng khi:** thiết kế TA orchestrate tích hợp. Cần tóm tắt từ `/api-doc`.

**Output:** `docs/{slug}/integration/api-design.md` — orchestration + state-map + source-of-truth từng trường + xử lý webhook (mỗi cái có cặp reconciliation) + retry + degraded-UX.

**Mẹo:** webhook không có đường reconciliation là bug mất dữ liệu thầm lặng — self-check có sẵn cho nó.

**Phiên mô phỏng:** [`example-session.md`](../skills/api-design/references/example-session.md)

---

### 4. `/api-map` — mapping trường 3 lớp [3]

**Cú pháp:** `/api-map <feature> [--provider <tên>]`

**Dùng khi:** map trường đầu cuối (payload provider ↔ model ↔ UI). **Bỏ qua được** cho tích hợp trigger thuần không có dữ liệu.

**Output:** `docs/{slug}/integration/api-map.md` — một dòng mỗi trường với chủ (ta/họ/dẫn xuất) + direction + transform. Đánh dấu trường không chủ + lệch tên ERD.

**Phiên mô phỏng:** [`example-session.md`](../skills/api-map/references/example-session.md)

---

### 5. `/api-checklist` — đề cương test tích hợp [4]

**Cú pháp:** `/api-checklist <feature>`

**Dùng khi:** đề cương test toàn tích hợp. Cần design (+ map).

**Output:** `docs/{slug}/test/api/api-checklist.md` — cột `CHK-` với `test_layer` (own/3rd/mixed) + `direction` (out/in). CHK theo path (độc lập với checklist feature-wide).

**Phiên mô phỏng:** [`example-session.md`](../skills/api-checklist/references/example-session.md)

---

### 6. `/api-test` — bộ sưu tập Bruno + bảng test [5]

**Cú pháp:** `/api-test <feature>`

**Dùng khi:** chứng minh call chạy được. Cần checklist.

**Output:** `docs/{slug}/test/api/api-tests.md` + `docs/{slug}/bruno/` (một collection mỗi provider; `.bru` mỗi CHK tự động hoá; env var cho auth, không bao giờ secret).

**Mẹo:** chỉ sandbox — không chạy production từ doc; secret không bao giờ vào `.bru`.

**Phiên mô phỏng:** [`example-session.md`](../skills/api-test/references/example-session.md)

---

### 7. `/api-readiness` — cổng go-live [6]

**Cú pháp:** `/api-readiness <feature>`

**Dùng khi:** tích hợp đã xây+xong test; cổng go-live. Đọc cả chuỗi. **Từ chối cứng "go" nếu thiếu kết quả `/api-test`.**

**Output:** `docs/{slug}/integration/api-readiness.md` — cutover + feature flag (kill switch) + monitoring + rollback + SLA/deprecation + bảng go/no-go (mỗi cổng ready/blocked kèm bằng chứng).

**Phiên mô phỏng:** [`example-session.md`](../skills/api-readiness/references/example-session.md)

---

## Bàn giao & sync

### 8. `/jira` — push/sync story sang Jira

**Cú pháp:** `/jira <feature> [--push|--pull] [--dry-run]`

**Dùng khi:** story sẵn sàng và muốn thành issue Jira (và kéo status ngược về). **External-write HITL cứng** — preview + Y mỗi issue. Từ chối story `status: stale` (làm tươi qua `/userstory` trước).

**Output:** không doc local — issue Jira + cột `jira-key`/`status` của story index + `sync-state.yaml` `mappings.jira`. Một issue mỗi story; chỉ re-push story đổi (watermark hash).

**Phiên mô phỏng:** [`example-session.md`](../skills/jira/references/example-session.md)

---

### 9. `/confluence` — xuất tài liệu lên Confluence

**Cú pháp:** `/confluence <feature|đường-dẫn-doc> [confluence:<url-space>]`

**Dùng khi:** muốn tài liệu BA thành cây trang Confluence. **External-write HITL cứng**; dùng lại cơ chế `/sync-confluence` (cloudId, markdown-read/html-write, drift). Giữ trang có sẵn khớp code diff → `/sync-confluence`.

**Output:** trang Confluence + `sync-state.yaml` `mappings.confluence`. Drift (trang đổi ngoài kit) → cảnh báo, xem trước khi ghi đè.

**Phiên mô phỏng:** [`example-session.md`](../skills/confluence/references/example-session.md)

---

### 10. `/export` — gói stakeholder

**Cú pháp:** `/export [--scope all|<feature>] [--format md|html|pdf|docx]`

**Dùng khi:** stakeholder cần một gói tài liệu theo ngày (kèm change-history render từ activity log). PDF/DOCX cần `pandoc` (thiếu thì giảm xuống md+html).

**Output:** `docs/exports/{ngày}-{scope}-package.{ext}` — bản chụp; tài liệu nguồn vẫn là chân lý.

**Phiên mô phỏng:** [`example-session.md`](../skills/export/references/example-session.md)

---

### 11. `/userguide` — hướng dẫn end-user

**Cú pháp:** `/userguide [--feature <slug>] [--lang en|vi]`

**Dùng khi:** end-user cần hướng dẫn theo tác vụ (làm X thế nào, không phải hệ thống chạy sao). Phased — HARD STOP đề cương trước khi sinh. **Light mode bắt buộc.**

**Output:** `docs/userguide/{tên}.html` (entry, double-click) + bundle cùng tên (`index.md`/`data.js`/`pages/*.md`/`images/`). Cấu trúc gọn — chỉ `.html` hiện ở顶层.

**Phiên mô phỏng:** [`example-session.md`](../skills/userguide/references/example-session.md)

---

### 12. `/meeting` — biên bản họp

**Cú pháp:** `/meeting "<tiêu đề>" [--type standup|review|kickoff]`

**Dùng khi:** cần phút kết cấu trúc. Quyết định/cản/hành động là **bảng trong file note** (không file riêng). Hành động cần chủ + hạn (không chủ bị đánh dấu).

**Output:** `docs/meetings/YYYY-MM-DD-{type}-{slug}.md`. Quyết định chạm doc thì link (để `/gap`/`/dashboard` thấy).

**Phiên mô phỏng:** [`example-session.md`](../skills/meeting/references/example-session.md)

---

### 13. `/inbox` — capture + triage

**Cú pháp:** `/inbox "<ghi chú>"` (capture) hoặc `/inbox --triage` (route)

**Dùng khi:** cần dump ghi chú thô nhanh (capture), hoặc phân loại đống note đúng skill (triage route qua bảng `/ba`). Loại khỏi activity log (capture thô không phải event kinh doanh).

**Output:** `docs/inbox/YYYY-MM-DD-{slug}.md` (capture); triage gọi skill đích mang theo ghi chú rồi đánh dấu routed.

**Phiên mô phỏng:** [`example-session.md`](../skills/inbox/references/example-session.md)

---

### 14. `/doc-review` — review chất lượng đa agent

**Cú pháp:** `/doc-review <đường-dẫn-doc|feature> [--agents <danh-sách>]`

**Dùng khi:** muốn audit chất lượng (không phải coverage — đó là `/gap`). Sinh reviewer agent, gộp findings (BLOCKING/WARNING/SUGGESTION), áp dụng fix được duyệt thành L2 diff, dẫn dắt chuyển status. **Đổi tên từ `/review`** (trùng skill review PR ở user-level).

**Output:** sửa doc đích + chuyển status. Agent trả findings, không sửa (orchestrator áp dụng).

**Phiên mô phỏng:** [`example-session.md`](../skills/doc-review/references/example-session.md)

---

### 15. `/dashboard` — status vault

**Cú pháp:** `/dashboard [--open]`

**Dùng khi:** muốn nhịp đập nội bộ — status feature, stale, activity, nợ Open-Question. Quét chỉ đọc; chỉ ghi HTML + `feature-list.md`.

**Output:** `docs/_shared/dashboard.html` (1 file tự chứa) + sinh lại `docs/feature-list.md`. Nợ OQ là chỉ báo dẫn đầu — feature có OQ chưa giải càng накоп càng lệch nguồn.

**Phiên mô phỏng:** [`example-session.md`](../skills/dashboard/references/example-session.md)
