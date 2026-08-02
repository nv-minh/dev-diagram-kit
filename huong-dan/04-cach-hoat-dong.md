# 04 — Cách skill hoạt động (luồng chung)

> Hiểu luồng chạy giúp bạn biết khi nào skill sẽ hỏi, khi nào chờ bạn duyệt, và tại sao nó tự sửa lỗi. Cả 64 skill theo cùng khung này (biến thể đáng chú ý: `/scan-project` chạy **2 pha có HARD STOP** scan→plan→sinh; `/sync-confluence` và các skill external-write khác thêm bước **preview + xác nhận** trước khi ghi ra ngoài vault).

> **Song ngữ EN/VI:** ngôn ngữ output (nhãn diagram + câu hỏi phỏng vấn + L1 plan + báo cáo) **tự bám ngôn ngữ bạn gõ** — gõ tiếng Anh → English, tiếng Việt → VI; ép bằng `--lang en|vi` (theo `rules/language.md`). Keyword cú pháp engine + tên định danh kỹ thuật thật (table/service/endpoint) luôn giữ English.

---

## Luồng 6 bước

```
1. Nhận input        →  bạn gõ /skill "<mô tả>" --feature <slug>
2. Đọc ngữ cảnh      →  skill đọc docs/{slug}/ có sẵn (SRS, use case...) nếu có
3. Hỏi bù chỗ thiếu  →  hỏi bằng ngôn ngữ nghiệp vụ, KHÔNG hỏi lại cái đã có
4. L1 — xem kế hoạch →  in bảng "sẽ ghi file gì" — bạn gõ Y / sửa
5. Vẽ + ghi file     →  sinh source diagram, ghi vào đúng path
6. Render + tự kiểm  →  compile-check / validate / semcheck → báo kết quả
```

Nếu file đã tồn tại (chạy lại): giữa bước 4-5 có **L2 — xem diff** trước khi ghi đè.

---

## Bước 3 — Skill hỏi gì (và chọn altitude thế nào)

Skill phục vụ **dev làm công việc BA** — bạn có nền kỹ thuật, nên skill hỏi/dùng chi tiết ở **đúng altitude theo người đọc + loại diagram**, chứ không cấm chi tiết kỹ thuật:

✅ **Diagram giao tiếp nghiệp vụ** (use case, activity nghiệp vụ, C4 **Context**) — hỏi bằng ngôn ngữ dễ hiểu: ai làm bước nào · khi nào rẽ nhánh · kết quả nghiệp vụ user thấy · loại thông tin cần lưu · có gọi dịch vụ ngoài nào (tên + mục đích). Đừng nhồi port/replica/SDK vào đây (sai altitude).

✅ **Diagram kỹ thuật** (`/erd` `/dbdiagram` `/sequence` · C4 **Container/Component** · `/scan-project`) — **được** dùng/hỏi chi tiết kỹ thuật thật: tên column/table · endpoint/route · schema · framework · payload · SDK. Dev có sẵn context này (hoặc đọc từ code) → dùng để diagram chính xác hơn.

> Nguyên tắc còn lại là **đúng altitude**, không phải "cấm kỹ thuật" (rule cũ giả định audience BA non-tech — đã bỏ). **KHÔNG bịa:** chưa có nguồn (code/spec/doc) thì hỏi hoặc đánh dấu giả định. Xem `rules/ba-conventions.md` Mục 3.

**No re-ask:** skill quét mô tả + câu trả lời trước + file có sẵn, **không hỏi lại** cái đã biết.

---

## Bước 4-5 — Approval gate (bạn luôn kiểm soát)

Skill **không bao giờ tự ghi file im lặng**. Ba mức:

| Mức | Khi nào | Bạn thấy gì | Trả lời |
|---|---|---|---|
| **L1 Plan** | Trước khi ghi file mới | Bảng: path · tạo/sửa · tóm tắt | `Y` (đồng ý) / `n` (hủy) / gõ yêu cầu đổi |
| **L2 Diff** | Ghi đè file đã có | Unified diff | `Y` / `n` / `edit-prompt: <sửa>` |
| **L3 Iterate** | Chỉ output ASCII/prose | Bản nháp trong chat | `Đồng ý` / `Sửa: ...` |

> Diagram Mermaid/PlantUML/D2/BPMN **bỏ qua L3** — chat không render được sơ đồ, nên skill ghi file rồi bạn xem từ ảnh render / IDE / editor. Xem `rules/approval-gate.md`.

---

## Bước 6 — Tự kiểm (điểm mạnh của bộ)

Mỗi engine có cách bắt lỗi riêng, chạy **trước khi báo "xong"**:

| Engine | Cách kiểm | Bắt được gì |
|---|---|---|
| Mermaid | `mermaid-verify.ts` compile mọi block qua `mmdc` | Lỗi cú pháp (ký tự cấm trong label, thiếu token) |
| D2 | `render.sh` compile `.d2` → `.svg` | Lỗi cú pháp D2 |
| DBML | `dbml2sql {feature}.dbml --postgres` | DBML sai cú pháp |
| BPMN | `bpmn-semcheck.ts` | Thiếu actor/branch/error so với facts, gateway thiếu nhánh, dead-end |
| PlantUML | server trả HTTP != 200 | Encode/network/server fail |

Lỗi → skill **sửa và thử lại** (thường tối đa 2-3 lần), không ghi diagram hỏng ra rồi báo hoàn tất.

**Review nghiệp vụ (tùy skill):** sơ đồ phức tạp spawn `@diagram-reviewer`; tài liệu BA lớn spawn `@doc-reviewer`. Cả hai trả findings để skill sửa trước khi báo xong.

---

## Vì sao có các agent reviewer?

- **`diagram-reviewer`** — soi diagram kỹ thuật (`/sequence`, `/activity`, …) khi vượt ngưỡng phức tạp: bắt actor/lane thiếu, nhánh error/alt bỏ sót, dead-end, gateway thiếu nhánh.
- **`doc-reviewer`** — soi tài liệu BA (`/srs`, `/brd`, `/prd-epic`, …) khi vượt ngưỡng: ID chưa cover, fact bịa, sai altitude, meta-text template lọt ra.
- **`change-tracker`** — hỗ trợ luồng impact thay đổi (dùng với `/cr` và các path bàn giao liên quan).

Đây là agent read-only, trả findings để skill tự cải thiện — không tự ghi file.

---

## Nơi output rơi vào

Mọi skill ghi vào `docs/{slug}/` theo quy ước `rules/naming-conventions.md`:

| Skill | Path |
|---|---|
| `/sequence` `/activity` | `docs/{slug}/srs/{slug}-flows.md` |
| `/state` | `docs/{slug}/srs/{slug}-states.md` |
| `/erd` | `docs/{slug}/srs/{slug}-erd.md` |
| `/activity-swimlane` | `docs/{slug}/srs/{slug}-*-swimlane.puml` + `.svg` |
| `/usecase-diagram` | `docs/{slug}/usecases/{slug}-usecase-diagram.puml` + `.svg` |
| `/bpmn` | `docs/{slug}/bpmn/{process}.bpmn` + editor HTML |
| `/d2-activity` | `docs/{slug}/d2-activity/{slug}.d2` + ảnh |
| `/d2-erd` | `docs/{slug}/d2-erd/{slug}.d2` + ảnh |
| `/d2-architect` | `docs/{slug}/d2-architect/{slug}.d2` + ảnh |
| `/system-design` | `docs/{slug}/system-design/` — `.d2`/`.svg` theo tầng C4 + bản HTML + `-index.md` |
| `/dbdiagram` | `docs/{slug}/dbdiagram/{slug}.dbml` + `.sql` |
| `/scan-project` | `docs/_shared/architecture/` — `.d2`/`.svg` (C4 + module + ERD) + `{proj}-flows.md` + `-index.md` (+ tuỳ chọn `.html`) |
| `/sync-confluence` | ✱ **không ghi vào `docs/`** — cập nhật trang Confluence in-place + state `.claude/state/atlassian/sync-state.yaml` |

> ✱ `/scan-project` ghi vào `docs/_shared/architecture/` (kiến trúc là cross-feature, không gắn 1 slug). `/sync-confluence` là ngoại lệ duy nhất **không** sinh file trong `docs/` — nó ghi lên Confluence (side-effect ngoài vault).

Xem `example/atlas-re/` để thấy cấu trúc thật.
