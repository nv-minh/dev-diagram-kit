---
type: skill-explainer
skill: mindmap
updated: 2026-07-26
---

# `/mindmap` là gì và nó chạy như thế nào?

[English](mindmap.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/mindmap` là lệnh vẽ **cây phạm vi / cây ý tưởng** — một loại hình bẻ một chủ đề lớn thành các nhánh và nhánh con, để ai nhìn vào cũng thấy ngay **chủ đề này thực sự gồm những gì**.

Hãy hình dung nó như **tấm bảng trắng ở buổi đầu dự án**: chủ đề nằm giữa ("Cửa hàng online"), vài nhánh lớn tỏa ra (Danh mục, Giỏ hàng, Tài khoản), mỗi nhánh mang vài mục cụ thể (Tìm kiếm, Bộ lọc, Thanh toán...). Không mũi tên, không thứ tự, không nhân vật — chỉ là một cái cây "cái gì thuộc dưới cái gì."

Đây là công cụ cho **giai đoạn khám phá**, dùng **trước khi viết SRS**. Vài tình huống điển hình:

- Bạn đang ở đầu một tính năng và cần **chốt phạm vi** — cái gì trong, cái gì ngoài — trước khi ai đó viết yêu cầu chi tiết.
- Một bên liên quan mô tả một ý tưởng lớn còn mơ hồ và bạn muốn **bẻ nhỏ nó** thành các mảng có tên, để rồi xử lý từng mảng một.
- Một buổi brainstorm cho ra một đống ghi chú và bạn muốn **sắp chúng thành cây** để cả team cùng chỉ vào.

Gõ lệnh đơn giản như:

```
/mindmap "cửa hàng online" --feature online-shop
```

Phần trong ngoặc kép là **chủ đề** cần bẻ nhỏ. `--feature` cho biết nó thuộc tính năng nào (bỏ trống thì hệ thống tự đoán; tính năng chưa có thì nó tự đặt tên rồi tạo mới — mindmap thường là tài liệu đầu tiên mà một tính năng có).

**Một câu để nhớ:** `/mindmap` vẽ **một cây bẻ nhỏ thuần túy về phạm vi hoặc ý tưởng** — hợp nhất ở giai đoạn đầu, khi câu hỏi còn là "thứ này rốt cuộc gồm những gì?"

---

## 2. Toàn bộ luồng chạy — sơ đồ

Hình vẽ ra là **mã chữ** (Mermaid) nhúng vào tài liệu — nó không hiện trong khung chat; mở file trong công cụ đọc (VS Code / Obsidian / GitHub) thì cây mới hiện. Vì vậy cuối luồng chạy có bước **tự vẽ thử để kiểm tra** trước khi báo xong.

```
 BẠN GÕ LỆNH
 /mindmap "chu de" --feature X
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Xác định tính năng và chủ đề                │
 │  Đoán tính năng từ ngữ cảnh; không chắc → hỏi.       │
 │  Tính năng chưa có → tự đặt tên ngắn rồi tạo mới     │
 │  (không bắt bạn chuẩn bị gì trước).                  │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Thu thập các nhánh                          │
 │  Đọc ghi chú brainstorm của tính năng nếu có, tự     │
 │  rút ra các mảng. Chưa có gì → HỎI bạn một lượt      │
 │  gọn: các mảng chính, và 2-4 mục dưới mỗi mảng.      │
 │  KHÔNG tự bịa phạm vi.                               │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Lập "danh sách cần có"                      │
 │  Mọi nhánh + lá phải xuất hiện — cuối buổi dùng để   │
 │  soát xem có bỏ sót gì không.                        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Xem trước rồi mới ghi (xin phép)            │
 │  "Mindmap cho {chủ đề}: N nhánh, ~M lá." Bạn gật     │
 │  (Y) mới ghi vào file.                               │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Ghi thêm vào tài liệu phạm vi của tính năng │
 │  Thêm một mục "## Scope: {Chủ đề}" vào một file      │
 │  chung — mọi cây phạm vi của một tính năng ở một     │
 │  chỗ.                                                │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Tự vẽ thử, kiểm lỗi cú pháp                 │
 │  Tự render ra ảnh để chắc chắn cây không bị lỗi khi  │
 │  bạn mở lên. Lỗi → tự sửa, thử lại (vài lần).        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Báo hoàn tất                                │
 │  Cho biết file nào, bao nhiêu nhánh/lá, hình vẽ      │
 │  được. Ghi lại vào sổ theo dõi.                      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở tài liệu trong công cụ đọc là thấy cây
```

---

## 3. Vì sao cây chỉ sâu tối đa 3 tầng

Hệ thống cố tình giữ cây ở **tối đa ba tầng**: chủ đề gốc, các nhánh chính, và các mục dưới mỗi nhánh. Nếu chất liệu của bạn sâu hơn ("Danh mục → Tìm kiếm → Bộ lọc → Lọc theo giá → Thanh trượt"), phần đuôi sâu sẽ được gộp lại thành một nút duy nhất.

Có hai lý do, và cả hai đều quan trọng:

- **Lý do thực dụng:** quá ba tầng, hình vẽ ra thành một chiếc quạt chật chội khó đọc — trái ngược hoàn toàn với mục đích của một bức tranh tổng quan phạm vi.
- **Lý do phương pháp:** nếu một nhánh cần bốn năm tầng chi tiết, phần chi tiết đó không còn thuộc về mindmap khám phá nữa — nó thuộc về các tài liệu đến *sau*: use case, đặc tả, sơ đồ quy trình. Việc của mindmap là đặt tên vùng đất, không phải khảo sát từng con phố. Đào sâu ở giai đoạn này thường là dấu hiệu bạn đang viết SRS vào nhầm loại sơ đồ.

---

## 4. Không có nhân vật ở đây — khác sơ đồ use case thế nào

Một nhầm lẫn thường gặp: "đây chẳng phải sơ đồ use case bỏ mấy hình người que đi sao?" Không — và việc thiếu hình người que chính là điểm mấu chốt.

| Câu hỏi | Sơ đồ |
|---|---|
| "Chủ đề này gồm những gì?" (phạm vi thuần, không nhân vật) | `/mindmap` (lệnh này) |
| "Loại người dùng nào làm được chức năng nào?" (nhân vật + chức năng) | `/usecase-diagram` |
| "Trải nghiệm cảm giác thế nào, từng bước một?" | `/journey` |

Mindmap cố tình không nói gì về chuyện *ai* làm gì. Điều đó giữ cho cuộc trao đổi khám phá còn mở: bạn có thể liệt kê "Hoàn tiền" như một mảng trước khi ai đó quyết định khách tự hoàn tiền hay nhân viên xử lý. Khi cây phạm vi đã được chốt và bạn bắt đầu hỏi "ai làm gì," đó là lúc chuyển sang `/usecase-diagram` — mindmap đã xong nhiệm vụ.

---

## 5. Lưu ở đâu, và sửa thì thế nào

`/mindmap` không tạo file rời rạc cho từng cây. Mọi thứ đi vào **một tài liệu chung** — `docs/{feature}/srs/{feature}-scope.md` — mỗi mindmap một mục `## Scope: {Chủ đề}`. Chạy lại lệnh với cùng chủ đề, hệ thống hiểu là **cập nhật**: chỉ vẽ lại mục đó, cho bạn xem thay đổi "trước/sau," và giữ nguyên các mục khác.

Vì Mermaid không hiện hình trong chat, không có kiểu "sửa nhiều vòng trong chat": bạn review từ **hình thật trong tài liệu**, rồi gọi lại lệnh khi phạm vi thay đổi — mà ở giai đoạn khám phá, chắc chắn nó sẽ thay đổi.

---

## 6. Ví dụ thực tế

Chị **Thảo**, một BA, vừa ra khỏi buổi kickoff cho "chương trình khách hàng thân thiết" — một tiếng đồng hồ đầy ý tưởng hào hứng nhưng tản mát: tích điểm, hạng thành viên, voucher, chợ đối tác, quà sinh nhật. Trước khi ai đó viết dòng yêu cầu nào, chị muốn có một bức hình để cả team cùng chốt.

Chị Thảo gõ:

```
/mindmap "chương trình khách hàng thân thiết" --feature loyalty
```

1. Tính năng `loyalty` chưa tồn tại — hệ thống báo vậy, đề xuất tạo mới với tên đó, chị Thảo xác nhận. Cũng chưa có ghi chú brainstorm nào, nên hệ thống hỏi chị một lượt gọn: các mảng chính là gì, dưới mỗi mảng có gì?

2. Chị Thảo trả lời từ ghi chú cuộc họp: Tích điểm (mua hàng, giới thiệu bạn, thưởng sinh nhật), Tiêu điểm (voucher, ưu đãi đối tác), Hạng thành viên (luật bạc/vàng, quyền lợi), và Quản trị (điều chỉnh điểm, báo cáo).

3. Hệ thống lập "danh sách cần có" — 4 nhánh, 10 lá — rồi xem trước: *"Mindmap cho chương trình khách hàng thân thiết → loyalty-scope.md: 4 nhánh, ~10 lá. Apply?"* Chị Thảo gõ `Y`. Một ghi chú của chị sâu tới năm tầng ("hạng vàng → quyền lợi → miễn phí ship → chỉ ship nhanh") — hệ thống gộp phần đuôi thành một lá "Quyền lợi hạng vàng" và nói rõ là đã gộp.

4. Hệ thống thêm mục vào `docs/loyalty/srs/loyalty-scope.md`, tự vẽ thử ảnh — đạt — và báo xong: 4 nhánh, 10 lá, hình vẽ được.

Chị Thảo mở file, chụp cây gửi vào kênh chung của team. Trong vòng một tiếng, cuộc tranh luận chị mong muốn diễn ra: nhánh chợ đối tác bị đánh dấu "giai đoạn 2" và rút khỏi phạm vi ban đầu. Tuần sau, use case được viết theo từng nhánh — mỗi cái đều truy ngược được về một chiếc lá trên cây này.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (cú pháp Mermaid `mindmap`, các kiểu nút, các bước chính xác), đọc file gốc: `.claude/skills/mindmap/SKILL.md`.

Các lệnh liên quan trong cùng bộ công cụ:

- `explain-skills/usecase-diagram.vi.md` — **bước tiếp theo** tự nhiên sau cây phạm vi: nhân vật + chức năng, khi "ai làm gì" bắt đầu quan trọng.
- `explain-skills/journey.vi.md` — **góc nhìn trải nghiệm** của tính năng (các bước + điểm hài lòng theo thời gian).
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
