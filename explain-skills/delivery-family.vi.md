---
type: skill-explainer
skill: delivery-family
updated: 2026-08-01
---

# Họ skill delivery — /jira /confluence /export /userguide /meeting /inbox /doc-review /dashboard

[English](delivery-family.md) · **Tiếng Việt**

## 1. Vì sao có họ skill này

Tài liệu BA xong — giờ phải *rời vault*: vào Jira cho team, Confluence cho stakeholder, một gói cho buổi review, một manual cho user, và một nhịp status cho bạn. Cộng các skill capture/review反馈 lại chuỗi. Tám skill này là lớp outbound + feedback của kit.

## 2. Chọn nhanh

| Bạn cần… | Chạy |
|---|---|
| Đẩy story sang Jira (và kéo status về) | `/jira <feature>` |
| Xuất tài liệu thành cây trang Confluence | `/confluence <feature>` |
| Đóng gói tài liệu cho review stakeholder | `/export --scope <feature> --format pdf` |
| Viết hướng dẫn end-user | `/userguide --feature <slug>` |
| Ghi biên bản họp cấu trúc | `/meeting "<tiêu đề>"` |
| Dump ghi chú thô nhanh / phân loại đống | `/inbox "<ghi chú>"` / `/inbox --triage` |
| Chạy review chất lượng tài liệu | `/doc-review <feature>` |
| Xem nhịp status vault | `/dashboard` |

## 3. Hai cổng external-write

`/jira` và `/confluence` ghi **ngoài** vault — khó rollback (issue Jira / trang Confluence không git rollback được). Cả hai **HITL cứng** (`rules/atlassian-sync.md`): preview mỗi lần ghi, Y tường minh, không auto-approve. Cả hai bắt drift (artifact đổi ngoài kit từ lần sync trước → cảnh báo + xem lại). `/jira` thêm: từ chối story `status: stale`.

## 4. `/confluence` vs `/sync-confluence`

Cùng chạm Confluence, khác việc:
- `/confluence` (wave này) — xuất tài liệu kit thành **trang mới/thuộc quyền**, tracking mapping state.
- `/sync-confluence` (có từ 1.x) — cập nhật **trang có sẵn in-place** từ **code diff / hội thoại**.

Phân biệt bắt buộc trong description của cả hai skill.

## 5. Vòng capture → triage → review

- `/inbox` capture thô (loại khỏi activity log — nửa ý tưởng không phải event kinh doanh) và triage qua bảng `/ba` đúng skill tài liệu.
- `/meeting` capture phút kết cấu trúc (quyết định/cản/hành động dạng bảng trong file; hành động cần chủ).
- `/doc-review` chạy audit chất lượng đa agent (agent trả findings, không sửa; orchestrator áp dụng fix được duyệt). Đổi tên từ `/review` để không trùng skill review PR ở user-level.

## 6. `/dashboard` là nhịp, `/gap` là bằng chứng

`/dashboard` = "đang ở đâu?" (status, stale, nợ OQ, activity gần — một file HTML + sinh lại feature-list.md). `/gap` = "chuỗi thiếu gì?" (coverage traceability). Câu hỏi khác, đều hữu ích — callout nợ OQ của dashboard hay gửi bạn tới `/gap`.

## 7. Ví dụ làm sẵn

`example/atlas-re/meetings/` mang một buổi review mẫu mà bảng Decisions link `FR-atlas-re-006` — cho thấy quyết định họp nối ngược vào spine traceability (và nếu đổi scope, sẽ route sang `/cr`).

## Xem thêm

- `explain-skills/traceability-family.vi.md` — `/gap` (coverage) bổ sung `/dashboard` (status)
- `rules/atlassian-sync.md` — hợp đồng HITL + drift mà `/jira` và `/confluence` chung
- `rules/doc-selection.md` — ma trận đầy đủ (giờ toàn bộ ✓)
