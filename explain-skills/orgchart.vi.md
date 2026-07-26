---
type: skill-explainer
skill: orgchart
updated: 2026-07-26
---

# `/orgchart` là gì và nó chạy như thế nào?

[English](orgchart.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/orgchart` là lệnh vẽ **sơ đồ tổ chức** — một loại hình cho thấy **ai báo cáo cho ai**, với mọi người được gom theo team hoặc phòng ban.

Hãy hình dung nó như **cây gia phả của một công ty**: người đứng đầu (CEO, trưởng dự án) ở trên cùng, các đường kẻ chạy xuống những người báo cáo cho họ, và các khung gom người cùng team lại với nhau. Mỗi người hiện ra như một hình người nhỏ kèm chức danh và tên. Một cái liếc trả lời được những câu hỏi mà mọi buổi kickoff đều đặt ra: ai phụ trách, ai quyết định, người này thuộc team của ai?

Vài tình huống điển hình nên dùng `/orgchart`:

- **Kickoff dự án** — bạn vừa gặp tổ chức của khách hàng và muốn đưa dàn nhân vật lên giấy trước khi bắt tay vào làm yêu cầu.
- **Phân tích bên liên quan** — bạn cần biết phải thuyết phục ai, thông báo cho ai, ai ký duyệt; cây báo cáo là nửa đầu của việc đó (bản đồ quyền lực/mối quan tâm tùy chọn là nửa sau — xem mục 4).
- Team cứ hỏi **"người này là ai ấy nhỉ?"** trong các buổi họp, và một bức hình sẽ chấm dứt chuyện đó.

Gõ lệnh đơn giản như:

```
/orgchart --feature crm-rollout
```

Hệ thống đọc những gì đã biết về tính năng (ghi chú brainstorm, đặc tả) và phỏng vấn bạn phần còn lại. Với sơ đồ tổ chức của cả dự án thay vì một tính năng, dùng `--shared`; muốn có thêm bản đồ quyền lực/mối quan tâm của các bên liên quan, thêm `--stakeholder`.

**Một câu để nhớ:** `/orgchart` vẽ **hệ thống cấp bậc báo cáo — con người, chức danh, và các tuyến chỉ huy** — hợp nhất ở kickoff, khi bạn cần dàn nhân vật trước mọi thứ khác.

---

## 2. Toàn bộ luồng chạy — sơ đồ

Khác các lệnh dùng Mermaid trong bộ công cụ này, `/orgchart` thuộc **họ D2** (như `/d2-architect`): nó viết một file nguồn dạng chữ rồi **thực sự render ra ảnh** (`.svg`) ngay trong lượt chạy. Nên không có chuyện "mở công cụ đọc rồi hy vọng" — kết thúc lượt chạy là một tấm ảnh hoàn chỉnh nằm trên đĩa, và hệ thống tự nhìn tấm ảnh đó trước khi báo xong.

```
 BẠN GÕ LỆNH
 /orgchart --feature X   (hoặc --shared, + tùy chọn --stakeholder)
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Xác định tính năng (hoặc file chung)        │
 │  File đã tồn tại → chuyển sang chế độ cập nhật.      │
 │  Tính năng chưa có → tự đặt tên rồi tạo mới.         │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Thu thập dữ kiện tổ chức                    │
 │  Đọc phần bên liên quan trong brainstorm / đặc tả    │
 │  để lấy: người đứng đầu cây, chức danh từng người,   │
 │  họ báo cáo cho ai, gom team thế nào. Chưa có gì →   │
 │  HỎI bạn một lượt gọn. KHÔNG tự bịa ra người.        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Xem trước rồi mới ghi (xin phép)            │
 │  Bằng ngôn ngữ nghiệp vụ dễ hiểu: người đứng đầu,    │
 │  N người, M team — không đổ mã nguồn ra. Bạn gật     │
 │  (Y) mới ghi.                                        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Viết nguồn D2 (không tọa độ)                │
 │  Mô tả người, team, và các tuyến báo cáo bằng chữ;   │
 │  bộ máy dàn trang tự xếp vị trí mọi thứ — không ai   │
 │  phải đặt ô bằng tay.                                │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Render ra .svg + kiểm tra ảnh               │
 │  Biên dịch nguồn thành ảnh thật. Biên dịch lỗi →     │
 │  tự sửa, render lại. Rồi hệ thống tự nhìn tấm ảnh    │
 │  để xác nhận cây vẽ đúng.                            │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 6 — (chỉ khi --stakeholder) Bản đồ quyền lực /  │
 │          mối quan tâm                                │
 │  Viết một tài liệu nhỏ riêng, chấm từng bên liên     │
 │  quan theo ảnh hưởng × mối quan tâm, kèm chiến lược  │
 │  ứng xử cho mỗi góc phần tư.                         │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Báo hoàn tất                                │
 │  Cho biết các file, số người/team, ảnh biên dịch     │
 │  được. Ghi lại vào sổ theo dõi.                      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở file .svg trong trình duyệt / IDE để xem
```

Một điều kiện thực tế: công cụ vẽ D2 phải được cài trên máy. Nếu chưa có, lệnh dừng ngay và in ra đúng một dòng lệnh cài đặt — nó không giả vờ vẽ.

---

## 3. Đọc sơ đồ như thế nào

- **Hình người.** Mỗi người được vẽ bằng hình dáng người mang hai dòng chữ: chức danh, rồi tên ("CTO / Alice"). **Người đứng đầu cây được tô màu kem** để mắt tìm thấy đỉnh ngay lập tức; những người còn lại dùng chung một màu xanh dịu.
- **Tuyến báo cáo.** Mọi mũi tên mang cùng một nghĩa và cùng một nhãn: **"reports to."** Một quy ước duy nhất, không bao giờ đổi — để không ai phải băn khoăn một đường kẻ không nhãn nghĩa là gì. **Đường nét đứt** đánh dấu ngoại lệ: báo cáo chéo team ("dotted-line"), khi ai đó chịu trách nhiệm với một quản lý ngoài khung của mình.
- **Khung team.** Khi có từ ba người trở lên cùng một phía, họ được gom vào một khung có tên (Engineering, Business...). Một tổ chức phẳng bốn người thì không cần khung nào cả — gom nhóm là để gọn gàng, không phải để trang trí.
- **Giới hạn kích cỡ.** Quá khoảng 15 người, một sơ đồ không còn đọc nổi; hệ thống sẽ đề nghị tách theo phòng ban hoặc thu hẹp phạm vi thay vì vẽ ra một tấm poster.

---

## 4. Đây KHÔNG phải là gì — và bản đồ quyền lực/mối quan tâm tùy chọn

Có ba loại tài liệu hay bị nhầm với sơ đồ tổ chức, và lệnh này cố tình từ chối làm cả ba:

| Thứ bạn thực sự cần... | Dùng thay thế |
|---|---|
| "Ai làm bước nào của quy trình?" | `/activity-swimlane` |
| "Ai Chịu trách nhiệm / Phê duyệt / Được hỏi ý / Được thông báo cho từng việc?" (RACI) | một bảng trong đặc tả — không phải cây |
| "Ai có quyền lực, ai có mối quan tâm — ứng xử với từng người ra sao?" | bản đồ `--stakeholder` (bên dưới) |

**Bản đồ quyền lực/mối quan tâm** là thứ `/orgchart` sẽ vẽ giúp bạn — nhưng như một tài liệu *riêng*, chỉ tạo ra khi bạn thêm `--stakeholder`. Đó là ma trận 2×2 chấm từng bên liên quan theo **ảnh hưởng** (trục dọc) × **mối quan tâm** (trục ngang), và mỗi góc phần tư kèm một chiến lược ứng xử kinh điển: quyền lực cao + quan tâm cao → **quản lý sát sao**; quyền lực cao, quan tâm thấp → **giữ cho hài lòng**; quyền lực thấp, quan tâm cao → **thông báo đầy đủ**; cả hai thấp → **theo dõi**.

Vì sao tách riêng? Vì hai bức hình trả lời hai câu hỏi khác nhau từ dữ liệu khác nhau. Cây nói một người ngồi ở đâu về mặt chính thức; ma trận nói họ có thể giúp hay cản dự án của bạn tới mức nào — và hai thứ này thường vênh nhau (một kiến trúc sư cấp trung có thể quan trọng với dự án hơn một phó chủ tịch). Ép ma trận vào cây sẽ làm mờ cả hai, nên nó sống trong tài liệu nhỏ riêng, vẽ bằng một bộ máy khác (Mermaid), đặt cạnh sơ đồ.

---

## 5. Lưu ở đâu, và sửa thì thế nào

Kết quả nằm ở `docs/{feature}/orgchart/` (hoặc `docs/_shared/orgchart/` với `--shared`), gồm **hai file luôn đi cùng nhau**:

- `{slug}-orgchart.d2` — nguồn dạng chữ, thứ git theo dõi và so sánh diff đẹp;
- `{slug}-orgchart.svg` — ảnh đã render sẵn, thứ mọi người mở ra và dán vào slide.

Với `--stakeholder`, có thêm file thứ ba: `{slug}-stakeholder.md` chứa bản đồ quyền lực/mối quan tâm. Chạy lại lệnh sau này, nó vào **chế độ cập nhật**: đọc nguồn cũ, cho bạn xem thay đổi "trước/sau," và render lại ảnh sau khi bạn duyệt — file `.svg` không bao giờ lệch khỏi nguồn, vì render là một phần của lượt chạy.

---

## 6. Ví dụ thực tế

Chị **An**, một BA, bắt đầu triển khai CRM cho một khách hàng. Sau hai buổi kickoff, chị có tên người ghi vội khắp nơi: một CEO bảo trợ, một CTO, hai trưởng nhóm, một quản lý vận hành, và một anh tên Ba "kiểu như báo cáo cho cả hai phía." Chị muốn có bức hình — và cũng cần lên kế hoạch nên giữ quan hệ sát với ai trong suốt đợt triển khai.

Chị An gõ:

```
/orgchart --feature crm-rollout --stakeholder
```

1. Tính năng đã tồn tại nhưng chưa có dữ liệu tổ chức nào, nên hệ thống phỏng vấn chị một lượt gọn: ai ở trên cùng, chức danh từng người, ai báo cáo cho ai, có gom team không. Chị An trả lời; riêng anh Ba, chị giải thích chuyện báo cáo kép — chính thức thuộc Vận hành, nhưng làm việc hằng ngày với CTO.

2. Hệ thống xem trước bằng lời dễ hiểu: *"Đứng đầu: CEO (bảo trợ). 7 người, 2 team (Engineering, Vận hành), 1 tuyến báo cáo nét đứt. Kèm bản đồ quyền lực/mối quan tâm cho 5 bên liên quan. Apply?"* Chị An gõ `Y`.

3. Nó viết `docs/crm-rollout/orgchart/crm-rollout-orgchart.d2`, render ra `.svg` — CEO trên cùng màu kem, hai khung team bên dưới, và đường nét đứt của anh Ba chạy chéo sang CTO — rồi tự kiểm tra tấm ảnh: đủ người, đúng mọi tuyến báo cáo.

4. Nó viết `crm-rollout-stakeholder.md`: CEO rơi vào ô "quản lý sát sao," quản lý vận hành — quan tâm vừa phải nhưng có quyền phủ quyết thật — vào ô "giữ cho hài lòng," người dùng cuối vào ô "thông báo đầy đủ."

Chị An mở file `.svg`, thả vào bộ slide kickoff, và giữ ma trận cho riêng mình — nó lặng lẽ mách chị rằng buổi cà phê hằng tuần nên dành cho quản lý vận hành, chứ không phải mấy trưởng nhóm nhiệt tình. Một tháng sau, khách hàng tái cơ cấu; chị chạy lại lệnh, duyệt diff "trước/sau," và cả ảnh lẫn nguồn cùng được cập nhật.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (cú pháp D2, hình người, quy tắc khung chứa, biểu đồ góc phần tư), đọc file gốc: `.claude/skills/orgchart/SKILL.md`.

Các lệnh liên quan trong cùng bộ công cụ:

- `explain-skills/d2-architect.vi.md` — cùng họ D2, vẽ **kiến trúc hệ thống** thay vì con người.
- `explain-skills/activity-swimlane.vi.md` — "ai làm **bước** nào" trong một quy trình — câu hỏi mà sơ đồ tổ chức cố tình không trả lời.
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
