---
type: skill-explainer
skill: requirements-family
updated: 2026-08-01
---

# Họ skill requirements — /brainstorm /urd /brd /prd-epic /srs (+ /prd /roadmap)

[English](requirements-family.md) · **Tiếng Việt**

## 1. Vì sao có họ skill này

Trước khi một sơ đồ đáng để vẽ, phải có người trả lời: bài toán gì, cho ai, vì sao làm bây giờ, hệ thống chính xác phải làm gì. Bảy skill này là câu trả lời dưới dạng **chuỗi tài liệu** — mỗi skill tiêu thụ output của skill trước và sinh ra các ID mà skill sau phải cover. Kết quả là một vault nơi mọi functional requirement truy vết được về một nhu cầu người dùng, và `/gap` (wave 4) chứng minh được điều đó.

## 2. Chọn nhanh

| Bạn cần… | Chạy | Sinh ra |
|---|---|---|
| Khai phá ý tưởng thô | `/brainstorm "<ý tưởng>"` | Open Questions |
| Ghi lại người dùng là ai + cần gì | `/urd <feature>` | `UN-{feature}-NNN` |
| Lập bài toán kinh doanh | `/brd <feature>` | `BO-{feature}-NN` |
| Quyết định xây gì cho một feature | `/prd-epic <feature>` | `CAP-{feature}-NN` |
| Đặc tả hành vi hệ thống chính xác | `/srs <feature>` | `FR- NFR- BR- E-` |
| Định nghĩa toàn bộ sản phẩm (một lần) | `/prd` | Feature Map |
| Ưu tiên hoá Feature Map | `/roadmap` | Điểm RICE-lite |

## 3. Chuỗi — sơ đồ

```
/brainstorm ──▶ /urd ──▶ /brd ──▶ /prd-epic ──▶ /srs ──▶ (wave 2: /usecase /userstory /ac)
   OQ           UN-       BO-       CAP-        FR-/NFR-/BR-/E-
                 └────────── mỗi ID cover ID đứng trước nó ──────────┘

/prd (singleton sản phẩm) ──▶ /roadmap (RICE-lite Now/Next/Later)
        Feature Map ─── mỗi feature đi vào chuỗi trên qua /prd-epic
```

Open Questions tự cascade xuôi dòng: một OQ bạn chưa trả lời được ở `/brainstorm` sẽ xuất hiện lại trong URD, BRD, PRD cho đến khi được giải quyết (`rules/resolve-oqs.md` định nghĩa cơ chế). Không skill nào tự bịa câu trả lời để lấp chỗ trống — chưa có đáp án nghĩa là OQ, luôn luôn.

## 4. Khuôn chạy chung

Mọi skill trong họ chạy cùng một khuôn: xác định feature (tự tạo nếu input là ý tưởng mới — `rules/feature-bootstrap.md` nhóm A) → đọc tài liệu thượng nguồn → chỉ phỏng vấn chỗ còn thiếu (không hỏi lại) → lập fact-list kèm nguồn → preview ở L1 → ghi file kèm activity log → **validate bằng `doc-validate`** (frontmatter, ID, link — cổng cứng) → tài liệu lớn qua thêm `@doc-reviewer` (độ phủ, bịa đặt, độ cao).

## 5. Ví dụ làm sẵn

`example/atlas-re/` mang đủ chuỗi cho feature duyệt bồi thường tái bảo hiểm: brainstorm → URD → BRD → PRD → SRS, liên kết chéo với các sơ đồ (swimlane, BPMN, state) mà kit 1.x đã sinh cho cùng domain.

## 6. Mức sản phẩm vs mức feature

`/prd` và `/roadmap` là **singleton** trong `docs/_product/` — chạy một lần cho cả sản phẩm, cập nhật tại chỗ. "PRD cho feature checkout" là `/prd-epic checkout`, không phải `/prd`. Feature Map của PRD sản phẩm là nơi sinh ra slug feature; roadmap đọc map đó một chiều.

## Xem thêm

- `explain-skills/ba.vi.md` — router chọn giữa các skill này
- `explain-skills/diagram-selection.vi.md` — khi nhu cầu là hình vẽ
- `rules/doc-selection.md` — ma trận quyết định đầy đủ + trạng thái wave
