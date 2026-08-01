---
type: skill-explainer
skill: spec-family
updated: 2026-08-01
---

# Họ skill specification — /usecase /userstory /ac /user-flow

[English](spec-family.md) · **Tiếng Việt**

## 1. Vì sao có họ skill này

SRS nói hệ thống phải làm gì. Bốn skill này biến nó thành các sản phẩm mà team thực sự làm việc trên đó: **use case** (câu chuyện của actor, kèm mọi cách nó hỏng), **user story** (lát backlog vừa một sprint), **acceptance criteria** (hợp đồng đạt/rớt mỗi story), và **user flow** (có những màn hình nào, nối nhau ra sao — file mà mọi skill wireframe đọc).

## 2. Chọn nhanh

| Bạn cần… | Chạy | Sinh ra |
|---|---|---|
| Kịch bản actor-goal + câu chuyện lỗi | `/usecase <feature>` | `UC-{slug}` |
| Backlog item sẵn sàng cho dev từ FR | `/userstory <feature>` | `US-{NNN}` |
| Làm mỗi story kiểm chứng được (Given-When-Then) | `/ac <feature>` | `AC-{NNN}` (theo story) |
| Bản đồ màn hình mà wireframe sẽ đọc | `/user-flow <feature>` | màn hình `[n]`, flow-slug |

## 3. Chúng nối nhau thế nào — sơ đồ

```
        srs/{f}-spec.md (FR- / BR- / E-)
        │                │
        ▼                ▼
   /usecase          /userstory ──▶ /ac (sửa us-NNN.md tại chỗ)
   uc-{slug}.md      us-{NNN}.md      │
   + usecase-index   + story-index    └─ AC phủ: happy + từng E- + từng biên BR-
   (= ma trận traceability của feature: UC↔FR↔Screen↔Error↔OQ)

   /user-flow ──▶ srs/{f}-userflow.md (flow + màn hình [n], stage: approved + hash)
                        │
                        ▼  (wave 3 đọc file này — nguồn DUY NHẤT chia flow)
                  /wireframe-ascii · /wireframe-html · /prototype-html
```

## 4. Hai kiểu tách content/metadata cần nhớ

- **`uc-*.md` và `us-*.md` zero-frontmatter** — chỉ văn bản. Status, priority, link FR, màn hình, jira-key nằm trong **file index** (`{f}-usecase-index.md`, `{f}-story-index.md`). Công cụ (jira sync, `/gap`, dashboard) chỉ đọc index.
- **`/ac` không bao giờ tạo file** — nó sửa section `## Acceptance Criteria` trong story có sẵn, luôn hiện dưới dạng L2 diff.

## 5. Chế độ discovery (ngoại lệ duy nhất của "cần SRS")

`/usecase` chạy hai chế độ: có SRS thì điền đủ traceability; **không có** thì thành công cụ elicitation (nhóm A) — BA thường viết UC *trước* spec để khám phá domain. Cột FR để trống, chỗ chưa rõ thành OQ, `/srs` chính thức hoá sau. `/userstory` và `/ac` không có chế độ này — thiếu thượng nguồn là từ chối (story không FR là bịa scope).

## 6. Ví dụ làm sẵn

`example/atlas-re/`: `usecases/uc-approve-claim.md` + index, `userstories/us-001…003.md` + story index, và `srs/atlas-re-userflow.md` — tất cả truy vết về `srs/atlas-re-spec.md` từ chuỗi requirements.

## Xem thêm

- `explain-skills/requirements-family.vi.md` — chuỗi sinh ra SRS mà các skill này tiêu thụ
- `explain-skills/usecase-family.vi.md` — `/usecase` văn bản vs `/usecase-diagram` hình vẽ
- `rules/doc-selection.md` — ma trận đầy đủ + trạng thái wave
