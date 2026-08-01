---
type: skill-explainer
skill: testing-family
updated: 2026-08-01
---

# Họ skill testing — /test-checklist /test-cases

[English](testing-family.md) · **Tiếng Việt**

## 1. Vì sao có họ skill này

SRS và story nói hệ thống *phải làm gì*; AC nói *khi nào story đạt*. Hai skill này biến điều đó thành đề cương test rồi thành case đầy đủ để QA chạy — phần đuôi của spine traceability (`… → AC → CHK → TC`), phần mà `/gap` dùng để chứng minh không gì bị sót.

## 2. Chọn nhanh

| Bạn cần… | Chạy | Sinh ra |
|---|---|---|
| Đề cương coverage phân loại (test gì) | `/test-checklist <feature>` | `CHK-{NNN}` |
| Case đầy đủ (steps / data / expected) | `/test-cases <feature>` | `TC-{NNN}` |

`/test-cases` **từ chối khi không có checklist** — đây là ví dụ canonical nhóm B. Nở không có gì thành steps là bịa test và ra coverage không đều.

## 3. Chúng nối nhau thế nào — sơ đồ

```
   srs/{f}-spec.md (FR / BR / E)  +  us-*.md (AC)
        │
        ▼
   /test-checklist ──▶ test/checklist/{f}-checklist-index.md  (cột CHK-, cột TC trống)
        │  một CHK mỗi thứ cần test, phân lớp functional/boundary/error/NFR
        ▼
   /test-cases ──▶ test/testcases/{f}-testcase-index.md  (cột TC-, con trỏ Expands CHK ngược)
        │  boundary CHK → bộ ba tại/dưới/trên · error CHK → một TC mỗi E-
        ▼
   /gap join AC→CHK→TC để chứng minh coverage (không AC chưa test, không E- chưa chạy)
```

## 4. Kỷ luật hai lớp

- **`/test-checklist` viết CÁI GÌ** — một dòng "test biên tier 50k", phân lớp, `Covers` dẫn AC/FR/E. Không steps. Giá trị là đề cương *đã phân loại*.
- **`/test-cases` viết THẾ NÀO** — steps đánh số (mỗi step một hành động), data cụ thể (lấy từ spec, không bịa), kết quả quan sát được + chính xác câu lỗi. Dòng biên trên nở thành ba TC- (tại/dưới/trên).

## 5. "Từ chối khi không có checklist" mang lại gì

Nó ép thứ tự đề-cương-trước-case. Sinh case thẳng từ FR bỏ qua bước phân lớp và hay sót biên + mã lỗi — checklist đưa chúng lên thành dòng `CHK-` trước, nên case nở một đề cương *đầy đủ*.

## 6. Ví dụ làm sẵn

`example/atlas-re/test/` mang cả hai index: checklist suy ra `CHK-` từ FR/E của spec + AC biên của US-001; test case nở chúng (biên 50k → bộ ba `TC-` tại/dưới/trên, lỗi validator-conflict → `TC-` dẫn `E-atlas-re-001`).

## Xem thêm

- `explain-skills/traceability-family.vi.md` — `/gap` chứng minh coverage AC→CHK→TC
- `rules/test-conventions.md` — cấu trúc CHK/TC + luật nở
- `rules/doc-selection.md` — ma trận đầy đủ + trạng thái wave
