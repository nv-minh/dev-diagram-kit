---
type: skill-explainer
skill: dfd
updated: 2026-07-26
---

# `/dfd` là gì và nó chạy như thế nào?

[English](dfd.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/dfd` là lệnh vẽ **sơ đồ luồng dữ liệu** (Data Flow Diagram) — bức hình trả lời một câu hỏi rất cụ thể: **dữ liệu đi đâu?** Bên ngoài nào đưa dữ liệu vào, bước xử lý nào biến đổi nó, nó nằm nghỉ ở kho nào, và cái gì chảy ngược ra ngoài.

Hãy hình dung như **theo dõi một bưu kiện qua hệ thống bưu điện**: người gửi và người nhận đứng bên ngoài (họ không thuộc bưu điện), các khâu phân loại và giao nhận nằm bên trong, các nhà kho là nơi bưu kiện chờ — và thứ bạn ghi trên mỗi mũi tên là **chính bưu kiện**, không phải hành động vận chuyển. Một DFD làm đúng như vậy với dữ liệu: khách hàng và cổng thanh toán đứng bên ngoài, các tiến trình biến đổi dữ liệu bên trong, các kho dữ liệu giữ nó khi nằm nghỉ, và mỗi mũi tên được dán nhãn bằng dữ liệu di chuyển.

Một lệnh tạo ra **hai bức hình ở hai mức phóng to**:

- **L0 (bối cảnh)** — cả hệ thống là **một ô duy nhất**, xung quanh là các bên ngoài và dữ liệu vượt qua ranh giới. Bức hình "nhìn một cái là thấy": cái gì vào, cái gì ra.
- **L1 (bung ra)** — chính ô đó được mở ra thành vài tiến trình đánh số cùng các kho dữ liệu xen giữa. Bức hình "bên trong nó chảy thế nào".

Vài tình huống điển hình nên dùng `/dfd`:

- Có người hỏi **"dữ liệu khách hàng thực sự được lưu ở đâu, ai chạm vào nó?"** — một buổi rà soát quyền riêng tư, một cuộc audit, một bài tập lập bản đồ dữ liệu. Đây chính là sơ đồ cho câu hỏi đó.
- Bạn đã có sơ đồ kiến trúc và sơ đồ tuần tự, nhưng người đọc vẫn không thấy được **kho nào cấp dữ liệu cho bước nào** — góc nhìn dữ liệu là mảnh còn thiếu thứ ba.
- Bạn đang đặc tả một tính năng về bản chất là **dữ liệu vào, biến đổi, dữ liệu ra** (đặt hàng, xuất hóa đơn, báo cáo) và muốn dev thống nhất về các kho và các luồng trước khi ai đó viết code.

Gõ lệnh đơn giản như:

```
/dfd --feature order
/dfd "khách đặt hàng, hệ thống thu tiền qua cổng thanh toán và lưu lịch sử đơn"
```

Dạng thứ nhất trỏ vào một tính năng có sẵn (hệ thống đọc tài liệu của tính năng đó làm nguồn). Dạng thứ hai là mô tả bằng lời thường — nếu tính năng chưa tồn tại, hệ thống tự đặt tên, phỏng vấn bạn một lượt, rồi tạo mới.

**Một câu để nhớ:** `/dfd` vẽ **dữ liệu di chuyển ở đâu** — giữa thế giới bên ngoài, các tiến trình biến đổi nó, và các kho giữ nó — ở hai mức phóng to, L0 cho ranh giới và L1 cho bên trong.

---

## 2. Toàn bộ luồng chạy — sơ đồ

Khác `/sequence` (nhúng mã chữ vào tài liệu), `/dfd` tạo ra **file ảnh độc lập**: hai file nguồn `.d2` và hai ảnh `.svg` đã vẽ xong. Điều này định hình luồng chạy: hệ thống phải biên dịch nguồn thành ảnh thật, rồi **tự nhìn lại ảnh** trước khi báo xong.

```
 BẠN GÕ LỆNH
 /dfd --feature order        (hoặc một mô tả bằng lời thường)
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Xác định thuộc tính năng nào                 │
 │  Ghi rõ tính năng → dùng luôn. Mô tả một cái mới →    │
 │  tự đặt tên rồi tạo. File đã tồn tại → chuyển sang    │
 │  chế độ cập nhật thay vì từ chối.                     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Thu thập dữ kiện luồng dữ liệu, nguồn tốt    │
 │          nhất trước                                   │
 │  Đọc theo thứ tự ưu tiên: ERD của tính năng (thực     │
 │  thể là ứng viên kho) → spec (quy tắc thành tiến      │
 │  trình) → ghi chú brainstorm (các bên ngoài). Không   │
 │  có gì → hỏi BẠN một lượt gộp duy nhất, bằng ngôn     │
 │  ngữ nghiệp vụ.                                       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Lập danh sách dữ kiện cần có                 │
 │  Mọi bên ngoài · mọi tiến trình · mọi kho dữ liệu ·   │
 │  mọi luồng (nguồn → đích + nhãn dữ liệu). Dùng ở      │
 │  cuối để soát không rơi rớt gì.                       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Xem trước bằng lời thường, xin phép          │
 │  "Em sẽ vẽ DFD cho order: 2 bên ngoài, 3 tiến trình,  │
 │  2 kho. Apply?" — ngôn ngữ nghiệp vụ, KHÔNG xả mã     │
 │  nguồn sơ đồ ra. Bạn gật (Y) trước đã.                │
 └──────────────────────────────────────────────────────┘
        │  (bạn gõ Y)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Viết hai file nguồn: L0 rồi L1               │
 │  Mã chữ D2, không tọa độ thủ công — bộ máy dàn trang  │
 │  tự xếp vị trí. L0: một ô hệ thống + các bên ngoài +  │
 │  các luồng qua ranh giới. L1: ô đó bung thành các     │
 │  tiến trình (1.1, 1.2…) + các kho (D1…).              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Biên dịch cả hai thành ảnh .svg thật         │
 │  Biên dịch lỗi (thường do nhãn chứa ký tự đặc biệt    │
 │  chưa đặt trong ngoặc kép) → tự sửa, vẽ lại. Chỉ đi   │
 │  tiếp khi cả hai ảnh thực sự tồn tại.                 │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Nhìn lại ảnh, kiểm sự cân bằng               │
 │  Mở chính sản phẩm của mình: mọi dữ kiện ở Bước 3 đã  │
 │  vẽ đủ chưa? Và quy tắc cân bằng: mọi luồng vượt      │
 │  ranh giới ở L0 phải xuất hiện lại ở L1 (mục 4).      │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 8 — Báo hoàn tất                                 │
 │  Liệt kê các file, các con số (bên ngoài / tiến       │
 │  trình / kho), xác nhận cả hai ảnh biên dịch được.    │
 │  Ghi lại vào sổ theo dõi.                             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở các file .svg trong trình duyệt/IDE để xem
```

---

## 3. Ba loại ô, và một quy tắc duy nhất về mũi tên

Mọi DFD đều được ghép từ đúng ba loại thành phần cộng với mũi tên. Nắm bốn điều này là bạn đọc được bất kỳ DFD nào:

- **Bên ngoài** (external entity — xám, viền đứt) — một người, tổ chức hay hệ thống **nằm ngoài ranh giới của bạn**: Khách hàng, Nhà cung cấp, Cổng thanh toán. Viền đứt là có chủ ý: "ta không kiểm soát cái này, chỉ trao đổi dữ liệu với nó." Bên ngoài đưa dữ liệu và nhận dữ liệu; không bao giờ được vẽ làm việc bên trong.

- **Tiến trình** (process — xanh lá, bo góc, đánh số `1.0`, `1.1`, `1.2`…) — một bước **biến đổi** dữ liệu: nhận vào, làm gì đó, đưa ra. Việc đánh số không phải hình thức — nó là sợi chỉ nối các mức phóng to: `1.0` ở L0 bung thành `1.1`, `1.2`, `1.3` ở L1, nhờ vậy người đọc luôn biết bức cận cảnh nào thuộc ô tổng quan nào.

- **Kho dữ liệu** (data store — hình trụ tím, đánh số `D1`, `D2`…) — nơi dữ liệu **nằm nghỉ giữa các bước**: Đơn hàng, Khách hàng. Kho tự nó không làm gì cả; nó chỉ giữ dữ liệu cho tới khi một tiến trình đọc ra.

- **Quy tắc mũi tên — chỗ người ta hay làm sai nhất:** mỗi nhãn mũi tên gọi tên **dữ liệu di chuyển, không bao giờ là hành động**. Phải là `"order"`, không phải `"sends order"`; `"payment result"`, không phải `"responds"`. Hướng mũi tên đã nói "chảy tới" rồi — viết thêm động từ là thừa, và tệ hơn, nó kéo sơ đồ trượt về phía biểu đồ quy trình, vốn là việc của công cụ khác (mục 6).

> **Một chỗ hay bị hiểu nhầm, nói rõ luôn:** kho dữ liệu trong DFD **không phải** là bảng cơ sở dữ liệu. "D1 Orders" chỉ nói *dữ liệu về đơn hàng nằm nghỉ ở đây* — không cột, không kiểu dữ liệu, không quan hệ. Mức chi tiết đó thuộc về `/erd`. Nếu bạn thấy mình muốn liệt kê thuộc tính bên trong một kho, đó là tín hiệu bạn đã trôi sang nhầm loại sơ đồ.

---

## 4. Vì sao hai bức hình — L0 trước, rồi mới L1?

Nghe có vẻ phí công khi vẽ hệ thống hai lần. Không phí đâu, và lý do nằm ở **đối tượng đọc và sự đồng thuận**.

**L0 trả lời câu hỏi ranh giới.** Trước khi ai đó quan tâm dữ liệu chảy *bên trong* thế nào, mọi người phải thống nhất cái gì vượt qua *mép ngoài*: có những bên ngoài nào, họ đưa ta gì, ta trả lại gì. Đó là cuộc trao đổi bạn có thể có với một sponsor hay một cán bộ tuân thủ trong ba mươi giây, chính vì L0 giấu hết mọi thứ nội bộ — một ô, vài mũi tên. Ranh giới sai thì mọi sơ đồ sâu hơn đều vô giá trị, nên nó xứng đáng có bức hình riêng.

**L1 trả lời câu hỏi bên trong.** Ranh giới đã chốt, L1 mở chiếc hộp ra: 3-6 tiến trình đánh số và các kho xen giữa. Cố ý **3-6, không hơn** — nếu bên trong cần mười tiến trình, sơ đồ đã hết dễ đọc, và hệ thống sẽ gợi ý đi sâu thêm một mức cho một tiến trình con (một L2) hoặc thu hẹp phạm vi, thay vì nhồi nhét.

**Và quy tắc giữ cho hai bức hình trung thực với nhau: phân rã cân bằng.** Mọi mũi tên vượt ranh giới ở L0 phải xuất hiện lại đâu đó trong L1, và L1 không được sinh thêm luồng vượt ranh giới mới nào. Nếu L0 vẽ "payment result" chảy vào từ cổng thanh toán, thì phải có một tiến trình L1 nhận đúng luồng đó. Sao nghiêm vậy? Vì hai bức hình tự nhận là **cùng một hệ thống ở hai mức phóng to** — nếu dữ liệu có thể tự sinh ra hay biến mất giữa chúng, một trong hai bức đang sai, và người đọc không còn tin được bức nào nữa. Hệ thống tự kiểm sự cân bằng này ở Bước 7, giống cách `/sequence` đối chiếu danh sách cần có của nó: vẽ ra được hình không đồng nghĩa với đầy đủ và nhất quán.

---

## 5. Vì sao hệ thống tự dàn trang — và tự soát lại ảnh của chính nó?

Hai lựa chọn thiết kế trong luồng chạy xứng đáng một câu "vì sao".

**Không tọa độ thủ công.** Hệ thống chỉ viết *có những gì và cái gì nối với cái gì* — không bao giờ "đặt ô này ở x=200." Một bộ máy dàn trang tự tính vị trí. Điều này quan trọng hơn vẻ ngoài của nó: khi bạn thêm một tiến trình vào sơ đồ xếp tay, mọi thứ chồng chéo và ai đó mất cả giờ kéo ô. Với dàn trang bằng máy, mỗi lần chạy lại là một bức hình sạch — đó chính là điều khiến **chế độ cập nhật** rẻ. Chạy lại `/dfd --feature order` sau khi nghiệp vụ thêm luồng hoàn tiền: hệ thống so sánh, vá file nguồn, vẽ lại; không phải sắp xếp tay gì cả.

**Tự soát lại ảnh đã vẽ.** File `.svg` không hiện trong khung chat, nên nếu hệ thống dừng ở "biên dịch xong," bạn sẽ là người đầu tiên thực sự *nhìn* bức hình — và là người đầu tiên phát hiện một nhãn bị cụt hay một kho bị thiếu. Vì vậy trước khi báo xong, hệ thống mở chính sản phẩm của mình và đối chiếu với danh sách dữ kiện ở Bước 3, cộng quy tắc cân bằng ở mục 4. Cùng triết lý với hai bước vẽ-thử-và-đối-chiếu của `/sequence`, chuyển thể cho file ảnh: **"biên dịch được" và "vẽ đúng" là hai phép kiểm khác nhau**, và hệ thống nợ bạn cả hai. Cũng vì lý do đó mà không có vòng "sửa qua nhiều lượt chat" — bạn duyệt từ file `.svg` thật, và gọi lại lệnh khi muốn đổi.

---

## 6. Góc nhìn dữ liệu — `/dfd` đứng cạnh các họ sơ đồ khác thế nào

Cách hữu ích nhất để hiểu `/dfd` là xem nó như **chân thứ ba của một chiếc kiềng**. Một hệ thống có thể được nhìn từ ba góc vuông góc với nhau, và mỗi góc có họ lệnh riêng:

| Góc nhìn | Câu hỏi nó trả lời | Lệnh |
|---|---|---|
| **Cấu trúc** | có những khối nào, lồng/nối với nhau ra sao? | `/system-design`, `/d2-architect` (góc nhìn C4) |
| **Thời gian** | ai gọi ai, theo thứ tự nào, rẽ nhánh ra sao? | `/sequence` |
| **Dữ liệu** | dữ liệu đi đâu, tiến trình nào biến đổi, kho nào giữ? | **`/dfd` (lệnh này)** |

"Vuông góc" là từ khóa: các góc nhìn này **không cạnh tranh, chúng bổ sung nhau**. Sơ đồ kiến trúc có thể vẽ một ô "Order service" nối với một database — nhưng không nói được *dữ liệu gì* chảy trên đường nối đó hay *vì sao*. Sơ đồ tuần tự cho thấy thứ tự các lời gọi — nhưng kho dữ liệu gần như vắng bóng, và "thứ này cuối cùng nằm nghỉ ở đâu" thì vô hình. Chỉ DFD lấy dữ liệu làm nhân vật chính. Một tính năng có đủ cả ba (C4 cho cấu trúc, sequence cho thời gian, DFD cho dữ liệu) sẽ để lại rất ít câu "khoan, thế còn… đi đâu?"

Hai lệnh lân cận hay bị nhầm với `/dfd`:

- **`/erd`** — vẽ dữ liệu *lúc nằm nghỉ, ở mức chi tiết*: thực thể, thuộc tính, quan hệ. DFD gọi tên một kho là "D1 Orders" rồi dừng; ERD mở chiếc kho đó ra. Hai góc anh em của dữ liệu — chuyển động và hình dạng.
- **`/d2-activity`** — vẽ luồng *quy trình*: các bước, các quyết định, ai làm gì. Nhìn qua thì giống (cũng ô và mũi tên!) nhưng mũi tên của nó nghĩa là "rồi làm việc này," còn mũi tên DFD nghĩa là "dữ liệu này chuyển tới đây." Nếu nhãn mũi tên của bạn cứ đòi làm động từ, thứ bạn cần là `/d2-activity`, không phải `/dfd`.

---

## 7. File nằm ở đâu, duyệt và sửa thế nào

`/dfd` ghi vào một thư mục riêng theo tính năng — `docs/{feature}/dfd/` — năm file: nguồn và ảnh của L0, nguồn và ảnh của L1, cùng một file chỉ mục nhỏ liệt kê mọi thành phần. Nó cố ý **không** ghi vào thư mục `srs/` của tính năng: đặc tả chữ và sơ đồ đã vẽ có vòng đời khác nhau, trộn lẫn khiến cả hai khó bảo trì hơn.

Duyệt rất đơn giản: **mở hai file `.svg`** trong trình duyệt, IDE hay Obsidian — hình thật, không phải mã. Kiểm ba thứ theo thứ tự: (1) ranh giới L0 đúng chưa — đủ mọi bên ngoài, không thứ nội bộ nào lọt ra ngoài? (2) các tiến trình L1 có khớp cách nghiệp vụ thực sự nghĩ về công việc không? (3) soát xác suất vài mũi tên — mỗi nhãn có phải một mẩu dữ liệu, không phải động từ?

Muốn đổi gì, **gọi lại lệnh** và nói cần thay đổi gì. Hệ thống nhận ra bộ file có sẵn, vào chế độ cập nhật, cho bạn xem phần khác biệt trước khi ghi đè, và vẽ lại cả hai mức — giữ chúng cân bằng với nhau. Không bao giờ tạo ra một bộ trùng lặp.

---

## 8. Ví dụ thực tế

Chị **Trang**, BA của tính năng "order" (đặt hàng), nhận một câu hỏi từ buổi rà soát tuân thủ mà tài liệu hiện có không trả lời được: *"chỉ cho chúng tôi mọi nơi dữ liệu khách hàng chảy qua và được lưu ở đâu."* Chị có ERD và spec — nhưng không có gì cho thấy dữ liệu **đang chuyển động**.

Chị Trang mở terminal, gõ:

```
/dfd --feature order
```

1. Tính năng đã tồn tại — hệ thống tìm thấy `docs/order/` cùng tài liệu của nó. Không cần hỏi gì.
2. Nó thu thập dữ kiện theo thứ tự ưu tiên: ERD cho ra các ứng viên kho (Orders, Customers); quy tắc nghiệp vụ trong spec cho ra các tiến trình (nhận đơn, xử lý thanh toán, hoàn tất đơn); ghi chú brainstorm cho ra các bên ngoài (Khách hàng, Cổng thanh toán).
3. Nó lập danh sách dữ kiện: 2 bên ngoài, 3 tiến trình, 2 kho, 9 luồng — mỗi luồng kèm nhãn dữ liệu.
4. Nó xem trước bằng lời thường: *"Em sẽ vẽ DFD cho order tại `docs/order/dfd/` — Bên ngoài (2): Khách hàng, Cổng thanh toán. Tiến trình (3): 1.1 Nhận đơn · 1.2 Xử lý thanh toán · 1.3 Hoàn tất đơn. Kho dữ liệu (2): D1 Orders · D2 Customers. Nguồn: ERD + spec của chị. Apply?"* Chị Trang gõ `Y`.
5. Nó viết hai file nguồn. L0: một ô "1.0 Hệ thống đặt hàng," Khách và Cổng thanh toán đứng ngoài, bốn luồng qua ranh giới ("order," "confirmation," "payment request," "payment result"). L1: ô đó bung thành 1.1/1.2/1.3 cộng D1 và D2, mỗi mũi tên dán nhãn dữ liệu — "order record," "pending order," "payment status," "customer profile."
6. Nó biên dịch cả hai. L1 lỗi một lần — nhãn `"1.2 Process payment (card)"` có dấu ngoặc đơn chưa đặt trong ngoặc kép; hệ thống thêm ngoặc kép rồi vẽ lại sạch sẽ.
7. Nó soát lại ảnh của mình theo danh sách dữ kiện, và kiểm sự cân bằng: cả bốn luồng ranh giới của L0 xuất hiện lại ở L1 — luồng "order" của Khách giờ đáp xuống 1.1, cặp luồng của Cổng thanh toán vào 1.2. Cân bằng.
8. Nó báo cáo: hai file `.svg`, 2 bên ngoài / 3 tiến trình / 2 kho, biên dịch OK.

Chị Trang mở `order-dfd-l1.svg` trong trình duyệt. Câu trả lời cho bên tuân thủ giờ hiện ra bằng mắt thường: dữ liệu khách vào ở 1.1, nằm nghỉ trong D2 Customers, cấp cho bước nhận đơn, và **không bao giờ chảy sang cổng thanh toán** — chỉ có yêu cầu thanh toán chảy sang thôi. Chị dán L0 vào slide trình bày cho lãnh đạo và L1 vào buổi làm việc với auditor. Một tháng sau nghiệp vụ thêm hoàn tiền; chị chạy lại `/dfd --feature order`, hệ thống vào chế độ cập nhật, thêm tiến trình 1.4 cùng các luồng "refund request" vào cả hai mức, và cho chị xem phần khác biệt trước khi ghi đè.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (ký hiệu D2, bộ màu pastel, công thức L0/L1, các trường hợp đặc biệt), đọc file gốc: `.claude/skills/dfd/SKILL.md`.

Các lệnh vẽ sơ đồ khác trong cùng bộ công cụ:

- `explain-skills/d2-architect.vi.md` — góc nhìn **cấu trúc** (các khối, lồng nhau, kết nối). Đi cặp với `/dfd`: C4 cho thấy các khối là gì, DFD cho thấy dữ liệu gì chuyển giữa chúng.
- `explain-skills/sequence.vi.md` — góc nhìn **thời gian** (ai gọi ai, theo thứ tự nào). Chân thứ ba của chiếc kiềng ở mục 6.
- `explain-skills/erd-family.vi.md` — dữ liệu **lúc nằm nghỉ, ở mức chi tiết** (thực thể, thuộc tính, quan hệ). Mở ra các kho mà `/dfd` chỉ gọi tên.
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
