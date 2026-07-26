# Plan cải thiện dev-ba-kit — 2026-07-26

Kết quả scan toàn bộ repo (4 mảng: packaging/config, nội dung 27 skills, engine TypeScript, docs/examples). Tổng thể repo đang ở trạng thái **tốt**: 27 skills phân hoá rõ ràng, không có reference gãy, example atlas-re cover 23/27 skills, validation pipeline thống nhất. Các vấn đề tìm được chủ yếu là **vệ sinh repo, nhất quán metadata, thiếu test, và docs đi sau code**.

---

## Phase 0 — Dọn dẹp khẩn (làm ngay, ~30 phút)

### 0.1 Xoá `drawio-ai-kit/` (47 MB)
- Là clone nguyên repo ngoài `sparklabx/drawio-ai-kit` (còn nguyên `.git/` bên trong), untracked.
- Engine đã được port sang TypeScript tại `skills/drawio/engine/` (source of truth theo `skills/drawio/NOTICE.md`) — thư mục này hoàn toàn dư thừa.
- Việc: `rm -rf drawio-ai-kit/` + thêm dòng `drawio-ai-kit/` vào `.gitignore` để tránh clone lại nhầm chỗ.

### 0.2 Commit các thay đổi đang dở
- 23 file modified + untracked (`skills/drawio-sequence/`, `skills/drawio/engine/sequence.ts`, example sequence) đang treo trên `main`.
- Việc: tách thành 2 commit — (1) feat: drawio-sequence skill + engine + example, (2) chore: cập nhật docs/example còn lại.

### 0.3 Đồng bộ version
- `package.json` = 1.0.1 nhưng `.claude-plugin/plugin.json` và `marketplace.json` = 1.0.0.
- Việc: thống nhất cả 3 file về một version (đề xuất 1.1.0 vì có skill mới drawio-sequence).

### 0.4 Sửa message lỗi thời trong `install.sh`
- `install.sh:31` in "Copied 22 skills" trong khi thực tế 27.
- Việc: sửa số, hoặc tốt hơn — đếm động: `$(ls skills/ | wc -l)`.

---

## Phase 1 — Nhất quán skills & script (P1) ✅ DONE 2026-07-26

### 1.1 ~~`/scan-project` thiếu `Task`~~ — FALSE POSITIVE
- Kiểm tra lại: `skills/scan-project/SKILL.md:4` ĐÃ có `Task` trong allowed-tools. Không sửa gì.

### 1.2 Router `/diagram` thiếu skill mới ✅
- Thực tế thiếu nhiều hơn báo cáo: bảng routing thiếu cả `/orgchart`, `/drawio-*` cloud lẫn `/drawio-sequence`.
- Đã thêm 3 dòng vào bảng + cập nhật "19 → 22 diagram skills" + câu hỏi output-shape.
- Đã sync `rules/diagram-selection.md` (source of truth): glob frontmatter, dòng matrix, section chi tiết, câu tóm tắt cuối.
- `/gallery`: quyết định KHÔNG đưa vào router — không phải diagram type (presentation tool).

### 1.3 ~~Description `/d2-activity` thiếu trigger phrase~~ — FALSE POSITIVE
- Description đã bắt đầu bằng "Use when you need a PRETTY standalone…". Không sửa gì.

### 1.4 `doctor.sh` giả định macOS ✅
- Thêm `IS_MAC` + hint theo platform cho python3/curl; guard `/Applications/...` chỉ check trên macOS; header section draw.io bổ sung `/drawio-sequence`.

---

## Phase 2 — Chất lượng engine ✅ DONE 2026-07-26

Kết quả thực tế (khác plan ở vài điểm, ghi rõ bên dưới):
- 2.1 ✅ `sequence.ts` bỏ @ts-nocheck, type đầy đủ (interface SeqParticipant/SeqMessage/SequenceHost).
- 2.2 ✅ `participant()`/`message()` validate tại call-time (empty id/label, duplicate id, unknown from/to).
- 2.3 ✅ vitest: 19 tests (router, sequence, XML escaping, determinism, save guard). `npm test` / `npm run typecheck`.
  - Test bắt được 1 BUG THẬT ngoài plan: `save()` guard chỉ bảo vệ `skills/drawio/` vì `KIT_ROOT`
    tính "parent của engine/" theo layout upstream — đã sửa lên 3 cấp (repo root / `.claude/`).
- 2.4 ⚠️ DESCOPED có chủ đích: KHÔNG xé `_buildEdges()` thành method nhỏ — file được vendor 1:1
  ("Logic preserved verbatim" theo header), restructure sẽ phá provenance đó. Chỉ đặt tên magic number
  (COLLISION_MARGIN, BORDER_HUG_MARGIN, LANE_STEP, LANE_MARGIN) + comment; verify output byte-identical.
- 2.5 ✅ `diagram-validate.ts` nhận thêm `.mmd`/`.mermaid` (wrap fence tự động) + `.pu`/`.uml`.
- 2.6 ✅ CI `.github/workflows/ci.yml`: typecheck + test + rebuild example và fail nếu engine drift.
- Ngoài plan: 5 file `skills/bpmn/engine/*.ts` có 36 lỗi type sẵn (port từ JS chưa từng check) —
  đánh dấu @ts-nocheck theo đúng convention các file ported khác để gate `tsc --noEmit` xanh.

### Chi tiết plan gốc (giữ để tham chiếu)

### 2.1 Bật type-check cho `sequence.ts`
- `skills/drawio/engine/sequence.ts:1` đang `@ts-nocheck` dù là code mới viết (các file vendored khác @ts-nocheck là chấp nhận được).
- Việc: gỡ @ts-nocheck, thêm type cho participant/message, sửa lỗi type phát sinh.

### 2.2 Validate sớm trong sequence API
- `sequence.ts:36-38`: `message()` không validate `from`/`to` tồn tại — lỗi chỉ nổ muộn ở `renderSequence()`.
- Participant với label rỗng được chấp nhận im lặng → header trống trong draw.io.
- Việc: throw ngay tại `participant()`/`message()` với message lỗi chỉ rõ id sai.

### 2.3 Thêm test — hiện tại repo **không có test nào**
- Setup vitest (root đã có tsx/typescript).
- Ưu tiên: (a) A* router trong `builder.ts:_buildEdges()` — 10-15 case: graph rỗng, dense, self-loop, collision; (b) `renderSequence()` — participant/message hợp lệ + các case lỗi; (c) snapshot XML cho 1-2 example nhỏ.
- Thêm script `npm test`.

### 2.4 Refactor `_buildEdges()` (387 dòng)
- `builder.ts:175-562` monolithic: tách thành `decollide()`, `heuristicRoute()`, `astarRoute()`, `nudge()`, `reportCrossings()`.
- Đặt tên các magic number: `M=7` → `COLLISION_MARGIN`, `BM=24` → `BORDER_MARGIN`, `step=20`, tiered `SEP` (16/18/22) — kèm comment lý do.
- Làm SAU khi có test (2.3) để refactor an toàn.

### 2.5 Mở rộng `diagram-validate.ts`
- `scripts/diagram-validate.ts:167`: regex ext thiếu `.mermaid`, `.uml`, `.pu`.
- D2/Mermaid/PlantUML mới chỉ compile-check, chưa check graph-structure (edge trỏ tới node chưa định nghĩa). Thêm dangling-ref check cơ bản.

### 2.6 CI (bổ sung mới)
- GitHub Actions: chạy `tsc --noEmit` + `npm test` + rebuild toàn bộ `example/atlas-re/drawio/*.src.ts` và diff với `.drawio` đã commit → phát hiện engine drift.

---

## Phase 3 — Docs bắt kịp code ✅ DONE 2026-07-26

- 3.1 ✅ explain-skills đủ 27/27 skill: 12 doc mới ×2 ngôn ngữ (24 file). 5 skill `/drawio-*` gom vào
  `drawio-family.md` theo đúng pattern family-doc sẵn có (activity-family, erd-family) thay vì 5 doc gần trùng.
- 3.2 ✅ guides/03 + huong-dan/03 thêm §15–§23 → đủ 27 skill, giữ parity EN/VI.
  Ngoài plan: sửa 4 chỗ còn ghi "14 skills" trong guides/02, guides/04 + bản VI.
- 3.3 ✅ CHANGELOG.md (Keep a Changelog, 1.0.0 + 1.1.0) + CONTRIBUTING.md (gates, convention
  vendored-vs-kit-native, checklist thêm skill mới, quy tắc cặp song ngữ).
- 3.4 ⚠️ PNG/SVG cho atlas-re-sequence: KHÔNG làm được ở máy này — cần draw.io desktop app
  (doctor báo thiếu). Làm khi có app: `drawio-build --dir example/atlas-re/drawio --render`.
  Example cho scan-project → chuyển xuống backlog Phase 4.

### Chi tiết plan gốc (giữ để tham chiếu)

### 3.1 `explain-skills/` thiếu 16/27 skills (59%)
Ưu tiên theo thứ tự:
1. Cao: `drawio-aws/azure/gcp/databricks/sequence`, `system-design`, `scan-project`
2. Trung: `code-flow`, `dfd`
3. Thấp: `gallery`, `diagram`, `journey`, `mindmap`, `timeline`, `orgchart`, `sync-confluence`
Mỗi skill cần cặp EN + VI như 11 skill hiện có.

### 3.2 `guides/03` + `huong-dan/03` chỉ cover 14/27 skills
- Bổ sung §15–§27 cho: mindmap, journey, timeline, dfd, code-flow, orgchart, diagram, gallery, drawio-* (5), drawio-sequence — giữ parity EN/VI (hiện đang rất tốt, lệch ±2 dòng).

### 3.3 Thêm `CHANGELOG.md` + `CONTRIBUTING.md` ở root
- `rules/changelog.md` là convention cho artifact BA, không phải changelog của repo.
- CHANGELOG.md theo Keep a Changelog, bắt đầu từ 1.1.0.

### 3.4 Example bổ sung
- `example/atlas-re/drawio/atlas-re-sequence.drawio` chưa có `.png/.svg` như 4 file drawio cloud → render thêm.
- Cân nhắc example output cho `scan-project` (scan chính repo mẫu nhỏ, output fictional).

---

## Phase 4 — Bổ sung mới (backlog, làm khi cần)

| Đề xuất | Lý do | Ưu tiên |
|---|---|---|
| Skill **user-story-mapping** (grid 2D: story tree × release) | Nhu cầu BA phổ biến, `/mindmap`+`/timeline` không thay được format ma trận | Trung |
| Skill **event-storming** (domain event flow) | Bổ trợ DDD, khác activity/sequence ở event-centric notation | Trung |
| Wireframe/Gantt/deployment/network | Đã cân nhắc — **cố ý ngoài scope** IT-BA, không làm | — |
| Gallery screenshot vào README | Tăng discoverability cho skill `/gallery` | Thấp |
| `install.sh` hỗ trợ update-in-place (re-run không nhân bản) | Trải nghiệm update | Thấp |

---

## Những finding đã kiểm tra và LOẠI (false positive)
- ~~`plugin.json` thiếu mảng `skills`~~ — Claude Code tự discover skill từ thư mục `skills/` của plugin; không cần khai báo.
- ~~`gallery` thiếu thư mục resources~~ — `skills/gallery/resources/` tồn tại đủ (`gallery-build.ts`, `gallery-template.html`).
- ~~Bug XML escaping với dấu nháy đơn~~ — `esc()` escape `& < > "` là đủ cho attribute nháy kép; `'` hợp lệ trong XML.
- `skills/drawio/` không có SKILL.md — **cố ý** (shared engine dir, README đếm 27 skills đã loại nó); chỉ cần ghi chú 1 dòng trong `skills/drawio/NOTICE.md` là đủ.

## Verify sau mỗi phase
- Phase 0: `git status` sạch, `bash scripts/doctor.sh` pass, `du -sh .` giảm ~47MB.
- Phase 2: `npm test` xanh; rebuild example drawio ra XML giống file commit.
- Phase 3: đếm cặp file explain-skills EN/VI = số skill được chọn; link check README.
