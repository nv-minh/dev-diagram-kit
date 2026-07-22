# 03 — Hướng dẫn chi tiết từng skill

> Mỗi skill: cú pháp gọi, cần chuẩn bị gì, hỏi gì, output ở đâu, ví dụ thật (đối chiếu `example/food-delivery/`). Skill đều tuân **approval gate** — xem trước rồi mới ghi.

Ký hiệu: `<slug>` = tên feature dạng kebab-case (vd `food-delivery`). `"..."` = mô tả nghiệp vụ bằng lời.

---

## 1. `/sequence` — Sequence diagram (Mermaid)

**Cú pháp:** `/sequence "<mô tả>" --feature <slug>`

**Dùng khi:** ≥2 vai trò tương tác theo thời gian — ai gọi ai, response gì, có webhook/callback, có nhánh lỗi (alt/else).

**Chuẩn bị:** không bắt buộc. Có `srs/{slug}-spec.md` thì skill đọc để chính xác hơn; chưa có vẫn chạy (hỏi bù).

**Skill hỏi gì:** các actor tham gia · thứ tự message · nhánh error/alt.

**Output:** `docs/{slug}/srs/{slug}-flows.md` — mỗi flow một section, mermaid `sequenceDiagram` inline. Tự compile-check qua `mermaid-verify.mjs`.

**Ví dụ:**
```
/sequence "Khách xác nhận đặt món; hệ thống gọi cổng thanh toán; nếu thu tiền OK
thì gửi đơn cho nhà hàng, nhà hàng xác nhận hoặc từ chối; từ chối thì hoàn tiền" --feature food-delivery
```
→ Đối chiếu: `example/food-delivery/srs/food-delivery-flows.md` (2 sequence) + `_rendered/sequence-*.png`.

**Mẹo:** nét liền `->>` = gọi đồng bộ, nét đứt `-->>` = phản hồi/nội bộ. Nhánh dùng `alt/else`.

---

## 2. `/activity` — Activity / flowchart (Mermaid)

**Cú pháp:** `/activity "<mô tả quy trình>" --feature <slug>`

**Dùng khi:** quy trình có nhánh quyết định, **1-2 vai trò**, muốn **nhúng thẳng** vào .md để GitHub/Obsidian tự render. Nhiều vai chéo lane → dùng `/activity-swimlane`.

**Skill hỏi gì:** các bước tuần tự · điểm quyết định (câu hỏi + nhánh) · loop nếu có.

**Output:** cùng file `docs/{slug}/srs/{slug}-flows.md` (thêm section flowchart). Compile-check tự động.

**Ví dụ:**
```
/activity "Xử lý đơn hàng từ lúc đặt tới hoàn tất: kiểm thanh toán, gửi nhà hàng,
gán shipper, giao, xử lý COD" --feature food-delivery
```
→ Đối chiếu: section "Flow: Xử lý đơn hàng đầu-cuối" + `_rendered/activity-order-flowchart.png`.

---

## 3. `/activity-swimlane` ⭐ — Activity swimlane thật (PlantUML)

**Cú pháp:** `/activity-swimlane "<mô tả quy trình>" --feature <slug>`

**Dùng khi:** **mặc định cho quy trình đa vai trò** — mỗi vai một lane thẳng cột, node nhảy lane theo người thực hiện. Đây là loại sơ đồ rõ nhất khi có nhiều tương tác chéo giữa các vai (Khách/Hệ thống/Nhà hàng/Shipper/CSKH...).

**Cần internet** (render qua plantuml.com — xem lưu ý riêng tư ở `01-cai-dat-cong-cu.md`).

**Skill hỏi gì:** vai trò/lane (ai làm bước nào) · các bước · điểm quyết định · loop (retry/polling).

**Output:** `docs/{slug}/srs/{slug}-{tên}-swimlane.puml` + `.svg`, ảnh nhúng vào `flows.md`.

**Ví dụ:**
```
/activity-swimlane "Điều phối đơn đặt món: khách đặt, hệ thống tính tiền và gọi thanh toán,
nhà hàng xác nhận, hệ thống gán shipper, shipper giao; ngoại lệ: fail thanh toán,
nhà hàng từ chối, hết shipper, giao thất bại chuyển CSKH" --feature food-delivery
```
→ Đối chiếu: `example/food-delivery/activity-swimlane/*.puml/.svg/.png` — **5 lane thật**.

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
/bpmn "Quy trình đặt & giao đồ ăn đầu cuối, 4 vai Khách/Hệ thống/Nhà hàng/Shipper,
gồm nhánh COD, thanh toán fail, nhà hàng từ chối, hết shipper, giao thất bại" --feature food-delivery
```
→ Đối chiếu: `example/food-delivery/bpmn/order-fulfillment.ir.json` → `.bpmn`. Mở editor HTML để xem/sửa.

---

## 5. `/state` — State diagram (Mermaid)

**Cú pháp:** `/state <Entity> --feature <slug>`

**Dùng khi:** một entity có ≥3 trạng thái + luật chuyển trạng thái (trigger/condition), cần document cả transition cấm.

**Skill hỏi gì:** entity nào · các trạng thái · trigger mỗi chuyển · chuyển bị cấm.

**Output:** `docs/{slug}/srs/{slug}-states.md` — mỗi entity một section `## State: {Entity}`, mermaid `stateDiagram-v2`.

**Ví dụ:**
```
/state Order --feature food-delivery
```
→ Đối chiếu: `example/food-delivery/srs/food-delivery-states.md` (Order 11 trạng thái + Payment 7 trạng thái) + `_rendered/state-*.png`.

---

## 6. `/erd` — ERD nhúng inline (Mermaid)

**Cú pháp:** `/erd --feature <slug>`

**Dùng khi:** data model cho BA đọc trong tài liệu, nhúng thẳng .md. Kiểu gọn (`string`/`int`/`date`).

**Skill hỏi gì:** entities · thuộc tính nghiệp vụ mỗi entity · quan hệ (cardinality 1:1 / 1:N / N:N).

**Output:** `docs/{slug}/srs/{slug}-erd.md` — mermaid `erDiagram`. Compile-check tự động.

**Ví dụ:** `/erd --feature food-delivery` → `example/food-delivery/srs/food-delivery-erd.md` + `_rendered/erd-mermaid.png`.

---

## 7. `/d2-erd` — ERD đẹp standalone (D2)

**Cú pháp:** `/d2-erd --feature <slug>`

**Dùng khi:** cần **hình đẹp** cho slide/export — `sql_table` header đậm, PK/FK canh phải, layout ELK gọn hơn Mermaid.

**Cần:** binary `d2`.

**Output:** `docs/{slug}/d2-erd/{slug}.d2` + `.svg` (+ `.png` nếu có Chrome). Render qua `.claude/skills/d2-activity/render.sh` (dùng chung).

**Ví dụ:** `/d2-erd --feature food-delivery` → `example/food-delivery/d2-erd/food-delivery.svg/.png`.

---

## 8. `/dbdiagram` — Schema DBML + export SQL

**Cú pháp:** `/dbdiagram --feature <slug>`

**Dùng khi:** **bàn giao dev / export SQL / dbdocs** — tầng gần dev nhất họ ERD. Kiểu DB thật (`uuid`/`varchar`), enum, index, default là first-class.

**Cần:** `@dbml/cli`.

**Skill hỏi gì:** entities + kiểu dữ liệu nghiệp vụ · enum · index quan trọng · quan hệ.

**Output:** `docs/{slug}/dbdiagram/{slug}.dbml` (source) + `.sql` (export PostgreSQL, tự validate). Import dbdiagram.io/dbdocs.io.

**Ví dụ:** `/dbdiagram --feature food-delivery` → `example/food-delivery/dbdiagram/food-delivery.dbml` + `.sql` (có 4 enum + index).

---

## 9. `/d2-activity` — Activity đẹp standalone (D2)

**Cú pháp:** `/d2-activity "<mô tả quy trình>" --feature <slug>`

**Dùng khi:** flow nhiều nhánh cần **hình đẹp** đứng riêng (export/slide), không cần swimlane thật. Layout ELK: đường vuông góc, ít đè.

**Cần:** binary `d2`.

**Output:** `docs/{slug}/d2-activity/{slug}.d2` + `.svg`/`.png`.

**Ví dụ:** `/d2-activity "Xử lý đơn hàng đầu cuối" --feature food-delivery` → `example/food-delivery/d2-activity/food-delivery.svg`.

---

## 10. `/d2-architect` — Sơ đồ kiến trúc hệ thống (D2)

**Cú pháp:** `/d2-architect --feature <slug>` (hoặc `/d2-architect "<mô tả hệ thống>"`)

**Dùng khi:** bức tranh kiến trúc — component/service/DB/dịch vụ ngoài lồng nhau. Mermaid không vẽ đẹp loại này.

**Cần:** binary `d2`.

**Skill hỏi gì:** các khối logic · service · dịch vụ ngoài (cổng thanh toán, bản đồ, push) · luồng gọi giữa chúng.

**Output:** `docs/{slug}/d2-architect/{slug}.d2` + `.svg`/`.png`.

**Ví dụ:** `/d2-architect --feature food-delivery` → `example/food-delivery/d2-architect/food-delivery.svg` (client apps → gateway → services + DB + queue → dịch vụ ngoài).

---

## 11. `/usecase-diagram` — Use case diagram (PlantUML)

**Cú pháp:** `/usecase-diagram --feature <slug>`

**Dùng khi:** kickoff feature, thể hiện **phạm vi hệ thống** — actor nào làm được use case nào, quan hệ `<<include>>`/`<<extend>>`. System boundary bắt buộc.

**Cần internet** (render qua plantuml.com).

**Chuẩn bị:** có `srs/{slug}-spec.md` HOẶC `usecases/{slug}-usecase-index.md` thì skill trích use case từ đó; chưa có thì hỏi.

**Output:** `docs/{slug}/usecases/{slug}-usecase-diagram.puml` + `.svg`, ảnh + bảng Actors/Relationships nhúng vào `{slug}-usecase-index.md`.

**Ví dụ:** `/usecase-diagram --feature food-delivery` → `example/food-delivery/usecases/food-delivery-usecase-diagram.svg` (5 actor, 9 use case, include/extend).

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
/system-design --feature food-delivery
/system-design --feature food-delivery --component order-service
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

## Lưu ý chung cho mọi skill

- **Feature chưa tồn tại?** Skill vẽ diagram là "điểm vào" — tự derive slug + hỏi đúng phạm vi + tạo folder `docs/{slug}/` (xem `rules/feature-bootstrap.md`). Không bế tắc.
- **Kit phục vụ dev làm công việc BA** — skill hỏi/chọn chi tiết ở **đúng altitude theo người đọc**: diagram giao tiếp nghiệp vụ (use case, activity, C4 Context) dùng ngôn ngữ dễ hiểu; diagram kỹ thuật (ERD, DBML, sequence, C4 Container, `/scan-project`) **được dùng chi tiết kỹ thuật thật** (column/endpoint/schema/framework) — không còn cấm như rule cũ. Xem `rules/ba-conventions.md` Mục 3.
- **Không tự ghi file.** Luôn xem trước kế hoạch (L1), file đã tồn tại thì xem diff (L2). Bạn gõ `Y` mới ghi.
- **Tự bắt lỗi.** Mermaid compile-check; D2/DBML validate CLI; BPMN semcheck. Lỗi → skill sửa, không báo "xong" khi diagram hỏng.
