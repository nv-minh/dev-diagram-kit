# 03 — Hướng dẫn chi tiết từng skill (sơ đồ)

> Skill tài liệu (chuỗi `/brainstorm → /srs` và các skill spec/UI/API/test/bàn giao) nằm ở [06 — Tài liệu BA](06-tai-lieu-ba.md).

> Mỗi skill: cú pháp gọi, cần chuẩn bị gì, hỏi gì, output ở đâu, ví dụ thật (đối chiếu `example/atlas-re/`). Skill đều tuân **approval gate** — xem trước rồi mới ghi.

Ký hiệu: `<slug>` = tên feature dạng kebab-case (vd `atlas-re`). `"..."` = mô tả nghiệp vụ bằng lời.

---

## 1. `/sequence` — Sequence diagram (Mermaid)

**Cú pháp:** `/sequence "<mô tả>" --feature <slug>`

**Dùng khi:** ≥2 vai trò tương tác theo thời gian — ai gọi ai, response gì, có webhook/callback, có nhánh lỗi (alt/else).

**Chuẩn bị:** không bắt buộc. Có `srs/{slug}-spec.md` thì skill đọc để chính xác hơn; chưa có vẫn chạy (hỏi bù).

**Skill hỏi gì:** các actor tham gia · thứ tự message · nhánh error/alt.

**Output:** `docs/{slug}/srs/{slug}-flows.md` — mỗi flow một section, mermaid `sequenceDiagram` inline. Tự compile-check qua `mermaid-verify.mjs`.

**Ví dụ:**
```
/sequence "Underwriter tạo submission, engine định giá, hợp đồng được bind;
nếu định giá fail thì submission bị decline" --feature atlas-re
```
→ Đối chiếu: `example/atlas-re/srs/atlas-re-flows.md` (sequence submission → quote → bind).

**Mẹo:** nét liền `->>` = gọi đồng bộ, nét đứt `-->>` = phản hồi/nội bộ. Nhánh dùng `alt/else`.

---

## 2. `/activity` — Activity / flowchart (Mermaid)

**Cú pháp:** `/activity "<mô tả quy trình>" --feature <slug>`

**Dùng khi:** quy trình có nhánh quyết định, **1-2 vai trò**, muốn **nhúng thẳng** vào .md để GitHub/Obsidian tự render. Nhiều vai chéo lane → dùng `/activity-swimlane`.

**Skill hỏi gì:** các bước tuần tự · điểm quyết định (câu hỏi + nhánh) · loop nếu có.

**Output:** cùng file `docs/{slug}/srs/{slug}-flows.md` (thêm section flowchart). Compile-check tự động.

**Ví dụ:**
```
/activity "Xử lý claim đầu cuối: kiểm coverage, đăng ký, điều tra, duyệt thanh toán,
giải quyết; nếu không được cover thì từ chối" --feature atlas-re
```
→ Đối chiếu: section activity "Claim registration" trong `example/atlas-re/srs/atlas-re-flows.md`.

---

## 3. `/activity-swimlane` ⭐ — Activity swimlane thật (PlantUML)

**Cú pháp:** `/activity-swimlane "<mô tả quy trình>" --feature <slug>`

**Dùng khi:** **mặc định cho quy trình đa vai trò** — mỗi vai một lane thẳng cột, node nhảy lane theo người thực hiện. Đây là loại sơ đồ rõ nhất khi có nhiều tương tác chéo giữa các vai (Underwriter/Broker/Claims/Finance...).

**Cần internet** (render qua plantuml.com — xem lưu ý riêng tư ở `01-cai-dat-cong-cu.md`).

**Skill hỏi gì:** vai trò/lane (ai làm bước nào) · các bước · điểm quyết định · loop (retry/polling).

**Output:** `docs/{slug}/srs/{slug}-{tên}-swimlane.puml` + `.svg`, ảnh nhúng vào `flows.md`.

**Ví dụ:**
```
/activity-swimlane "Duyệt claim: Claims đăng ký claim, Underwriter kiểm coverage,
Claims yêu cầu thanh toán, Finance duyệt và trả tiền, Claims đóng; ngoại lệ: không cover → từ chối,
thanh toán bị reject" --feature atlas-re
```
→ Đối chiếu: `example/atlas-re/activity-swimlane/atlas-re-claim-approval-swimlane.svg` — **3 lane thật**.

---

## 4. `/bpmn` — BPMN 2.0 chuẩn OMG

**Cú pháp:** `/bpmn "<mô tả quy trình>" --feature <slug>`

**Dùng khi:** quy trình đa vai trò cần **ký hiệu chuẩn OMG** (gateway ◇, event ○, message flow) hoặc **import tool BPM** (Camunda, Bizagi, Signavio, draw.io).

**Cần:** `npm install` trong `.claude/skills/bpmn/engine/` (một lần).

**Cách hoạt động (2 lớp):** AI đọc mô tả → sinh **IR JSON nghiệp vụ** (`{process}.ir.json` + `.src.json`) → engine kiểm phủ (semcheck: đủ actor/branch/error?) → engine layout swimlane tự động → xuất `.bpmn` (XML chuẩn) + editor HTML. **AI không viết XML/toạ độ** — chỉ sinh IR đúng nghiệp vụ.

**Skill hỏi gì:** lanes (vai) · các bước · gateway (điểm rẽ) · kết cục + error path.

**Output:** `docs/{slug}/bpmn/{process}.bpmn` + `{slug}-bpmn-editor.html`.

**Ví dụ:**
```
/bpmn "Quy trình duyệt claim đầu cuối, 3 vai Claims handler/Underwriter/Finance,
gồm nhánh kiểm coverage, nhánh duyệt thanh toán, path từ chối và reject" --feature atlas-re
```
→ Đối chiếu: `example/atlas-re/bpmn/claim-approval.ir.json` → `.bpmn`. Mở editor HTML để xem/sửa.

---

## 5. `/state` — State diagram (Mermaid)

**Cú pháp:** `/state <Entity> --feature <slug>`

**Dùng khi:** một entity có ≥3 trạng thái + luật chuyển trạng thái (trigger/condition), cần document cả transition cấm.

**Skill hỏi gì:** entity nào · các trạng thái · trigger mỗi chuyển · chuyển bị cấm.

**Output:** `docs/{slug}/srs/{slug}-states.md` — mỗi entity một section `## State: {Entity}`, mermaid `stateDiagram-v2`.

**Ví dụ:**
```
/state Contract --feature atlas-re
```
→ Đối chiếu: `example/atlas-re/srs/atlas-re-states.md` (state machine Contract + Claim).

---

## 6. `/erd` — ERD nhúng inline (Mermaid)

**Cú pháp:** `/erd --feature <slug>`

**Dùng khi:** data model cho BA đọc trong tài liệu, nhúng thẳng .md. Kiểu gọn (`string`/`int`/`date`).

**Skill hỏi gì:** entities · thuộc tính nghiệp vụ mỗi entity · quan hệ (cardinality 1:1 / 1:N / N:N).

**Output:** `docs/{slug}/srs/{slug}-erd.md` — mermaid `erDiagram`. Compile-check tự động.

**Ví dụ:** `/erd --feature atlas-re` → `example/atlas-re/srs/atlas-re-erd.md`.

---

## 7. `/d2-erd` — ERD đẹp standalone (D2)

**Cú pháp:** `/d2-erd --feature <slug>`

**Dùng khi:** cần **hình đẹp** cho slide/export — `sql_table` header đậm, PK/FK canh phải, layout ELK gọn hơn Mermaid.

**Cần:** binary `d2`.

**Output:** `docs/{slug}/d2-erd/{slug}.d2` + `.svg` (+ `.png` nếu có Chrome). Render qua `.claude/skills/d2-activity/render.sh` (dùng chung).

**Ví dụ:** `/d2-erd --feature atlas-re` → `example/atlas-re/d2-erd/atlas-re.svg`.

---

## 8. `/dbdiagram` — Schema DBML + export SQL

**Cú pháp:** `/dbdiagram --feature <slug>`

**Dùng khi:** **bàn giao dev / export SQL / dbdocs** — tầng gần dev nhất họ ERD. Kiểu DB thật (`uuid`/`varchar`), enum, index, default là first-class.

**Cần:** `@dbml/cli`.

**Skill hỏi gì:** entities + kiểu dữ liệu nghiệp vụ · enum · index quan trọng · quan hệ.

**Output:** `docs/{slug}/dbdiagram/{slug}.dbml` (source) + `.sql` (export PostgreSQL, tự validate). Import dbdiagram.io/dbdocs.io.

**Ví dụ:** `/dbdiagram --feature atlas-re` → `example/atlas-re/dbdiagram/atlas-re.dbml` (5 enum + index).

---

## 9. `/d2-activity` — Activity đẹp standalone (D2)

**Cú pháp:** `/d2-activity "<mô tả quy trình>" --feature <slug>`

**Dùng khi:** flow nhiều nhánh cần **hình đẹp** đứng riêng (export/slide), không cần swimlane thật. Layout ELK: đường vuông góc, ít đè.

**Cần:** binary `d2`.

**Output:** `docs/{slug}/d2-activity/{slug}.d2` + `.svg`/`.png`.

**Ví dụ:** `/d2-activity "Xử lý claim có nhánh reopen" --feature atlas-re` → `example/atlas-re/d2-activity/atlas-re.svg`.

---

## 10. `/d2-architect` — Sơ đồ kiến trúc hệ thống (D2)

**Cú pháp:** `/d2-architect --feature <slug>` (hoặc `/d2-architect "<mô tả hệ thống>"`)

**Dùng khi:** bức tranh kiến trúc — component/service/DB/dịch vụ ngoài lồng nhau. Mermaid không vẽ đẹp loại này.

**Cần:** binary `d2`.

**Skill hỏi gì:** các khối logic · service · dịch vụ ngoài (cổng thanh toán, bản đồ, push) · luồng gọi giữa chúng.

**Output:** `docs/{slug}/d2-architect/{slug}.d2` + `.svg`/`.png`.

**Ví dụ:** `/d2-architect --feature atlas-re` → `example/atlas-re/d2-architect/atlas-re.svg` (Underwriter → API Gateway → services + DB + cache + queue → dịch vụ ngoài Azure AD/Blob).

---

## 11. `/usecase-diagram` — Use case diagram (PlantUML)

**Cú pháp:** `/usecase-diagram --feature <slug>`

**Dùng khi:** kickoff feature, thể hiện **phạm vi hệ thống** — actor nào làm được use case nào, quan hệ `<<include>>`/`<<extend>>`. System boundary bắt buộc.

**Cần internet** (render qua plantuml.com).

**Chuẩn bị:** có `srs/{slug}-spec.md` HOẶC `usecases/{slug}-usecase-index.md` thì skill trích use case từ đó; chưa có thì hỏi.

**Output:** `docs/{slug}/usecases/{slug}-usecase-diagram.puml` + `.svg`, ảnh + bảng Actors/Relationships nhúng vào `{slug}-usecase-index.md`.

**Ví dụ:** `/usecase-diagram --feature atlas-re` → `example/atlas-re/usecases/atlas-re-usecase-diagram.svg` (4 actor, 6 use case, include/extend).

---

## 12. `/system-design` — Thiết kế hệ thống theo C4 (D2 + bản HTML trình bày)

**Cú pháp:** `/system-design --feature <slug>` hoặc `/system-design "<mô tả hệ thống>"` `[--component <container>]`

**Dùng khi:** cần **kể chuyện hệ thống theo nhiều mức** bằng mô hình C4 — zoom dần System Context → Container → Component — cho stakeholder/architect, kèm bản trình bày đẹp để present/export. Khác `/d2-architect` (chỉ **1 bức tranh bối cảnh, 1 tầng**): `/system-design` **phân tầng C4 đa mức** + xuất **bản HTML** dark-theme (export PNG/PDF).

**Cần:** binary `d2` (dùng chung `render.sh` với họ `/d2-*`).

**Skill hỏi gì:** hệ thống phục vụ ai (người dùng/vai trò) · gọi hệ thống ngoài nào · các app/service/data store bên trong + luồng chính giữa chúng · (nếu vẽ L3) thành phần bên trong 1 container được chọn.

**Output:** trong `docs/{feature}/system-design/` (hoặc `docs/_shared/system-design/` nếu là kiến trúc toàn hệ thống, không gắn feature):
- `{slug}-context.d2` + `.svg` — C4 L1 System Context.
- `{slug}-container.d2` + `.svg` — C4 L2 Container.
- `{slug}-component-{container}.d2` + `.svg` — C4 L3 (chỉ khi có `--component <container>`).
- `{feature}-system-design.html` — bản trình bày dark-theme gộp các tầng + toolbar export Copy-PNG/PNG/PDF.
- `{feature}-system-design-index.md` — metadata + bảng tầng.

Mặc định vẽ **L1 Context + L2 Container**; L3 Component chỉ vẽ khi có `--component <container>` (hoặc yêu cầu rõ). Compile mọi tầng phải PASS trước khi báo xong.

**Ví dụ:**
```
/system-design --feature atlas-re
/system-design --feature atlas-re --component order-service
```

---

## 13. `/scan-project` — Scan brownfield → bộ diagram kiến trúc (D2 + Mermaid)

**Cú pháp:** `/scan-project [path] [--focus <dir>] [--module <name>] [--lang en|vi]`

**Dùng khi:** đã có **codebase sẵn (brownfield)** và muốn **tự sinh bộ diagram kiến trúc từ CODE** — không mô tả tay. Đây là skill cho **dev làm công việc BA**: khác mọi skill khác (vẽ từ mô tả/phỏng vấn), skill này **đọc mã nguồn** để reverse-engineer. Được dùng chi tiết kỹ thuật thật (tên service/table/endpoint) — đó là điểm mạnh của scan.

**Cần:** binary `d2` (dùng chung `render.sh` với họ `/d2-*` và `/system-design`) + Node/`mmdc` cho sequence Mermaid. Chạy trong repo (ưu tiên git).

**Chuẩn bị:** không bắt buộc. Có README/docs/ADR thì skill đối chiếu (ưu tiên **code** khi mâu thuẫn, note chỗ lệch). Codebase lớn → dùng `--focus <dir>` để scan sâu 1 vùng.

**Cách hoạt động (2 pha — HARD STOP ở giữa):**
1. **Pha 1 — scan:** đọc manifest (stack/framework), spawn subagent quét module + quan hệ + data model + luồng chính + hệ ngoài → ghi `scan-plan.md` (danh sách module + diagram đề xuất để tick chọn + gap) → **CHỜ bạn xác nhận** (`Y` / bỏ diagram / bổ sung).
2. **Pha 2 — sinh:** chỉ sau khi bạn chốt, mới sinh + render + compile-check từng diagram.

**Output:** cố định `docs/_shared/architecture/` (kiến trúc là cross-feature):
- `{proj}-context.d2/.svg` + `{proj}-container.d2/.svg` — overview C4.
- `{proj}-modules.d2/.svg` — bản đồ module + quan hệ (đánh dấu circular).
- `{proj}-module-{name}.d2/.svg` — chi tiết 1 module (theo `--module` hoặc top-N module lớn nhất).
- `{proj}-erd.d2/.svg` — ERD từ schema/ORM/migration (bỏ nếu không có schema).
- `{proj}-flows.md` — 2-3 sequence luồng chính (Mermaid).
- `{proj}-architecture-index.md` (+ tuỳ chọn `{proj}-architecture.html` deck trình bày). Mỗi phần tử gắn **confidence** (✅ đọc chắc / 🔵 suy luận / 🟡 đoán) + **provenance** (từ file nào).

**Ví dụ:**
```
/scan-project                       # scan project ở thư mục hiện tại
/scan-project ./services/api --focus src
/scan-project --module payment      # chỉ (re)vẽ chi tiết 1 module
```

**Mẹo:** chạy lại là **update mode** (L2 diff từng file). Chỗ đọc không ra → skill đánh 🟡 + hỏi, không bịa. KHÔNG vẽ deployment (port/replica/CI) — sai altitude.

---

## 14. `/sync-confluence` — Sync code/hội thoại → Confluence (sửa in-place)

**Cú pháp:** `/sync-confluence confluence:<url> [--from <git-range>] [--preview] [--lang en|vi]`

**Dùng khi:** **code vừa đổi** HOẶC **vừa chốt** điều gì trong hội thoại, cần **cập nhật lại trang Confluence cho khớp** — sửa **đúng section, in-place**, giữ nguyên phần còn lại + macro/bảng. Skill cho **dev làm công việc BA**.

**Cần (prerequisite):** **Atlassian MCP đã authenticate** (`/mcp` → chọn Atlassian/Rovo) + quyền **ghi** trang đích. Đây **không** phải render tool — chưa auth MCP thì skill dừng, báo hướng dẫn. Xem `01-cai-dat-cong-cu.md` Mục 7.

**2 mode (tự nhận theo ngữ cảnh):**
- **code** (có `--from`, hoặc ngữ cảnh "vừa sửa code"): phân tích `git diff <range>` → rút thay đổi ảnh hưởng doc (API/endpoint, field/schema, luồng, rule nghiệp vụ, config). Bỏ qua refactor/format thuần.
- **conversation** (không `--from`): rút quyết định/spec đã chốt trong hội thoại hiện tại.

**Luôn preview + xác nhận trước khi ghi** — ghi Confluence là side-effect **bất hoàn tác** (không rollback bằng git). `--preview` = dry-run: chỉ in diff, DỪNG, không ghi.

**Output:** cập nhật **in-place** trang Confluence (`updateConfluencePage`, có `versionMessage`) + (tuỳ chọn) audit footer comment + state `.claude/state/atlassian/sync-state.yaml` (hash/watermark để phát hiện trang bị đổi ngoài kit). **KHÔNG** ghi file diagram vào `docs/`.

**Ví dụ:**
```
/sync-confluence confluence:https://your.atlassian.net/wiki/spaces/ENG/pages/12345/Spec
/sync-confluence confluence:<url> --from HEAD~5..HEAD
/sync-confluence confluence:<url> --preview
```

**Mẹo:** trang đã đổi từ lần sync trước → skill cảnh báo conflict trước khi đè. Không tìm section khớp → skill đề xuất thêm section mới, hỏi vị trí, không nhét bừa. Quy ước đầy đủ: `rules/atlassian-sync.md`.

---

## 15. `/mindmap` — Cây phân rã scope / ý tưởng (Mermaid)

**Cú pháp:** `/mindmap "<chủ đề>" [--feature <slug>]`

**Dùng khi:** phân rã scope/yêu cầu/ý tưởng thành cây (giai đoạn discovery, trước SRS). Cây scope/ý tưởng thuần — không có actor (actor + chức năng → `/usecase-diagram`).

**Skill hỏi gì:** các mảng/lĩnh vực chính · 2-4 mục dưới mỗi mảng (tự đọc từ `brainstorms/*.md` nếu có).

**Output:** `docs/{slug}/srs/{slug}-scope.md` — mỗi mindmap một section `## Scope: {Topic}`, mermaid `mindmap`. Compile-check tự động.

**Ví dụ:**
```
/mindmap "Scope submission tái bảo hiểm: tiếp nhận, định giá, bind, báo cáo" --feature atlas-re
```

**Mẹo:** giữ cây ≤3 tầng — sâu hơn render rối; gộp các lá sâu vào một node. Chạy lại cùng chủ đề = update mode.

---

## 16. `/journey` — User journey map (Mermaid)

**Cú pháp:** `/journey "<trải nghiệm>" [--feature <slug>]`

**Dùng khi:** vẽ trải nghiệm người dùng theo thời gian, từng bước, mỗi bước có **điểm hài lòng 1-5** + actor tham gia. Trải nghiệm + cảm xúc qua các touchpoint — bổ trợ `/usecase-diagram` (chức năng) và `/activity` (quy trình).

**Skill hỏi gì:** persona (journey của ai) · các phase/touchpoint theo thứ tự · bước trong mỗi phase · điểm hài lòng (1-5) · actor mỗi bước.

**Output:** `docs/{slug}/srs/{slug}-journey.md` — section `## Journey: {Name}`, mermaid `journey`. Compile-check tự động; report nêu rõ các bước pain (điểm ≤2).

**Ví dụ:**
```
/journey "Broker lần đầu submit rủi ro: tìm kiếm, submit, chờ quote, bind" --feature atlas-re
```

**Mẹo:** điểm số chính là giá trị của diagram này — đừng chấm 5 hết; điểm thấp mới lộ pain point để nối sang cải tiến.

---

## 17. `/timeline` — Timeline roadmap / milestone (Mermaid)

**Cú pháp:** `/timeline "<chủ đề>" [--feature <slug>] [--shared]`

**Dùng khi:** roadmap các milestone gom theo giai đoạn (quý/năm/phase) — PM-light. **Không phải Gantt**: không task bar, không dependency, không critical path (chủ đích ngoài scope).

**Skill hỏi gì:** các giai đoạn theo thứ tự · 1-3 milestone mỗi giai đoạn + note ngắn (không bịa ngày).

**Output:** `docs/{slug}/{slug}-timeline.md` (hoặc `docs/_shared/_shared-timeline.md` với `--shared` cho roadmap cross-feature) — mermaid `timeline`. Compile-check tự động.

**Ví dụ:**
```
/timeline "Lộ trình triển khai Atlas-RE" --feature atlas-re
```

**Mẹo:** giữ nhãn giai đoạn ngắn (`2026 Q1`, `Phase 1`) — nhãn dài làm vỡ layout cột. `Milestone : note` — dấu hai chấm tách milestone và note.

---

## 18. `/orgchart` — Sơ đồ tổ chức / cây báo cáo (D2)

**Cú pháp:** `/orgchart [--feature <slug>] [--shared] [--stakeholder]`

**Dùng khi:** kickoff hoặc phân tích stakeholder — ai báo cáo cho ai, gom theo team/phòng ban. Là cây báo cáo, KHÔNG phải RACI hay quy trình ("ai làm bước nào" → `/activity-swimlane`).

**Cần:** binary `d2` (dùng chung `render.sh` với họ `/d2-*`).

**Skill hỏi gì:** người đứng đầu (đỉnh cây) · người/vai + chức danh · mỗi người báo cáo cho ai · gom team/phòng ban (tuỳ chọn).

**Output:** `docs/{slug}/orgchart/{slug}-orgchart.d2` + `.svg` (hoặc `docs/_shared/orgchart/` với `--shared`). Với `--stakeholder`: thêm `{slug}-stakeholder.md` — bản đồ power/interest (Mermaid `quadrantChart`) kèm chiến lược engagement cho mỗi góc phần tư.

**Ví dụ:**
```
/orgchart --feature atlas-re --stakeholder
```

**Mẹo:** báo cáo chéo team (dotted-line) → edge gắn nhãn `dotted-line` + nét đứt. >15 người → tách theo phòng ban.

---

## 19. `/dfd` — Data Flow Diagram L0 + L1 (D2)

**Cú pháp:** `/dfd [--feature <slug>]` (hoặc `/dfd "<mô tả luồng dữ liệu>"`)

**Dùng khi:** trả lời "dữ liệu đi đâu, process nào chạm vào, store nào giữ" — góc nhìn DATA, trực giao với `/system-design` (cấu trúc) và `/sequence` (thời gian). Vẽ 2 mức: L0 context (1 process = cả hệ thống + external entity) và L1 nổ chi tiết (2-5 process đánh số + data store).

**Cần:** binary `d2`. Có `srs/{slug}-erd.md`/spec/brainstorm thì skill đọc làm nguồn.

**Skill hỏi gì:** external entity · process (đánh số 1.0, 1.1…) · data store (D1, D2…) · dữ liệu trên từng mũi tên.

**Output:** `docs/{slug}/dfd/{slug}-dfd-l0.d2/.svg` + `{slug}-dfd-l1.d2/.svg` + `{slug}-dfd-index.md`.

**Ví dụ:**
```
/dfd --feature atlas-re
```

**Mẹo:** nhãn edge là DỮ LIỆU đang di chuyển ("order", "payment result"), không phải hành động ("send"). Data store chỉ là "D1 Orders" — không có cột; cột là việc của `/erd`.

---

## 20. `/code-flow` — Trace 1 hàm/module trong code → flow diagram

**Cú pháp:** `/code-flow <path-hoặc-symbol> [--as sequence|activity|state] [--feature <slug>]`

**Dùng khi:** muốn flow diagram cho MỘT hàm/module cụ thể trong code sẵn có — skill đọc code (qua subagent read-only), trace call chain/nhánh/state, tự chọn loại diagram (mặc định sequence). Anh em "nhắm 1 mục tiêu" của `/scan-project` (bộ diagram cả codebase).

**Cách hoạt động (2 pha — HARD STOP ở giữa):** Pha 1 trace (read-only, trả findings + bằng chứng `file:line`) → L1 preview → bạn chốt → Pha 2 render diagram Mermaid.

**Output:** `docs/{slug}/code-flow/{slug}-flow.md` — diagram + bảng **Code provenance** (phần tử → `file:line` → ✅ đọc chắc / 🔵 suy luận). Compile-check tự động.

**Ví dụ:**
```
/code-flow src/orders/placeOrder.ts
/code-flow OrderService.placeOrder --as state
```

**Mẹo:** mặc định trace 1 tầng lời gọi (gọi sâu hơn ghi "→ tên"); chỗ đọc không ra đánh 🔵 "cần xác nhận" — không bao giờ bịa.

---

## 21. `/drawio-aws` · `/drawio-azure` · `/drawio-gcp` · `/drawio-databricks` — Kiến trúc cloud trong draw.io (stencil thật)

**Cú pháp:** `/drawio-aws "<kiến trúc>" [--feature <slug>] [--type pipeline|hierarchy|network|hubspoke|mesh|sequence]` (tương tự cho `-azure`/`-gcp`/`-databricks`)

**Dùng khi:** sơ đồ kiến trúc phải hiện ĐÚNG các dịch vụ cloud với icon chính hãng (stencil AWS/Azure/GCP/Databricks) — vd cho architecture review. Chỉ cần bức tranh logic chung → `/system-design`/`/d2-architect`.

**Cần:** catalog aws + databricks có sẵn trong repo; **azure/gcp cần tải một lần**: `bash scripts/drawio-catalog-ensure.sh azure` (hoặc `gcp`). **Export PNG/SVG cần app draw.io desktop** — không có thì `.drawio` vẫn là deliverable (mở bằng draw.io web / VS Code drawio extension).

**Cách hoạt động:** stencil tra từ catalog ground-truth (`drawio-build search` — không bịa icon); skill viết build-script `{slug}.src.ts` (chỉ khai topology, không toạ độ) → engine tự layout + validate (hard gate: stencil tồn tại, thứ tự nesting, advice Well-Architected) → xuất `{slug}.drawio`.

**Output:** `docs/{slug}/drawio/{slug}.src.ts` + `{slug}.drawio` (+ `.svg` nếu có desktop app).

**Ví dụ:**
```
/drawio-aws "Pipeline xử lý ảnh serverless: S3 upload → Lambda → DynamoDB" --feature atlas-re
```
→ Đối chiếu: `example/atlas-re/drawio/atlas-re-aws.drawio` (+ các biến thể azure/gcp/databricks).

**Mẹo:** warning của validator (vd DB nằm trong public subnet) là advice Well-Architected, không phải lỗi — nên đọc kỹ.

---

## 22. `/drawio-sequence` — UML sequence diagram trong draw.io

**Cú pháp:** `/drawio-sequence "<mô tả luồng>" [--feature <slug>]`

**Dùng khi:** sequence cần là file **`.drawio` standalone, sửa được** với lifeline UML thật (bàn giao thiết kế, dev sửa tiếp) — khác `/sequence` (Mermaid, inline trong Markdown). Có sync call, return (`reply`), async signal, self-call.

**Cách hoạt động:** bạn khai participant (trái→phải theo thứ tự gọi; `actor: true` = hình người que) + danh sách message theo thứ tự; `renderSequence` tự tính mọi toạ độ — mũi tên ngang thẳng, không layout tay.

**Output:** `docs/{slug}/drawio/{slug}.src.ts` + `{slug}.drawio` (+ `.svg` nếu có app draw.io desktop — không có thì mở draw.io web / VS Code).

**Ví dụ:**
```
/drawio-sequence "Broker submit rủi ro → API → pricing service định giá → event async sang reporting;
API trả quote" --feature atlas-re
```
→ Đối chiếu: `example/atlas-re/drawio/atlas-re-sequence.drawio`.

**Mẹo:** liền+đầu đặc = sync call, đứt+đầu mở = reply, liền+đầu mở = async. Mỗi diagram 1 kịch bản chính — nhánh phụ tách sang `.drawio` thứ hai. Chưa có activation bar (v1).

---

## 23. `/diagram` + `/gallery` — Router chọn skill + deck HTML một file

**Cú pháp `/diagram`:** `/diagram "<điều bạn muốn thể hiện>" [--recommend-only]`

**Dùng khi:** không chắc trong ~20 skill vẽ nên dùng cái nào. Mô tả nhu cầu → router hỏi **tối đa 2** câu phân định (nguồn: mô tả hay code? · inline hay hình standalone?) → in `→ /<skill> <args> (lý do)` rồi **chạy luôn skill đó**. `--recommend-only` = dừng sau khi gợi ý. Source of truth: `rules/diagram-selection.md`.

**Cú pháp `/gallery`:** `/gallery --feature <slug> [--out path.html]`

**Dùng khi:** đưa stakeholder MỘT file HTML tự chứa gom mọi diagram của feature — mỗi loại diagram một tab (Architecture / Data model / Process / …), dark theme, toolbar export Copy/PNG/PDF. Double-click là mở, không cần server.

**Output:** `/diagram` không tự ghi gì (chỉ delegate); `/gallery` → `docs/{slug}/{slug}-gallery.html` (inline mọi `.svg`; block Mermaid render qua `mmdc` nếu có, không thì bỏ qua).

**Ví dụ:**
```
/diagram "dữ liệu order đi đâu, DB nào giữ"   # → route sang /dfd
/gallery --feature atlas-re
```

**Mẹo:** thêm diagram xong thì rebuild gallery (idempotent — chạy lại là ghi đè). Thiếu `mmdc` → diagram Mermaid inline bị bỏ qua, SVG D2/PlantUML/BPMN vẫn có đủ.

---

## Lưu ý chung cho mọi skill

- **Feature chưa tồn tại?** Skill vẽ diagram là "điểm vào" — tự derive slug + hỏi đúng phạm vi + tạo folder `docs/{slug}/` (xem `rules/feature-bootstrap.md`). Không bế tắc.
- **Kit phục vụ dev làm công việc BA** — skill hỏi/chọn chi tiết ở **đúng altitude theo người đọc**: diagram giao tiếp nghiệp vụ (use case, activity, C4 Context) dùng ngôn ngữ dễ hiểu; diagram kỹ thuật (ERD, DBML, sequence, C4 Container, `/scan-project`) **được dùng chi tiết kỹ thuật thật** (column/endpoint/schema/framework) — không còn cấm như rule cũ. Xem `rules/ba-conventions.md` Mục 3.
- **Không tự ghi file.** Luôn xem trước kế hoạch (L1), file đã tồn tại thì xem diff (L2). Bạn gõ `Y` mới ghi.
- **Tự bắt lỗi.** Mermaid compile-check; D2/DBML validate CLI; BPMN semcheck. Lỗi → skill sửa, không báo "xong" khi diagram hỏng.
