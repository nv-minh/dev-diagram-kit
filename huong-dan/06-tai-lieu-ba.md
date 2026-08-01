# 06 — Hướng dẫn skill tài liệu BA

[English](../guides/06-ba-documents.md) · **Tiếng Việt**

> Mỗi skill tài liệu: cú pháp gọi, cần chuẩn bị gì, hỏi gì, output ở đâu, ví dụ (đối chiếu `example/atlas-re/`). Tất cả tuân **approval gate** (xem trước rồi mới ghi) và mọi tài liệu sinh ra đều qua **`doc-validate`** (frontmatter, ID, link) trước khi skill báo xong. Skill sơ đồ nằm ở [03 — Hướng dẫn từng skill](03-huong-dan-tung-skill.md). Các wave sau (spec, wireframe, API, testing, bàn giao) sẽ nối tiếp guide này khi lên sóng — xem cột status trong `rules/doc-selection.md`.

Ký hiệu: `<slug>` = tên feature dạng kebab-case (vd `atlas-re`). `"..."` = mô tả nghiệp vụ bằng lời.

---

## 1. `/ba` — router tài liệu

**Cú pháp:** `/ba "<bạn cần gì>"` (hoặc chỉ cần mô tả nhu cầu)

**Dùng khi:** biết mình cần một tài liệu nhưng không rõ skill nào — nó hỏi tối đa 2 câu (giai đoạn vòng đời · phạm vi/nguồn) rồi chạy đúng skill. Skill thuộc wave chưa lên sóng sẽ nhận câu trả lời "wave N sắp có" kèm lựa chọn gần nhất hôm nay.

---

## 2. `/brainstorm` — khai phá ý tưởng

**Cú pháp:** `/brainstorm "<ý tưởng>" [--feature <slug>]`

**Dùng khi:** có ý tưởng thô, chưa có gì cấu trúc. Đây là gốc của chuỗi discovery — Open Questions của nó cascade vào mọi tài liệu sau.

**Chuẩn bị:** không cần. Feature hoàn toàn mới cũng được — skill tự suy slug và tạo thư mục sau khi bạn duyệt L1.

**Skill hỏi gì:** vòng 1 — bài toán, ai bị ảnh hưởng, thành công trông ra sao; vòng 2 (tuỳ chọn) — một góc khai phá bạn chọn (what-if, nhập vai persona, stress khi scale).

**Output:** `docs/{slug}/brainstorms/{idea-slug}.md` — bài toán, người dùng, phác thảo, quyết định, ngoài phạm vi, Open Questions.

**Ví dụ:** `/brainstorm "cho cedent tự theo dõi trạng thái duyệt bồi thường"` → tạo `docs/claim-tracking/brainstorms/self-service-status.md`, rồi gợi ý `/urd claim-tracking`.

---

## 3. `/urd` — User Requirements Document

**Cú pháp:** `/urd <feature>`

**Dùng khi:** cần chốt persona, bối cảnh sử dụng và nhu cầu người dùng trước khi tranh luận về giá trị kinh doanh hay hành vi hệ thống.

**Chuẩn bị:** có brainstorm thì tốt (được đọc tự động) nhưng không bắt buộc.

**Skill hỏi gì:** persona là ai, mục tiêu và nỗi bực của họ, dùng ở đâu/khi nào, nhu cầu theo từng persona.

**Output:** `docs/{slug}/{slug}-urd.md` — sinh `UN-{slug}-001…`, mỗi nhu cầu kèm nguồn. Các ID này là thứ mục tiêu trong BRD phải cover.

---

## 4. `/brd` — Business Requirements Document

**Cú pháp:** `/brd <feature>`

**Dùng khi:** cần bài toán kinh doanh — mục tiêu kèm thước đo, phạm vi, chi phí-lợi ích, rủi ro.

**Chuẩn bị:** URD (đọc tự động). Không có vẫn chạy; cột coverage để trống đến khi `/urd` xong.

**Skill hỏi gì:** vì sao làm bây giờ, mục tiêu + đo bằng gì, trong/ngoài phạm vi, các khoản chi phí/lợi ích **kèm căn cứ** (không căn cứ → thành OQ, không bao giờ bịa số), rủi ro.

**Output:** `docs/{slug}/{slug}-brd.md` — sinh `BO-{slug}-01…`. Tên section cố định (cơ chế cascade OQ grep theo tên).

---

## 5. `/prd-epic` — PRD một feature

**Cú pháp:** `/prd-epic <feature>`

**Dùng khi:** bài toán kinh doanh đã chốt, cần quyết định xây GÌ — capability ưu tiên P0/P1/P2.

**Chuẩn bị:** BRD (đọc tự động).

**Skill hỏi gì:** launch thiếu gì thì vô nghĩa (dò P0), nice-to-have, non-goal tường minh, ràng buộc thứ tự.

**Output:** `docs/{slug}/{slug}-prd.md` — sinh `CAP-{slug}-01…` cover các BO. P0 nghĩa là "thiếu nó feature vô nghĩa" — skill sẽ chất vấn lạm phát P0.

---

## 6. `/srs` — Software Requirements Specification

**Cú pháp:** `/srs <feature> [--section <n>]`

**Dùng khi:** cần hành vi hệ thống chính xác, kiểm thử được — nguồn mà mọi skill hạ nguồn (story, test, sơ đồ) tiêu thụ.

**Chuẩn bị:** PRD (đọc tự động). Cả chuỗi thượng nguồn giúp giảm số câu phải hỏi.

**Skill hỏi gì:** actor + ranh giới hệ thống, rồi theo từng capability: trigger, kết quả quan sát được, các kiểu lỗi, luật, dữ liệu chạm tới.

**Output:** `docs/{slug}/srs/{slug}-spec.md` — Section 2 FR ("the system shall … when …"), Section 3 NFR (kèm thước đo), Section 4 Business Rules, Section 5 Ma trận lỗi. Sinh `FR-/NFR-/BR-/E-{slug}-NNN`. Xong thì mở menu sơ đồ (`/sequence`, `/state`, `/erd`, …).

**Mẹo:** Ma trận lỗi là chỗ spec chứng minh giá trị — spec 12 FR mà 1 dòng lỗi là đặc tả thiếu.

---

## 7. `/prd` — PRD sản phẩm (singleton)

**Cú pháp:** `/prd [--update]`

**Dùng khi:** định nghĩa TOÀN BỘ sản phẩm — pitch, bài toán, người dùng, theme, Feature Map, metrics. Một lần cho cả sản phẩm, cập nhật tại chỗ. "PRD cho feature checkout" → dùng `/prd-epic checkout`.

**Output:** `docs/_product/prd.md`. Feature Map là nơi sinh ra slug feature.

---

## 8. `/roadmap` — kế hoạch ưu tiên (singleton)

**Cú pháp:** `/roadmap [--format now-next-later|quarter]`

**Dùng khi:** sắp thứ tự Feature Map — điểm RICE-lite (mỗi điểm cần căn cứ), kế hoạch Now/Next/Later kèm ghi chú lệch điểm, bản đồ phụ thuộc có phân loại.

**Output:** `docs/_product/roadmap.md`. Đọc PRD sản phẩm một chiều; Feature Map đổi thì chạy lại để sync. Cần hình mốc thời gian cho stakeholder → `/timeline` (skill sơ đồ).

---

## 9. `/usecase` — use case đầy đủ

**Cú pháp:** `/usecase <feature> ["<mục tiêu>"]`

**Dùng khi:** cần kịch bản actor-goal — ai muốn gì, kịch bản thành công đánh số, và mọi cách nó hỏng (extension). Hai chế độ: **discovery** (chưa có SRS — phỏng vấn, để trống cột FR; đúng flow elicitation của BA) và **downstream** (có SRS — đầy đủ traceability UC↔FR↔Error).

**Output:** `docs/{slug}/usecases/uc-{slug}.md` (chỉ văn bản, zero frontmatter) + `{slug}-usecase-index.md` có bảng `## Use cases` CHÍNH LÀ ma trận traceability của feature. Hình vẽ phạm vi vẫn là `/usecase-diagram`.

**Mẹo:** extension là điều kiện tại một bước (`3a`), không phải bước "rồi thì"; mỗi extension dẫn `E-` code hoặc OQ.

---

## 10. `/userstory` — story INVEST cho backlog

**Cú pháp:** `/userstory <feature> [--from FR-...]`

**Dùng khi:** đã có SRS và cần backlog item sẵn sàng cho dev. **Từ chối nếu thiếu `srs/{slug}-spec.md`** — cắt story không có FR là bịa scope.

**Output:** `docs/{slug}/userstories/us-{NNN}.md` mỗi story (zero frontmatter) + `{slug}-story-index.md` — nguồn duy nhất của status, priority, jira-key. Mỗi story link ≥1 FR; index map coverage hai chiều.

**Mẹo:** story đọc y hệt FR là cắt sai — story phải thêm ý định persona và lý do cắt.

---

## 11. `/ac` — tiêu chí chấp nhận (sửa tại chỗ)

**Cú pháp:** `/ac <feature> [us-NNN]`

**Dùng khi:** story đã có và cần kiểm chứng được. Thêm/chỉnh Given-When-Then TRONG từng `us-{NNN}.md` — không file mới, mọi thay đổi là L2 diff.

**Luật coverage:** mỗi story — happy path + một AC cho mỗi `E-` code liên quan + một cho mỗi biên `BR-` (test tại/dưới/trên ngưỡng). Giá trị biên chưa rõ thành OQ, không bao giờ bịa số.

**Mẹo:** một When mỗi AC. "Khi user đăng nhập và duyệt và…" là kịch bản — tách ra.

---

## 12. `/user-flow` — bản đồ điều hướng màn hình

**Cú pháp:** `/user-flow <feature> ["<mô tả>"]`

**Dùng khi:** trước mọi wireframe — file này CHÍNH LÀ cách chia flow (`flow-slug` + màn hình `[n]` mỗi flow) mà `ascii-wireframe/` và `html-wireframe/` (wave 3) đọc. Hỏi câu device (mobile/tablet/desktop) trước tiên.

**Output:** `docs/{slug}/srs/{slug}-userflow.md` — Mermaid flowchart theo flow, màn hình đánh số `[n]` (ổn định qua các lần chạy), mọi đường lỗi phải có đích. Khi duyệt xong nó đóng dấu `stage: approved` + hash — skill wave 3 gate trên đó.

**Mẹo:** điều hướng, không phải quy trình — lane/vai trò thuộc `/activity-swimlane`; đây là thứ NGƯỜI DÙNG thấy, màn hình qua màn hình.

---

## 13. `/wireframe-ascii` — wireframe ASCII (xem trong chat)

**Cú pháp:** `/wireframe-ascii <feature> [--flow <slug>]`

**Dùng khi:** muốn phác màn hình và chỉnh layout ngay trong chat. **Cần `srs/{slug}-userflow.md` có `stage: approved`** — không có thì từ chối (chuyển `/user-flow`). Hỏi device trước (gợi ý từ `primary_device`).

**Output:** `docs/{slug}/ascii-wireframe/{flow}.md` (zero frontmatter) — một khung ASCII mỗi màn hình `[n]` + bảng mô tả 5 cột. Cập nhật `{slug}-wireframe-index.md`.

**Mẹo:** bảng mô tả mới là sản phẩm thật; 6 lớp mỗi phần tử, lấy từ SRS/UC (dẫn FR/BR/E-), không bịa — chỗ thiếu hỏi từng cái.

---

## 14. `/wireframe-html` — wireframe HTML tĩnh đen-trắng

**Cú pháp:** `/wireframe-html <feature> [--flow <slug>]`

**Dùng khi:** ASCII trong chat chưa đủ, cần khung đúng độ rộng device trên trình duyệt. Cùng gate với ASCII; dùng lại nội dung ASCII 1:1 — tăng trung thực, không thiết kế lại.

**Output:** `docs/{slug}/html-wireframe/{flow}.html` mỗi flow (đen-trắng, không JS/màu, màn hình `id="s{n}"`) + entry `{slug}-wireframe.html` (TOC + flow map + iframe) + `{slug}-wireframe-html-index.md`. Double-click entry để duyệt mọi flow.

---

## 15. `/prototype-html` — prototype clickable

**Cú pháp:** `/prototype-html <feature>`

**Dùng khi:** cần chứng minh navigation chạy được — demo click-through. Cần wireframe (ASCII hoặc HTML).

**Output:** một file tự chứa `docs/{slug}/html-design/{slug}-prototype.html` — mọi cạnh `Nav →` thành link chạy tới `#s{n}`. Link hỏng là BLOCKING. Ghi cột `HTML prototype` trong wireframe index.

---

## 16. `/figma` — đẩy wireframe lên Figma

**Cú pháp:** `/figma <feature> [--flow <slug>]`

**Dùng khi:** team dùng Figma và muốn có wireframe ở đó thành frame. **Cổng external-write cứng** — preview từng frame + đích, cần Y tường minh; dừng nếu Figma MCP chưa xác thực.

**Output:** không file local — frame Figma; URL ghi vào cột `Figma` của `{slug}-wireframe-index.md`. Nội dung bám wireframe (cùng `[n]`); không bao giờ bịa URL.

---

## 17. `/test-checklist` — đề cương test

**Cú pháp:** `/test-checklist <feature>`

**Dùng khi:** đã có SRS và cần đề cương phân loại cái cần test — functional / boundary / error / non-functional. **Cần `srs/{slug}-spec.md`** (không có thì từ chối).

**Output:** `docs/{slug}/test/checklist/{slug}-checklist-index.md` — cột `CHK-{NNN}`, mỗi dòng `Covers` một AC/FR/E, phân lớp. Cột `TC` để trống (`/test-cases` điền).

**Mẹo:** một `CHK-` biên mỗi ngưỡng (tách tại/dưới/trên ở mức case); mỗi mã `E-` có ít nhất một dòng.

---

## 18. `/test-cases` — test case đầy đủ

**Cú pháp:** `/test-cases <feature> [--chk CHK-...]`

**Dùng khi:** đã có checklist và cần case chạy được. **Từ chối khi không có checklist** — ví dụ canonical nhóm B (chuyển `/test-checklist`).

**Output:** `docs/{slug}/test/testcases/{slug}-testcase-index.md` — cột `TC-{NNN}` (steps / data / expected), mỗi `Expands CHK` ngược. Điền ngược cột `TC` của checklist. Dòng biên nở thành bộ ba tại/dưới/trên; dòng lỗi thành một TC mỗi `E-`.

---

## 19. `/gap` — ma trận traceability cross-doc

**Cú pháp:** `/gap [--feature <slug>]`

**Dùng khi:** muốn chứng minh chuỗi đầy đủ — FR nào không có use case/story, story nào thiếu AC, mã lỗi nào có tài liệu nhưng không ai test, doc mồ côi, link stale. **Chỉ đọc** trừ một báo cáo duy nhất nó ghi.

**Output:** `docs/_shared/traceability.md` — findings theo luật (UN-without-BO … AC-without-CHK/TC, E-uncited, orphans, stale, CR-apply gaps). Mỗi khoảng hở trỏ tới skill sở hữu để sửa.

**Mẹo:** E-uncited là finding giấu mặt nhưng giá trị cao — lỗi tài liệu hoá mà không ai xử lý.

---

## 20. `/cr` — change request (ghi + áp dụng)

**Cú pháp:** `/cr "<thay đổi>"` rồi `/cr --apply CR-{date}-{NNN}`

**Dùng khi:** scope đổi giữa chừng và cần ghi tác động + áp dụng an toàn. **Ghi trước** (Impact Matrix dẫn ID thật + Rollback, chưa sửa doc), **áp dụng sau** (L2 diff từng doc theo thứ tự phụ thuộc qua `@change-tracker`).

**Output:** `docs/cr/CR-{YYYYMMDD}-{NNN}.md` — tự chứa (Impact + Detailed Impact + Rollback nằm trong). Đích doc đổi sau khi CR ghi → HARD STOP (đánh giá lại).

**Mẹo:** apply ≠ record — CR đã log-chưa-apply là trạng thái chờ bình thường; không tự apply.

---

## 21. `/reverse-doc` — tái dựng từ nguồn cũ

**Cú pháp:** `/reverse-doc <đường-dẫn-nguồn...> [--feature <slug>]`

**Dùng khi:** nhận lại docx/pdf/ảnh/code và cần dựng tài liệu BA từ đó. Theo nguồn (suy slug từ nguồn), tạo được nhiều feature, **không bao giờ ghi đè** urd/brd/srs chính thức (nằm cạnh).

**Output:** `docs/{slug}/reverse-{slug}.md` (12 section + Section 0 provenance) + `docs/.reverse-plan.md` (HARD STOP trước khi sinh). Mọi claim đánh ✅/🔵/🟡; 🟡 → OQ.

**Mẹo:** trung thực confidence là cả skill — khi do dự, hạ một mức; bản dựng trông chắc hơn nguồn thì nguy hiểm.

---

## Ghi chú chung

- **Thứ tự chuỗi quan trọng nhưng không bắt buộc** — skill nào cũng chạy độc lập được (nhóm A tự tạo feature; thiếu tài liệu thượng nguồn = ghi chú mềm, không fail). Chuỗi là nơi các ID có nghĩa: UN → BO → CAP → FR.
- **Open Questions cascade** — OQ chưa giải sẽ xuất hiện lại ở hạ nguồn đến khi có đáp án (`rules/resolve-oqs.md`). Không skill nào bịa đáp án để lấp chỗ trống.
- **Chế độ update** — chạy lại skill trên tài liệu có sẵn sẽ hiện L2 diff; ID không bao giờ bị đánh số lại.
- **Tài liệu lớn có reviewer** — vượt ngưỡng phức tạp (vd SRS ≥15 FR), `@doc-reviewer` kiểm độ phủ, bịa đặt và độ cao trước khi skill báo xong.
