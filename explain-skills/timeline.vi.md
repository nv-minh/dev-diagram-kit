---
type: skill-explainer
skill: timeline
updated: 2026-07-26
---

# `/timeline` là gì và nó chạy như thế nào?

[English](timeline.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/timeline` là lệnh vẽ **timeline lộ trình** (roadmap) — một loại hình bày ra **các cột mốc gom theo giai đoạn** (quý, năm, hoặc phase), mỗi cột mốc kèm một dòng ghi chú.

Hãy hình dung nó như **những cột chỉ đường dọc một con đường**: con đường là thời gian, cắt thành từng chặng (2026 Q1, Q2, Q3...), trên mỗi chặng dựng một đến ba tấm biển ghi sẽ đạt được gì ở đó — "Ra mắt MVP: Danh mục + Giỏ hàng," "Tích hợp thanh toán: Momo, Stripe." Không có thanh công việc, không có mũi tên giữa các việc — chỉ có cái gì cập bến, và khi nào.

Vài tình huống điển hình nên dùng `/timeline`:

- Một bên liên quan hỏi **"khi nào chúng ta có cái gì?"** và bạn cần một bức hình thay vì một bảng tính.
- Bạn đang hoạch định một tính năng hoặc cả sản phẩm theo **quý hoặc phase** và muốn chốt các cột mốc trước khi lập kế hoạch chi tiết.
- Một buổi brainstorm cho ra một phần lộ trình sơ sài và bạn muốn biến nó thành **bức hình trình bày được**.

Gõ lệnh đơn giản như:

```
/timeline "lộ trình cửa hàng online" --feature online-shop
```

Phần trong ngoặc kép là **chủ đề** của lộ trình. `--feature` cho biết nó thuộc tính năng nào (bỏ trống thì hệ thống tự đoán; tính năng chưa có thì được tạo mới). Với lộ trình bao trùm cả dự án thay vì một tính năng, thêm `--shared`.

**Một câu để nhớ:** `/timeline` vẽ **các cột mốc theo thời gian, gom theo giai đoạn** — hợp nhất khi câu hỏi là "cái gì cập bến khi nào," chứ không phải "việc nào chặn việc nào."

---

## 2. Toàn bộ luồng chạy — sơ đồ

Hình vẽ ra là **mã chữ** (Mermaid) nhúng vào tài liệu — nó không hiện trong khung chat; mở file trong công cụ đọc (VS Code / Obsidian / GitHub) thì hình mới hiện. Vì vậy cuối luồng chạy có bước **tự vẽ thử để kiểm tra** trước khi báo xong.

```
 BẠN GÕ LỆNH
 /timeline "chu de" --feature X   (hoặc --shared)
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Xác định tính năng, chủ đề, và file đích    │
 │  Đoán tính năng; không chắc → hỏi. --shared → file   │
 │  lộ trình toàn dự án. Tính năng chưa có → tự đặt     │
 │  tên rồi tạo mới.                                    │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Thu thập các cột mốc                        │
 │  Đọc phần lộ trình trong brainstorm của tính năng    │
 │  nếu có; không thì HỎI bạn một lượt gọn: các giai    │
 │  đoạn theo thứ tự, 1-3 cột mốc mỗi giai đoạn, một    │
 │  ghi chú ngắn mỗi cái. KHÔNG tự bịa ngày tháng.      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Lập "danh sách cần có"                      │
 │  Mọi giai đoạn + cột mốc, liệt kê trước khi vẽ —     │
 │  cuối buổi dùng để soát xem có bỏ sót gì không.      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Xem trước rồi mới ghi (xin phép)            │
 │  "Timeline cho {chủ đề}: N giai đoạn, M cột mốc."    │
 │  Bạn gật (Y) mới ghi vào file.                       │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Ghi thêm vào tài liệu timeline              │
 │  Thêm một mục "## Timeline: {Chủ đề}" vào file       │
 │  timeline của tính năng (hoặc file chung).           │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Tự vẽ thử, kiểm lỗi cú pháp                 │
 │  Tự render ra ảnh để chắc chắn hình không bị lỗi     │
 │  khi bạn mở lên. Lỗi → tự sửa, thử lại (vài lần).    │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Báo hoàn tất                                │
 │  Cho biết file nào, bao nhiêu giai đoạn/cột mốc,     │
 │  hình vẽ được. Ghi lại vào sổ theo dõi.              │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở tài liệu trong công cụ đọc là thấy lộ trình
```

---

## 3. Đọc một timeline như thế nào

Chỉ có ba nguyên liệu:

- **Giai đoạn** — các cột của hình: quý ("2026 Q1"), năm, hoặc phase ("Phase 1"). Nhãn cố tình giữ ngắn; nhãn giai đoạn dài sẽ làm vỡ bố cục cột.
- **Cột mốc** — một đến ba cái mỗi giai đoạn. Nhiều hơn ba thì có lẽ nên tách giai đoạn, hoặc mấy mục thừa ra không thực sự là cột mốc.
- **Ghi chú** — một dòng ngắn cho mỗi cột mốc ("Beta kín: 50 người dùng"). Cột mốc cũng có thể đứng một mình không cần ghi chú.

Một quy tắc thật thà bên dưới: **hệ thống không tự bịa ngày tháng**. Nếu cả mô tả của bạn lẫn brainstorm đều không nói khi nào một thứ cập bến, nó sẽ hỏi bạn — một lộ trình với những quý bịa ra còn tệ hơn không có lộ trình, vì người ta sẽ tin vào nó.

---

## 4. Vì sao đây cố tình KHÔNG phải biểu đồ Gantt

Đây là quyết định thiết kế quan trọng nhất đằng sau `/timeline`, nên nó xứng đáng có một mục riêng.

**Biểu đồ Gantt** thể hiện công việc bằng các thanh có độ dài, mũi tên chỉ phụ thuộc ("A phải xong trước khi B bắt đầu"), và đường găng (critical path). Đó là công cụ *quản lý dự án*: nó cần ước lượng công sức, phân bổ nguồn lực, và phải cập nhật liên tục khi thực tế thay đổi.

**Timeline** trả lời một câu hỏi nhẹ hơn nhiều: *cái gì cập bến, tầm khi nào*. Không thanh, không mũi tên phụ thuộc, không đường găng — một cách cố ý. Hai lý do:

- **Người xem.** Những người mà BA đưa lộ trình cho xem — nhà tài trợ, bên liên quan, sales — muốn thấy cam kết theo giai đoạn, không phải cơ chế công việc. Một biểu đồ Gantt trên bàn họp sẽ kéo mọi người vào cuộc tranh cãi về độ dài từng việc mà bạn không thể thắng trong một buổi họp.
- **Sự trung thực khi bảo trì.** Gantt lỗi thời ngay tuần sau khi vẽ, trừ khi có người chăm nó hằng ngày. Timeline cột mốc sống sót với thực tế lâu hơn nhiều, vì nó hứa ít chi tiết hơn.

Nếu bạn thực sự cần hoạch định kiểu "việc A chặn việc B", điều đó nằm ngoài phạm vi bộ công cụ này — và nếu bạn yêu cầu Gantt, lệnh sẽ nói thẳng như vậy thay vì vẽ ra một cái Gantt tồi.

---

## 5. Lưu ở đâu, và sửa thì thế nào

Có hai chỗ ở:

- **Theo tính năng** — `docs/{feature}/{feature}-timeline.md` (lưu ý: ở gốc thư mục tính năng, không nằm trong `srs/` — lộ trình là tài liệu hoạch định, không phải tài liệu yêu cầu).
- **Toàn dự án** — với `--shared`, nó đi vào `docs/_shared/_shared-timeline.md`, lộ trình liên tính năng.

Mỗi timeline là một mục `## Timeline: {Chủ đề}` trong file. Chạy lại lệnh với cùng chủ đề, hệ thống hiểu là **cập nhật**: cho xem thay đổi "trước/sau" rồi mới ghi đè — không tạo trùng. Vì Mermaid không hiện hình trong chat, bạn review từ **hình thật trong tài liệu** và gọi lại lệnh khi kế hoạch thay đổi — mà với lộ trình, thay đổi là chuyện bình thường, không phải thất bại.

---

## 6. Ví dụ thực tế

Anh **Huy**, một BA, có buổi họp ban chỉ đạo vào thứ Sáu. Các nhà tài trợ muốn một slide trả lời "mỗi quý năm nay chúng ta được gì?" cho cửa hàng online. Kế hoạch thì có — nhưng rải rác trong một tài liệu brainstorm và ba luồng chat.

Anh Huy gõ:

```
/timeline "lộ trình cửa hàng online 2026" --shared
```

1. Anh dùng `--shared` vì lộ trình này trải qua nhiều tính năng (danh mục, thanh toán, mobile) — nên đích là file toàn dự án, không cần đoán tính năng.

2. Hệ thống tìm thấy phần lộ trình trong ghi chú brainstorm và rút ra phần lớn cột mốc, nhưng Q3 ở đó còn trống. Nó hỏi anh Huy — anh trả lời "app mobile và dashboard phân tích," và nói thêm Q4 cố tình chưa hoạch định. Hệ thống không tự lấp Q4 bằng phỏng đoán.

3. Nó lập "danh sách cần có" — 3 giai đoạn, 6 cột mốc — rồi xem trước: *"Timeline cho lộ trình cửa hàng online 2026 → _shared-timeline.md: 3 giai đoạn, 6 cột mốc. Apply?"* Anh Huy gõ `Y`.

4. Hệ thống thêm mục vào `docs/_shared/_shared-timeline.md`, tự vẽ thử ảnh — đạt — và báo xong.

Anh Huy mở file, xuất hình đã render và thả vào slide. Thứ Sáu, một nhà tài trợ hỏi "thanh toán dời lên Q1 được không?" — và vì bức hình chỉ thể hiện cột mốc thay vì một mạng thanh công việc mong manh, cuộc thảo luận ở đúng chỗ của nó: về cam kết, không phải về cơ chế công việc. Sáng thứ Hai, anh Huy chạy lại đúng lệnh đó với thay đổi đã chốt; hệ thống cho xem diff "trước/sau" rồi cập nhật mục ngay tại chỗ.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (cú pháp Mermaid `timeline`, các bước chính xác, trường hợp đặc biệt), đọc file gốc: `.claude/skills/timeline/SKILL.md`.

Các lệnh liên quan trong cùng bộ công cụ:

- `explain-skills/mindmap.vi.md` — bẻ nhỏ xem phạm vi **gồm những gì**; timeline nói các mảnh của nó **cập bến khi nào**.
- `explain-skills/journey.vi.md` — **trải nghiệm** của người dùng theo thời gian — thời gian nhìn từ phía người dùng, không phải phía dự án.
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
