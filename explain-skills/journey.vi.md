---
type: skill-explainer
skill: journey
updated: 2026-07-26
---

# `/journey` là gì và nó chạy như thế nào?

[English](journey.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/journey` là lệnh vẽ **bản đồ hành trình người dùng** (user journey map) — một loại hình mô tả **trải nghiệm của người dùng theo thời gian, từng bước một, kèm cảm xúc ở mỗi bước**.

Hãy hình dung nó như **một cuốn nhật ký hành trình có gắn thước đo tâm trạng**: trải nghiệm được cắt thành vài giai đoạn (điểm chạm) — ví dụ Tìm hiểu, Mua hàng, Sau khi mua — mỗi giai đoạn chứa vài bước, và mỗi bước ghi thêm hai thứ: **ai tham gia** vào bước đó, và **điểm hài lòng từ 1 đến 5** (1 = bực bội, 5 = hài lòng). Đọc hình, bạn không chỉ thấy người dùng trải qua những gì, mà thấy chính xác **chỗ nào trải nghiệm đang đau** — các bước điểm thấp nổi bật lên như những điểm đau cần sửa.

Vài tình huống điển hình nên dùng `/journey`:

- Bạn muốn nhìn một tính năng **bằng con mắt của người dùng, từ đầu đến cuối** — không phải "có những chức năng gì" mà là "đi qua chúng thì cảm giác thế nào": lần mua hàng đầu tiên, đăng ký tài khoản, gửi yêu cầu hỗ trợ.
- Bạn nghi ngờ trải nghiệm hiện tại có **điểm đau** và muốn đưa nó lên giấy — một bước mà người dùng bị kẹt, phải thử lại, hoặc bỏ cuộc.
- Bạn đã có use case cho tính năng và muốn thêm **góc nhìn cảm xúc bổ trợ**: use case nói hệ thống cung cấp gì, hành trình nói dùng nó thực sự cảm thấy ra sao.

Gõ lệnh đơn giản như:

```
/journey "khách mua lần đầu: từ tìm sản phẩm đến nhận hàng" --feature checkout
```

Phần trong ngoặc kép là **mô tả trải nghiệm bằng lời thường** của bạn. Phần `--feature checkout` cho hệ thống biết hành trình này thuộc tính năng nào (bỏ trống thì hệ thống tự đoán; tính năng chưa có thì nó tự đặt tên rồi tạo mới).

**Một câu để nhớ:** `/journey` vẽ **trải nghiệm cộng cảm xúc qua các điểm chạm** — hợp nhất khi bạn cần cho thấy "người dùng đi qua những gì, và khổ ở bước nào."

---

## 2. Toàn bộ luồng chạy — sơ đồ

Giống hầu hết các lệnh dùng Mermaid trong bộ công cụ này, hình vẽ ra là **mã chữ** nhúng vào tài liệu — bạn không thấy hình trong khung chat; mở file trong công cụ đọc (VS Code / Obsidian / GitHub) thì hình mới hiện. Vì vậy cuối luồng chạy có bước **tự vẽ thử để kiểm tra** trước khi báo xong.

```
 BẠN GÕ LỆNH
 /journey "mo ta trai nghiem" --feature X
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Xác định tính năng và tên hành trình        │
 │  Đoán tính năng từ mô tả; không chắc → hỏi bạn.      │
 │  Tính năng chưa có → tự đặt tên rồi tạo mới.         │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Thu thập hành trình cho đúng                │
 │  Đọc file brainstorm / use case của tính năng để     │
 │  lấy: persona (hành trình của ai), các giai đoạn     │
 │  theo thứ tự, các bước, cảm xúc ở mỗi bước, ai tham  │
 │  gia. Còn mơ hồ → HỎI bạn một lượt gọn — KHÔNG tự    │
 │  bịa điểm số.                                        │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Lập "danh sách cần có"                      │
 │  Mọi giai đoạn + bước + điểm số, liệt kê trước khi   │
 │  vẽ — cuối buổi dùng để soát xem có bỏ sót gì không. │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Xem trước rồi mới ghi (xin phép)            │
 │  "Hành trình của {persona}: N giai đoạn, M bước;     │
 │  điểm đau: ..." — bạn gật (Y) mới ghi vào file.      │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Ghi thêm vào tài liệu hành trình của tính   │
 │          năng                                        │
 │  Thêm một mục "## Journey: {Tên}" vào một file       │
 │  chung — mọi hành trình của một tính năng ở một chỗ. │
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
 │ BƯỚC 7 — Báo hoàn tất — nêu rõ các điểm đau          │
 │  Cho biết ghi vào file nào, xác nhận hình vẽ được,   │
 │  và liệt kê mọi bước điểm ≤2 để điểm đau không bị    │
 │  chìm trong hình.                                    │
 └─────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở tài liệu trong công cụ đọc là thấy bản đồ
```

---

## 3. Đọc một bản đồ hành trình như thế nào

Hình gồm ba thành phần:

- **Section (giai đoạn / điểm chạm).** Trải nghiệm được gom thành vài giai đoạn có tên — Tìm hiểu, Mua hàng, Sau khi mua... Mỗi giai đoạn là một phần của hình. Nếu bạn thấy cần quá nhiều giai đoạn, đó là dấu hiệu nên tách thành hai hành trình.
- **Bước.** Trong mỗi giai đoạn, mỗi bước một dòng — chuyện gì xảy ra, kể từ phía người dùng ("Thanh toán", "Theo dõi đơn hàng").
- **Điểm số + người tham gia.** Mỗi bước mang một điểm hài lòng **1-5** và (những) người tham gia (người dùng một mình, hoặc người dùng cùng hệ thống/nhân viên). Mermaid tô các điểm thấp đỏ rõ rệt — nỗi đau hiện thẳng lên hình.

Một điểm cần nói rõ: **điểm số là toàn bộ giá trị của loại sơ đồ này**. Một bản đồ hành trình mà bước nào cũng 5 điểm chỉ là một danh sách quy trình được trang trí đẹp hơn — nó không cho bạn biết gì cả. Hệ thống cố tình không mặc định mọi thứ là "vui vẻ": nếu không đọc ra được cảm xúc của một bước từ mô tả hoặc tài liệu sẵn có, nó sẽ hỏi thay vì đoán bừa điểm cao.

---

## 4. Bản đồ hành trình vs use case — bạn đồng hành, không thay thế nhau

Hai lệnh này được thiết kế để **bổ trợ cho nhau**, mô tả cùng một tính năng từ hai góc:

| Câu hỏi | Sơ đồ |
|---|---|
| "Mỗi loại người dùng làm được gì với hệ thống?" (chức năng) | `/usecase-diagram` |
| "Đi qua nó cảm giác thế nào, đau ở đâu?" (trải nghiệm + cảm xúc) | `/journey` (lệnh này) |
| "Quy trình chạy chính xác ra sao, có quyết định và rẽ nhánh nào?" | `/activity`, `/activity-swimlane` |

Một lỗi thường gặp là cố nhét chi tiết quy trình vào bản đồ hành trình ("rồi hệ thống kiểm tra, rồi nếu thẻ lỗi thì..."). Đó là luồng điều khiển — bản đồ hành trình cố tình không có rẽ nhánh hay quyết định. Nếu bạn thấy mình cần "if/else", hãy chuyển sang nhóm lệnh vẽ quy trình.

---

## 5. Lưu ở đâu, và sửa thì thế nào

`/journey` không tạo file rời rạc cho từng hành trình. Mọi hành trình của một tính năng được gom vào **một tài liệu chung** — `docs/{feature}/srs/{feature}-journey.md` — mỗi hành trình một mục `## Journey: {Tên}`. Chạy lại lệnh với một hành trình đã có, hệ thống hiểu là **cập nhật**: cho bạn xem phần thay đổi "trước/sau" rồi mới ghi đè — không tạo trùng.

Và vì Mermaid không hiện hình trong chat, không có kiểu "sửa nhiều vòng trong chat": bạn review từ **hình thật trong tài liệu**, rồi gọi lại lệnh khi cần đổi gì đó.

---

## 6. Ví dụ thực tế

Anh **Minh**, BA phụ trách tính năng "checkout", liên tục nghe bộ phận hỗ trợ than khách bỏ giỏ hàng giữa chừng — trong khi tài liệu use case trông hoàn hảo, chức năng nào cũng có đủ. Anh cần cho team thấy *trải nghiệm gãy ở đâu*, chứ không phải có những chức năng gì.

Anh Minh gõ:

```
/journey "khách mua lần đầu: tìm kiếm, so sánh, thêm vào giỏ, thanh toán, nhận hàng" --feature checkout
```

1. Tính năng đã rõ (`checkout`) nên không cần hỏi. Hệ thống đọc file brainstorm và use case của checkout, tìm được phần lớn các bước — nhưng tài liệu không nói gì về *cảm giác* ở từng bước, nên nó hỏi anh Minh một lượt gọn: bước nào suôn, bước nào đau, ai tham gia mỗi bước.

2. Anh Minh trả lời dựa trên dữ liệu hỗ trợ: tìm kiếm và giỏ hàng suôn sẻ (4-5), nhưng thanh toán rất đau (2) và thử lại sau khi thẻ lỗi còn tệ hơn (1).

3. Hệ thống lập "danh sách cần có" — 3 giai đoạn, 7 bước kèm điểm số — rồi xem trước: *"Hành trình khách mua lần đầu → checkout-journey.md: 3 giai đoạn, 7 bước. Điểm đau (≤2): 'Thanh toán', 'Thử lại sau lỗi thẻ'. Apply?"* Anh Minh gõ `Y`.

4. Hệ thống thêm mục vào `docs/checkout/srs/checkout-journey.md`, tự vẽ thử ảnh — đạt — và báo xong, nhắc lại hai bước đau kèm gợi ý gắn chúng vào một yêu cầu cải tiến.

Anh Minh mở file trong VS Code: bản đồ mở đầu xanh mướt, rồi hiện hai bước đỏ rõ rệt ở khâu thanh toán. Trong buổi họp kế hoạch tiếp theo, anh không cần tranh luận — bức hình tự nói thay, và việc "thiết kế lại luồng lỗi thanh toán" được ưu tiên.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (cú pháp Mermaid `journey`, các bước chính xác, trường hợp đặc biệt), đọc file gốc: `.claude/skills/journey/SKILL.md`.

Các lệnh liên quan trong cùng bộ công cụ:

- `explain-skills/usecase-diagram.vi.md` — **góc nhìn chức năng** của tính năng (nhân vật + hệ thống cung cấp gì); bản đồ hành trình là mặt cảm xúc bổ trợ cho nó.
- `explain-skills/activity-family.vi.md` — **góc nhìn quy trình** (các bước, quyết định, rẽ nhánh) — dùng khi luồng điều khiển mới là thứ quan trọng.
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
