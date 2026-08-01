---
type: skill-explainer
skill: traceability-family
updated: 2026-08-01
---

# Họ skill traceability & change — /gap /cr /reverse-doc

[English](traceability-family.md) · **Tiếng Việt**

## 1. Vì sao có họ skill này

Ba skill hoạt động *ngang* chuỗi tài liệu thay vì sinh một mắt xích: `/gap` chứng minh chuỗi đầy đủ, `/cr` đổi nó an toàn, và `/reverse-doc` dựng lại từ nguồn cũ. Chúng chung một hợp đồng — spine và bề mặt parse của `rules/traceability.md`.

## 2. Chọn nhanh

| Bạn cần… | Chạy | Sinh ra |
|---|---|---|
| Xem gì còn thiếu/mồ côi trên cả vault | `/gap [--feature <slug>]` | báo cáo `traceability.md` |
| Ghi thay đổi scope + áp dụng an toàn | `/cr "<thay đổi>"` rồi `/cr --apply CR-...` | `CR-{YYYYMMDD}-{NNN}` |
| Dựng lại tài liệu BA từ docx/pdf/code cũ | `/reverse-doc <nguồn> [--feature <slug>]` | `reverse-{feature}.md` |

## 3. Spine mà cả ba chung

```
UN → BO → CAP → FR/NFR/BR/E → UC/US → AC → CHK → TC
                         CR cắt ngang tất cả
```

- `/gap` đi trên spine này và báo các chỗ đứt (FR không UC/US, US không AC, E- không ai cite, doc mồ côi, chuỗi stale).
- `/cr` ghi tác động ngang spine (những ID nào đổi) và áp dụng edit theo thứ tự phụ thuộc (SRS trước story trước test) qua `@change-tracker`.
- `/reverse-doc` dựng lại một góc nhìn từ nguồn, đánh mọi claim ✅/🔵/🟡 — nó nằm *cạnh* tài liệu chính thức, không bao giờ ghi đè.

## 4. Ba bề mặt parse

Cả ba join ID cùng cách (`traceability.md`): frontmatter `links:`, wikilink thân bài `[[path#ID|ID]]`, và **bảng index** (usecase-index, story-index, wireframe-index) — bề mặt join rẻ cho ID theo path, vì file content zero-frontmatter.

## 5. `/gap` gần như chỉ đọc

Nó quét vault và tính coverage; **duy nhất** nó ghi là báo cáo (`docs/_shared/traceability.md`), có gate L1. Không bao giờ sửa doc nó quét — nó báo khoảng hở, skill sở hữu (`/srs`, `/userstory`…) lấp. Coverage, không phải chất lượng (chất lượng là `/doc-review` + `@doc-reviewer`).

## 6. Tách record-then-apply của `/cr`

Thay đổi được ghi trước (`/cr "<thay đổi>"` → Impact Matrix + Rollback, chưa sửa doc), rồi mới áp dụng (`/cr --apply CR-...` → L2 diff từng doc theo thứ tự phụ thuộc). Việc tách quan trọng: CR ghi-nhưng-chưa-apply là trạng thái "đã log, đang chờ" bình thường, và agent `@change-tracker` bắt đích stale (doc đổi sau khi CR ghi → HARD STOP, đánh giá lại).

## 7. Tính trung thực confidence của `/reverse-doc`

Mọi claim trong reverse doc mang ✅ (nói thẳng trong nguồn) / 🔵 (suy diễn) / 🟡 (khoảng hở → OQ). Một bản dựng đầy ✅ mà thật ra 🔵/🟡 còn tệ hơn vô dụng — nó trông uy tín nhưng không phải. Khi do dự, hạ một mức.

## 8. Ví dụ làm sẵn

`example/atlas-re/` mang một `traceability.md` từ lần `/gap` thật (cho thấy các khoảng hở cố ý — các FR chưa cắt story), và một `CR-20260801-001` mẫu nâng ngưỡng authority (50k → 60k) với tác động ngang spec → story → checklist.

## Xem thêm

- `explain-skills/testing-family.vi.md` — `/test-checklist` + `/test-cases`, đuôi CHK/TC mà `/gap` join
- `rules/traceability.md` — spine, bề mặt parse, các luật coverage
- `rules/doc-selection.md` — ma trận đầy đủ + trạng thái wave
