---
type: skill-explainer
skill: code-flow
updated: 2026-07-26
---

# `/code-flow` là gì và nó chạy như thế nào?

[English](code-flow.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/code-flow` là lệnh **đọc một đoạn code thật, đang tồn tại** — một hàm, một method, một module — rồi vẽ ra **sơ đồ luồng** mô tả nó hoạt động thế nào, với mọi thành phần trong hình đều được đóng dấu **nó lấy từ chỗ nào trong code** (`file:line`).

Hãy hình dung như bạn nhờ một đồng nghiệp cẩn thận: *"giải thích giúp em hàm này thực sự làm gì."* Thay vì một câu trả lời theo trí nhớ, bạn nhận về một bức hình — ai gọi ai, chỗ nào rẽ nhánh, khi lỗi thì sao — và **mỗi mũi tên trong hình đều kèm số trang tham chiếu** trỏ đúng dòng code nó được đọc ra. Bất kỳ khẳng định nào bạn cũng tự kiểm chứng được.

Điều này khiến nó khác hẳn các lệnh vẽ khác trong bộ công cụ:

- `/sequence`, `/activity`, `/state` vẽ hình **từ mô tả bằng lời thường của bạn** — bạn kể chuyện, hệ thống vẽ.
- `/scan-project` cũng đọc code, nhưng vẽ **kiến trúc của cả codebase** — tấm bản đồ lớn.
- `/code-flow` đọc code, nhưng chỉ cho **một mục tiêu duy nhất** — bức cận cảnh của một hàm hay một module.

Vài tình huống điển hình nên dùng `/code-flow`:

- Bạn **thừa kế code không ai viết tài liệu** — cần hiểu `placeOrder` thực sự làm gì trước khi đụng vào.
- Bạn làm BA trên một hệ thống có sẵn và cần **tài liệu hóa hành vi thực tế**, không phải hành vi dự định — code là nguồn sự thật duy nhất còn lại.
- Bạn nghi ngờ code **đã trôi xa khỏi spec** — một sơ đồ vẽ từ chính code, kèm số dòng tham chiếu, sẽ chấm dứt tranh cãi.

Gõ lệnh đơn giản như:

```
/code-flow src/orders/placeOrder.ts
/code-flow OrderService.placeOrder --as state
```

Phần đầu là **mục tiêu** — một đường dẫn file hoặc tên hàm/class. Phần `--as` (không bắt buộc) ép vẽ một loại sơ đồ cụ thể; bỏ trống thì hệ thống tự chọn loại phù hợp với việc code thực sự làm gì (nói kỹ ở mục 3).

**Một câu để nhớ:** `/code-flow` biến **một đoạn code có sẵn** thành **một bức hình luồng kèm số trang tham chiếu** — câu trả lời trung thực cho "hàm này thực sự chạy thế nào?"

---

## 2. Toàn bộ luồng chạy — sơ đồ

Luồng chạy gồm **hai giai đoạn với một điểm dừng cứng ở giữa**: đầu tiên hệ thống *đọc* (không đụng gì cả), rồi dừng lại hỏi bạn, và chỉ sau khi bạn gật đầu nó mới *vẽ*.

```
 BẠN GÕ LỆNH
 /code-flow <file-hoặc-hàm> [--as sequence|activity|state]
        │
        ▼
═══ GIAI ĐOẠN 1 — ĐỌC VÀ LẦN VẾT (không đụng gì cả) ═══
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Xác định chính xác đoạn code bạn muốn nói    │
 │  Tìm mục tiêu trong codebase. Một kết quả → đi tiếp.  │
 │  Nhiều hàm trùng tên → liệt kê ra và HỎI bạn chọn cái │
 │  nào — không tự đoán.                                 │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Một "người đọc" riêng lần vết đoạn code      │
 │  Một trợ lý chỉ-đọc đọc mục tiêu cộng thêm một tầng   │
 │  các lời gọi của nó, rồi trả về phát hiện kèm bằng    │
 │  chứng file:line: chuỗi lời gọi theo thứ tự · nhánh   │
 │  rẽ/vòng lặp kèm điều kiện · trường trạng thái và     │
 │  các bước chuyển · điểm chạm bên ngoài (DB, queue,    │
 │  bên thứ ba). Mỗi phát hiện được đánh dấu ✅ đọc      │
 │  trực tiếp hoặc 🔵 suy luận (xem mục 4).              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Chọn loại sơ đồ hợp với đoạn code            │
 │  Chủ yếu là chuỗi lời gọi theo thời gian → sequence.  │
 │  Chủ yếu là rẽ nhánh/vòng lặp → activity.             │
 │  Chủ yếu là máy trạng thái → state.                   │
 │  (Bỏ qua nếu bạn đã ép loại bằng --as.)               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — DỪNG CỨNG: xem trước, xin phép               │
 │  "Đã lần vết <mục tiêu>. Chủ yếu là <X> → em sẽ vẽ    │
 │  sơ đồ <loại>, N bước. 🔵 Suy luận: <danh sách>.      │
 │  Vẽ nhé?" — Y / sửa / đổi loại. CHƯA ghi gì ra cả.    │
 └──────────────────────────────────────────────────────┘
        │  (bạn gõ Y)
        ▼
═══ GIAI ĐOẠN 2 — VẼ ═══
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Ghi sơ đồ vào tài liệu                       │
 │  Mã chữ Mermaid, dùng đúng công thức vẽ của           │
 │  /sequence, /activity hoặc /state.                    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Vẽ thử ra ảnh, kiểm lỗi cú pháp              │
 │  Cùng bước tự kiểm như /sequence: vẽ thử một ảnh để   │
 │  chắc chắn hình sẽ hiện khi bạn mở file. Lỗi → tự     │
 │  sửa, thử lại vài lần.                                │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Gắn bảng nguồn gốc (provenance)              │
 │  Ngay dưới sơ đồ: mỗi thành phần trong hình một dòng  │
 │  → file:line nó lấy ra → độ tin cậy ✅ hoặc 🔵.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 8 — Báo hoàn tất                                 │
 │  File nào, loại gì, hình vẽ được — và danh sách các   │
 │  chỗ 🔵 suy luận vẫn cần mắt người xem lại.           │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở tài liệu trong công cụ đọc là thấy hình
```

---

## 3. Nó chọn loại hình để vẽ như thế nào?

Bạn đưa cho `/code-flow` một mục tiêu, không phải một loại sơ đồ — mà code khác nhau thì xứng với hình khác nhau. Nên hệ thống nhìn vào **code thực sự dành phần lớn số dòng để làm gì** rồi chọn theo đó:

| Code chủ yếu là… | Nó vẽ | Vì sao hình đó hợp |
|---|---|---|
| **Gọi xuyên các tầng** — controller gọi service gọi repository gọi cổng bên ngoài | **sequence** | phần đáng xem là *ai gọi ai, theo thứ tự nào, trả về gì* |
| **Rẽ nhánh và lặp** — nhiều if/else, một switch, vòng retry | **activity** | phần đáng xem là *logic đi đường nào và rẽ ở đâu* |
| **Lật một trường trạng thái** — đơn hàng đi `pending → paid → cancelled` | **state** | phần đáng xem là *có những trạng thái nào và sự kiện gì làm chuyển* |

Khi phân vân, nó mặc định chọn **sequence** — dáng hình phổ biến nhất của câu hỏi "cái này chạy thế nào". Và bạn luôn nắm quyền ghi đè: `--as state` ép vẽ sơ đồ trạng thái kể cả khi hệ thống định chọn loại khác, và tại điểm dừng cứng (Bước 4) bạn có thể nói "đổi loại" trước khi bất cứ thứ gì được vẽ.

Một giới hạn cố ý đáng biết: việc lần vết chỉ theo mục tiêu cộng **một tầng** các lời gọi của nó. Nếu `placeOrder` gọi `PaymentService.charge`, sơ đồ có vẽ lời gọi đó — nhưng **không** bung hết những gì `charge` làm bên trong (chỗ đó ghi chú "→ …"). Nhờ vậy bức hình giữ đúng độ cao: một bức cận cảnh dễ đọc của một hàm, không vô tình phình thành bản đồ cả hệ thống. Muốn xem ruột của `charge`? Chạy `/code-flow PaymentService.charge` như một mục tiêu riêng.

---

## 4. "Bảng nguồn gốc" là gì, và các dấu ✅ / 🔵 để làm gì?

Đây là tính năng làm nên sự trung thực của `/code-flow`, nên xứng đáng một mục riêng.

Dưới mỗi sơ đồ, hệ thống gắn thêm một **bảng nguồn gốc code** (Code provenance): mỗi thành phần trong hình một dòng, chỉ đúng chỗ trong code nó được đọc ra:

```
| Thành phần trong hình   | Vị trí trong code           | Độ tin cậy |
|-------------------------|-----------------------------|------------|
| BE → DB: INSERT order   | src/orders/placeOrder.ts:42 | ✅         |
| → PaymentService.charge | src/orders/placeOrder.ts:51 | 🔵 suy luận |
```

**Vì sao phải mất công vậy?** Vì một sơ đồ về code là một tập các *khẳng định* về code — "hàm này ghi vào database", "khi lỗi thì đi lối này". Sơ đồ vẽ tay bắt bạn tin những khẳng định đó bằng niềm tin. Sơ đồ có nguồn gốc khiến mọi khẳng định đều **kiểm chứng được**: mở file, nhảy tới dòng, tự mắt thấy. Sau này khi code thay đổi, bảng này còn cho bạn biết chính xác phải kiểm lại những dòng nào.

**Hai dấu độ tin cậy:**

- **✅ đọc trực tiếp** — hệ thống đã đọc đúng dòng đó, thấy tận mắt.
- **🔵 suy luận** — hệ thống **không** đọc trọn vẹn được, và nói thẳng ra như vậy. Chuyện này xảy ra khi lời gọi đi qua một interface (bản cài đặt cụ thể không lộ ra trong chữ), vắt sang repository khác, hoặc được điều phối động (dynamic dispatch).

> **Quy tắc đứng sau các dấu, nói thẳng luôn: hệ thống không bao giờ bịa.** Nếu một lời gọi không lần vết được, nó hiện thành 🔵 kèm "cần xác nhận" — không bao giờ bị lặng lẽ bịa ra cho bức hình trông trọn vẹn. Một sơ đồ có hai khoảng trống 🔵 trung thực đáng giá hơn một sơ đồ liền mạch chứa một lời nói dối tự tin, vì các dấu 🔵 chỉ cho bạn biết chính xác nên dành năm phút xem lại của con người vào đâu. Báo cáo hoàn tất nhắc lại danh sách 🔵 cũng vì lý do đó.

---

## 5. Vì sao một "người đọc" riêng lần vết code, và vì sao có điểm dừng cứng ở giữa?

**Vì sao có người đọc riêng (Bước 2)?** Lần vết code nghĩa là mở rất nhiều file — mục tiêu, các hàm nó gọi, các kiểu dữ liệu chúng dùng. Nếu toàn bộ đống chữ thô đó dồn vào cuộc hội thoại chính, bộ nhớ làm việc của trợ lý sẽ đầy ắp code, và phần suy luận thực sự sẽ kém đi. Nên việc đọc được giao cho một **trợ lý chỉ-đọc**: nó tiêu hóa các file rồi chỉ trả về phát hiện đã chưng cất — chuỗi lời gọi, nhánh rẽ, trạng thái, điểm chạm bên ngoài, mỗi thứ kèm `file:line`. Luồng chính giữ sạch để lo phần suy nghĩ. Trợ lý này chỉ-đọc theo thiết kế: **Giai đoạn 1 không bao giờ có thể sửa code hay tài liệu của bạn**, trong mọi trường hợp.

**Vì sao có điểm dừng cứng (Bước 4)?** Vì lần vết là nửa việc tốn kém và dễ sai — mà bạn là người duy nhất biết bản lần vết có *khớp với thực tế* không. Bản xem trước cho bạn biết đã tìm thấy gì, sẽ vẽ loại nào, và — quan trọng nhất — các chỗ 🔵 chưa chắc nằm ở đâu, **trước khi** bất cứ thứ gì được ghi ra. Nếu hệ thống nhận nhầm mục tiêu, chọn sai loại sơ đồ, hay bỏ sót một nhánh bạn biết là có, bạn sửa ngay tại đây, ở thời điểm rẻ nhất có thể. Vẽ trước hỏi sau sẽ phí một lần vẽ cho một tiền đề sai.

---

## 6. Nó khác `/scan-project` và `/sequence` thế nào?

Ba lệnh nghe na ná nhau; nhưng khác biệt rất rõ:

| | `/sequence` (và họ hàng) | `/code-flow` (lệnh này) | `/scan-project` |
|---|---|---|---|
| **Nguồn sự thật** | mô tả bằng lời của bạn | **chính đoạn code** | chính đoạn code |
| **Phạm vi** | một luồng nghiệp vụ | **một hàm / module** | **cả codebase** |
| **Đầu ra** | một sơ đồ trong tài liệu các luồng | một sơ đồ **+ bảng nguồn gốc** | trọn bộ sơ đồ kiến trúc |
| **Câu hỏi trả lời tốt nhất** | "luồng này *nên* chạy thế nào?" | "*hàm này* thực sự chạy thế nào?" | "*hệ thống này* được ghép ra sao?" |

Một cách dễ nhớ: `/scan-project` là **ảnh vệ tinh**, `/code-flow` là **ảnh cận cảnh mặt đường**, `/sequence` là **bức phác họa của họa sĩ theo lời bạn kể**. Chúng bổ sung chứ không thay thế nhau — một combo hay gặp là chạy `/scan-project` một lần khi mới vào codebase, rồi `/code-flow` cho từng hàm gai góc bạn sắp đụng vào. Đó cũng là lý do `/code-flow` từ chối phình thành sơ đồ kiến trúc: sai độ cao cho công cụ này.

---

## 7. Nếu mục tiêu mơ hồ, quá to, hoặc chẳng phải một luồng thì sao?

Vài tình huống lệnh này xử lý một cách có chủ đích, biết trước thì đỡ bất ngờ:

- **Tên trùng ở nhiều chỗ.** `placeOrder` có trong ba file → hệ thống liệt kê cả ba và hỏi bạn chọn. Nó không đoán — một sơ đồ hoàn hảo của nhầm hàm còn tệ hơn một câu hỏi.
- **Mục tiêu là hàm-khổng-lồ hay cả một thư mục.** Nó lần vết điểm vào cộng một tầng, đánh dấu các lời gọi sâu hơn là "→ tên", và gợi ý chạy `/code-flow` cho các mục tiêu con bạn quan tâm. Tương tự, đệ quy được đánh dấu "↺ tự gọi" thay vì vẽ một vòng lặp vô tận.
- **Mục tiêu không phải một luồng.** Một cấu trúc dữ liệu thuần (DTO, file cấu hình) không có hành vi để lần vết — hệ thống nói thẳng và chỉ bạn sang `/erd` (hình dạng dữ liệu) hoặc `/d2-architect` (cấu trúc) thay vì ép ra một bức hình luồng vô nghĩa.
- **Bạn chạy lại trên cùng mục tiêu.** Nó nhận ra sơ đồ đã có và vào **chế độ cập nhật** — cho bạn xem phần thay đổi trước khi ghi đè, không bao giờ tạo bản trùng. Vòng review giống `/sequence`: bạn duyệt từ hình thật trong tài liệu, và gọi lại lệnh để sửa.

---

## 8. Ví dụ thực tế

Anh **Minh**, một developer vừa tiếp quản module đơn hàng của một hệ thống năm năm tuổi, được BA nhờ giải thích chuyện gì thực sự xảy ra khi khách đặt hàng — spec cũ nói một đằng, nhưng chẳng ai còn tin nó nữa.

Anh Minh mở terminal, gõ:

```
/code-flow src/orders/placeOrder.ts
```

1. Hệ thống tìm thấy đúng một file `placeOrder.ts` — không mơ hồ, đi tiếp.
2. Người đọc chỉ-đọc lần vết hàm này cộng một tầng lời gọi. Nó trả về: một chuỗi lời gọi (kiểm tra → giữ tồn kho → thu tiền → ghi đơn → phát sự kiện), hai nhánh rẽ (thanh toán lỗi, hết hàng), và một lời gọi không phân giải trọn được — `notifier.send(...)` đi qua interface, class cụ thể không rõ → đánh dấu 🔵.
3. Code chủ yếu là chuỗi lời gọi xuyên các tầng → hệ thống chọn **sequence**.
4. Dừng cứng: *"Đã lần vết `placeOrder` (src/orders/placeOrder.ts:18). Chủ yếu là chuỗi lời gọi → em sẽ vẽ sơ đồ sequence: 9 thông điệp, 2 nhánh rẽ. 🔵 Suy luận: notifier cụ thể đứng sau `notifier.send`. Vẽ nhé?"* Anh Minh xem chỗ 🔵 — anh biết đó là adapter gửi email — rồi gõ `Y`.
5. Hệ thống ghi sơ đồ sequence vào `docs/orders/code-flow/place-order-flow.md`.
6. Nó vẽ thử ra ảnh — hình biên dịch được ngay lần đầu.
7. Nó gắn bảng nguồn gốc: 11 dòng, mỗi thành phần trỏ đúng dòng của nó trong `placeOrder.ts` và các hàm được gọi, mười ✅ và một 🔵.
8. Báo cáo liệt kê file, loại sơ đồ, và nhắc lại chỗ 🔵 duy nhất cần xác nhận.

Anh Minh mở file, theo bảng nguồn gốc nhảy tới dòng 58 để kiểm lại nhánh thanh-toán-lỗi — đúng y như hình vẽ. Anh gửi file cho BA: chị đọc hình, anh tin số dòng, và bản spec năm năm tuổi cuối cùng cũng được sửa lại theo thực tế. Về sau, khi anh refactor bước giữ tồn kho, anh chạy lại đúng lệnh đó — hệ thống vào chế độ cập nhật và chỉ cho anh xem "trước/sau" của riêng phần thay đổi.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (cách phân giải mục tiêu, prompt lần vết, định dạng bảng nguồn gốc, các trường hợp đặc biệt), đọc file gốc: `.claude/skills/code-flow/SKILL.md`.

Các lệnh vẽ sơ đồ khác trong cùng bộ công cụ:

- `explain-skills/sequence.vi.md` — vẽ sơ đồ tuần tự **từ mô tả của bạn**. Cùng loại hình mà `/code-flow` hay tạo ra nhất, nhưng ngược nguồn sự thật: bạn kể chuyện cho `/sequence`; còn `/code-flow` đọc câu chuyện ra từ code.
- `explain-skills/state.vi.md` và `explain-skills/activity-family.vi.md` — hai loại hình còn lại `/code-flow` có thể tạo ra, được giải thích riêng.
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
