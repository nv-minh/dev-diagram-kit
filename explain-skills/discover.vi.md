---
type: skill-explainer
skill: discover
updated: 2026-08-02
---

# /discover là gì và chạy như thế nào?

[English](discover.md) · **Tiếng Việt**

## 1. Dùng để làm gì

`/discover` là **bước intake dự án một lần**. Chạy khi bạn mới vào một repo (hoặc khi context chung đã stale). Nó scan sâu code + tài liệu, hỏi tối đa 5 câu kinh doanh mà code không trả lời được, rồi viết một **context brief** nhỏ, luôn nạp (`docs/_shared/project-context.md`, ≤60 dòng) kèm file chi tiết theo nhu cầu (`docs/_shared/context/*.md`). Mọi skill BA sau đều tiêu thụ brief này — nên ngừng hỏi lại "hệ thống này làm gì?" và ngừng bịa tên entity/vai trò.

Nó tồn tại vì các skill của kit là domain-agnostic: mỗi skill tự suy luận domain từ đầu. Một intake một lần học repo rồi nuôi các skill sau là đáng làm — với điều kiện artifact giữ **nhỏ, tươi, và có provenance** (tổng quan repo generic KHÔNG giúp gì; nó tăng chi phí và mau stale).

## 2. Toàn bộ một lần chạy — sơ đồ

```
bạn: /discover
        │
        ▼
┌─────────────────────────────────┐
│ sniff manifest + N subagent     │  Task agent read-only theo khía cạnh (stack/entities/...); TRẢ về findings
├─────────────────────────────────┤
│ ingest tài liệu (code thắng)    │  đối chiếu README/ADR
├─────────────────────────────────┤
│ phỏng vấn ≤5 câu, từng câu một  │  mục đích → glossary → luật → thẩm quyền → gotcha duy nhất
├─────────────────────────────────┤
│ viết .discover-plan.md          │
├─────────────────────────────────┤
│ HARD STOP — preview L1          │  "Viết bộ context?" → CHỜ Y
└─────────────────────────────────┘
   ▼  (bạn Y)
   Tier 1 project-context.md (≤60 dòng, ép buộc) + context/*.md
   đóng dấu profile_hash + source_watermark → doc-validate
```

## 3. Hai tầng

- **Tier 1** (`project-context.md`) LUÔN được nạp (qua `scripts/context-load.sh`). Chỉ 6 mục: làm gì & ai trả tiền · stack · actor · glossary-collision · gotcha (≤5) · pointer. **Cứng 60 dòng.**
- **Tier 2** (`context/*.md`) đọc THEO NHU CẦU bởi skill cần chiều sâu — `/erd` đọc `entities.md`, `/userstory` đọc `actors.md` + `domain-rules.md`, `/srs` đọc `glossary.md` + `domain-rules.md` + `actors.md`.

## 4. Những gì nó không bao giờ làm

- Không bao giờ viết trước khi HARD STOP được duyệt.
- Không bao giờ ship Tier 1 quá 60 dòng — cắt hoặc đẩy chiều sâu xuống Tier 2 rồi tóm tắt lại.
- Không bao giờ bịa — không đọc được → đánh 🟡 + hỏi, không bịa tên/luật.
- `--update` không bao giờ đè lên mục trong `human_edited` — chỉ đề xuất, trong Sync Impact Report.
- KHÔNG vẽ sơ đồ kiến trúc — đó là việc của `/scan-project`. Nó tạo CONTEXT BRIEF.

## Xem thêm

- `rules/project-context.md` — schema, content test ("nếu `grep` trả lời trong 2 giây thì không thuộc Tier 1"), hợp đồng staleness
- `skills/scan-project/SKILL.md` — phần giao nhau (/scan-project = sơ đồ; /discover = context brief)
- `skills/discover/references/example-session.md` — phiên chạy đầy đủ trên atlas-re
