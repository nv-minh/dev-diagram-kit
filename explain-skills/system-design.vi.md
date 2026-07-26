---
type: skill-explainer
skill: system-design
updated: 2026-07-26
---

# `/system-design` là gì và nó chạy như thế nào?

[English](system-design.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/system-design` vẽ **thiết kế hệ thống dưới dạng một câu chuyện nhiều tầng**, theo một quy ước nổi tiếng gọi là **mô hình C4**. Thay vì một bức hình lớn cố nói hết mọi thứ cùng lúc, nó tạo ra **một bộ hình nhỏ, mỗi hình phóng to hơn hình trước một nấc** — rồi đóng gói tất cả vào một file trình chiếu duy nhất để bạn đưa cho các bên liên quan xem.

Hãy hình dung nó giống như **dùng bản đồ trực tuyến**: đầu tiên bạn nhìn ở mức quốc gia (**L1 System Context** — hệ thống của bạn là một khối duy nhất, cộng với ai dùng nó và nó gọi những dịch vụ bên ngoài nào), rồi phóng to xuống mức thành phố (**L2 Container** — mở nắp ra, thấy các ứng dụng, dịch vụ, kho dữ liệu bên trong, và khối nào nói chuyện với khối nào), và — chỉ khi có người thật sự hỏi — mức đường phố (**L3 Component** — bên trong một khối có những mảnh chức năng gì). Mỗi tầng trả lời **đúng một câu hỏi**, nên người đọc có thể dừng ở độ cao nào vừa đủ với họ.

Vài tình huống điển hình nên dùng `/system-design`:

- Bạn cần **trình bày kiến trúc cho các bên liên quan** — buổi kickoff, họp điều hành, review kiến trúc — nơi một bức hình ở một độ cao là không đủ: người nghiệp vụ muốn xem mức quốc gia, dev muốn xem mức thành phố.
- Một tính năng **đủ lớn để "ai dùng nó" và "bên trong có gì" xứng đáng là hai bức hình riêng**, thay vì nhồi cả hai vào một sơ đồ chật chội.
- Bạn muốn một **sản phẩm sẵn sàng trình chiếu**: không chỉ là các file ảnh, mà một trang HTML chỉn chu với đủ các tầng xếp chồng, nền tối, và nút xuất PNG/PDF để đưa vào slide.

Gõ lệnh đơn giản như:

```
/system-design --feature payment
```

hoặc mô tả cả hệ thống, không gắn với một tính năng cụ thể:

```
/system-design "hệ thống đặt hàng online: web/mobile, API, cơ sở dữ liệu, gọi Momo để thanh toán và một dịch vụ email"
```

Về sau, bạn có thể phóng to thêm hoặc thêm góc nhìn runtime:

```
/system-design --feature payment --component "Payment API"     # thêm mức "đường phố" L3 của một khối
/system-design --feature payment --dynamic "khách thanh toán qua Momo"  # đường đi của một yêu cầu, đánh số
```

**Một câu để nhớ:** `/system-design` kể **câu chuyện của hệ thống bằng cách phóng to dần từng tầng** (Context → Container → Component tùy chọn), và giao cho bạn cả các hình riêng lẻ lẫn **một file trình chiếu** sẵn sàng để chiếu — dùng khi một bức hình nhanh là không đủ.

---

## 2. Toàn bộ luồng chạy — sơ đồ

Khác các lệnh dùng Mermaid, hình ở đây được vẽ bằng công cụ D2, **kết xuất ra file ảnh thật** (`.svg`) ngay tại chỗ — nên cuối buổi bạn mở file `.svg` hoặc file `.html` là thấy hình hoàn chỉnh, không cần công cụ đọc đặc biệt. Hệ thống vẫn tự kiểm từng tầng trước khi báo xong.

```
 BẠN GÕ LỆNH
 /system-design --feature X | "<mô tả hệ thống>"
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Xác định thiết kế này nằm ở đâu              │
 │  Thuộc một tính năng → thư mục của tính năng đó.      │
 │  Mô tả CẢ hệ thống → thư mục dùng chung               │
 │  (docs/_shared/system-design/). Tính năng chưa có →   │
 │  tự đặt tên rồi tạo mới. Mơ hồ → hỏi bạn thay vì      │
 │  đoán bừa.                                            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Thu thập dữ kiện, đúng độ cao                │
 │  Đọc tài liệu sẵn có trước (tổng quan hệ thống, đặc   │
 │  tả và các luồng của tính năng). Không có gì để đọc   │
 │  → phỏng vấn bạn, nhưng CHỈ ở độ cao C4: hệ thống     │
 │  làm gì, ai dùng, gọi dịch vụ bên ngoài nào, bên      │
 │  trong có những app/kho dữ liệu nào. KHÔNG hỏi về     │
 │  port, server, cấu hình mạng — và KHÔNG tự bịa luồng  │
 │  hay hệ thống bên ngoài.                              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Phân loại dữ kiện vào từng tầng              │
 │  L1: người dùng + hệ thống của bạn + hệ bên ngoài.    │
 │  L2: các khối bên trong + kho dữ liệu + ai gọi ai.    │
 │  L3 (chỉ khi được yêu cầu): các mảnh trong một khối.  │
 │  Kỷ luật: dữ kiện nào về đúng tầng nấy — không nhồi   │
 │  chi tiết mức thành phố vào bức hình mức quốc gia.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Xem trước rồi mới ghi (xin phép)             │
 │  Mô tả kế hoạch bằng lời thường: vẽ những tầng nào,   │
 │  bao nhiêu khối, hệ bên ngoài nào, luồng chính ra     │
 │  sao. Không đổ code. Bạn gật (Y) mới ghi.             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Vẽ từng tầng và kết xuất ra ảnh thật         │
 │  Viết mã nguồn cho từng tầng (không tự căn tọa độ —   │
 │  máy sắp xếp các ô tự động), kết xuất từng tầng ra    │
 │  .svg. Tầng nào biên dịch lỗi → tự sửa, thử lại       │
 │  (vài lần mỗi tầng).                                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Tự nhìn lại hình của mình trước khi đưa bạn  │
 │  Kết xuất một ảnh kiểm tra cho mỗi tầng rồi tự soi:   │
 │  ô có đè lên nhau không? đường có cắt nhau rối        │
 │  không? nhãn có sai không? có tầng nào lộ chi tiết    │
 │  của tầng khác không? Thấy gì thì sửa, rồi kết xuất   │
 │  lại.                                                 │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Dựng file trình chiếu HTML một-file          │
 │  Lấy khuôn mẫu có sẵn, nhúng file .svg thật của từng  │
 │  tầng đã vẽ, điền tiêu đề, các thẻ tóm tắt, chân      │
 │  trang. Tầng nào không vẽ thì gỡ hẳn khỏi bộ trình    │
 │  chiếu, không để lỗ trống.                            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 8 — Cập nhật mục lục và báo cáo                  │
 │  Một file mục lục nhỏ liệt kê từng tầng, file của     │
 │  nó, ngày cập nhật. Báo cáo chỉ bạn mở file .html     │
 │  (trình chiếu/xuất ảnh) hoặc từng file .svg.          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở file .html trong trình duyệt để trình
     chiếu, hoặc các file .svg để xem từng tầng
```

---

## 3. Ba tầng phóng to — mỗi tầng đúng một câu hỏi

Trái tim của mô hình C4 là một quy tắc đơn giản: **mỗi tầng trả lời đúng một câu hỏi, và không gì khác.**

- **L1 System Context — "hệ thống này đứng ở đâu trong thế giới xung quanh?"** Hệ thống của bạn là một khối duy nhất. Xung quanh: những người dùng nó (vai trò như Khách, Nhân viên — không bao giờ là cá nhân cụ thể) và các hệ thống bên ngoài mà nó gọi (cổng thanh toán, dịch vụ email — mỗi cái ghi tên thật kèm một cụm từ nói rõ dùng để làm gì, vẽ viền nét đứt để nhìn một cái là biết "không phải của mình"). Không nói gì về bên trong.
- **L2 Container — "hệ thống được ghép từ những khối chạy được nào?"** Giờ mới mở nắp: app web/mobile, dịch vụ API, worker chạy nền, các cơ sở dữ liệu và hàng đợi — cộng các đường gọi giữa chúng và ra các hệ bên ngoài. "Container" ở đây chỉ có nghĩa "một thứ chạy được hoặc lưu dữ liệu", không phải một công nghệ cụ thể nào.
- **L3 Component — "bên trong một khối có gì?"** Chỉ vẽ khi được yêu cầu (`--component <tên>`), cho đúng khối mà có người thật sự cần mở ra — ví dụ các mảnh chức năng bên trong dịch vụ API.
- **L4 Code** — cố tình **nằm ngoài phạm vi**. Đó là lãnh địa của dev và kiến trúc sư, không phải bức hình để thống nhất cách hiểu chung.

Vì sao kỷ luật này quan trọng: khoảnh khắc bạn nhồi các container vào bức hình L1 "cho đỡ tốn một sơ đồ", người đọc nghiệp vụ sẽ chìm trong những khối họ không quan tâm, và bức hình không còn trả lời gọn được *bất kỳ* câu hỏi nào. Giữ mỗi tầng một câu hỏi chính là điều cho phép một giám đốc đọc L1 trong mười giây, và một dev đọc L2 trong một phút — **mỗi đối tượng dừng ở đúng độ cao của mình**. Nếu dữ kiện có nguy cơ phá vỡ quy tắc (ví dụ ô lồng nhau quá ba lớp), hệ thống sẽ tách bớt ra thay vì để một bức hình gánh quá nhiều.

---

## 4. Vì sao có một file trình chiếu HTML một-file?

Các file `.svg` riêng lẻ rất hợp để dán vào tài liệu — nhưng một buổi họp cần thứ khác: **một thứ duy nhất mở lên được, cuộn từ trên xuống, và xuất ảnh được từ đó.** File `.html` chính là thứ đó.

Nó là **một file duy nhất** dựng từ khuôn mẫu có sẵn: nền tối (dễ nhìn trên máy chiếu), mọi tầng đã vẽ xếp theo thứ tự phóng to kèm tiêu đề, ba thẻ tóm tắt trên đầu (ai dùng + hệ bên ngoài / các container chính / dữ liệu + luồng chính), và một thanh công cụ xuất — **Copy-PNG để dán thẳng vào chat hay slide, hoặc tải PNG/PDF**. Bạn gửi đúng một file này cho bên liên quan, họ không cần cài gì để xem.

Hai điều đáng biết về cách nó được dựng, vì chúng giải thích những hành vi bạn có thể để ý thấy:

- **Hình bên trong là chính file `.svg` thật của từng tầng, nhúng nguyên trạng** — hệ thống không bao giờ "vẽ tay" bộ trình chiếu. Điều này bảo đảm bộ trình chiếu luôn khớp với các file ảnh rời: sửa một tầng, dựng lại bộ trình chiếu, hai bên không thể lệch nhau.
- **Bộ trình chiếu tải hai đoạn script nhỏ từ internet để chạy tính năng xuất PNG/PDF**, mỗi đoạn được ghim bằng một dấu vân tay toàn vẹn. Hệ thống cố tình không bao giờ sửa hai dòng đó — nếu dấu vân tay không khớp, trình duyệt sẽ từ chối tải script và các nút xuất sẽ chết lặng lẽ. Nên nếu có lúc bạn tự tay sửa file trình chiếu, hãy để yên hai dòng ấy.

---

## 5. Khi nào nên chọn lệnh này thay vì `/d2-architect`?

`/d2-architect` là người anh em gần trong cùng gia đình — cũng vẽ tổng quan hệ thống, cùng công cụ vẽ, cùng bộ kết xuất. Khác biệt không nằm ở chất lượng mà ở **hình dạng của sản phẩm giao ra**:

| | `/d2-architect` | `/system-design` |
|---|---|---|
| Số bức hình | **1** — một bức hình bối cảnh | **2–3** — Context / Container / Component tùy chọn |
| Cách vẽ | tự do (khối lồng khối, một khung hình) | **C4 chuẩn** — phóng to có kỷ luật, mỗi tầng một câu hỏi |
| Sản phẩm | `.d2` + `.svg` | `.d2`/`.svg` theo từng tầng **+ file trình chiếu HTML** (xuất PNG/PDF) |
| Hợp nhất khi | cần **một bức hình nhanh** để thả vào tài liệu | cần **kể chuyện hệ thống ở nhiều tầng** cho bên liên quan/slide |

Một quy tắc thực dụng: **hình sẽ sống trong tài liệu → dùng `/d2-architect`; hình sẽ được trình chiếu trong buổi họp → dùng `/system-design`.** Ngoài ra: một tính năng nhỏ với ba khối không cần phân tầng C4 — một bức hình `/d2-architect` là nói đủ. Một hệ thống với cả tá bộ phận chuyển động và người xem lẫn lộn nghiệp vụ-kỹ thuật thì cần.

---

## 6. Những gì nó cố tình KHÔNG vẽ — và góc nhìn runtime tùy chọn

**Không vẽ chi tiết hạ tầng triển khai.** Không port, không số lượng server, không load balancer, không phân vùng mạng, không container image. Những thứ đó thuộc *sơ đồ triển khai (deployment)*, là việc của kiến trúc sư ở giai đoạn sau. Lệnh này vẽ kiến trúc ở mức **logic** — có những khối nào, khối nào gọi khối nào, dữ liệu chính chảy về đâu — chính xác là độ cao mà một dev-làm-BA cần để thống nhất cách hiểu với các bên. Nếu bạn yêu cầu chi tiết hạ tầng, hệ thống sẽ nói rõ điều này thay vì vẽ (và cũng sẽ không phỏng vấn bạn về chúng — xem Bước 2).

**Góc nhìn runtime (`--dynamic`) là phần thêm tùy chọn, mỗi lần một luồng.** Bức hình L2 tĩnh cho thấy *cấu trúc* — có những khối nào, những đường nối nào — nhưng không cho thấy *thứ tự*. `--dynamic "<luồng>"` thêm một bức hình nữa: vẫn các khối container ấy, nhưng các cạnh của **hành trình một yêu cầu được đánh số 1, 2, 3…** để bạn lần theo được, chẳng hạn, một lượt thanh toán đi từ app qua API tới cổng thanh toán rồi quay về. Mỗi bức hình dynamic một luồng; luồng thứ hai nghĩa là chạy `--dynamic` lần nữa.

Phần này cố ý trùng vai với `/sequence`, nên hãy chọn theo thứ bạn cần thấy: **cần luồng vẽ đè lên cấu trúc container** → `--dynamic`; **chỉ cần ai-gọi-ai theo thứ tự nào, kèm nhánh lỗi** → `/sequence` là công cụ tốt hơn (nhánh rẽ là sở trường của nó; góc nhìn dynamic chỉ vẽ một đường đi thuận lợi).

---

## 7. File nằm ở đâu, và chuyện gì xảy ra khi chạy lại

Mọi thứ nằm gọn trong một thư mục: `docs/{feature}/system-design/` cho thiết kế thuộc một tính năng, hoặc `docs/_shared/system-design/` khi bạn mô tả cả hệ thống (kiến trúc xuyên nhiều tính năng không bao giờ bị nhét vào thư mục của một tính năng). Bên trong là một bộ file dễ đoán: mỗi tầng một cặp `.d2` + `.svg`, file `.html` trình chiếu, và một file mục lục nhỏ liệt kê từng tầng kèm file và ngày cập nhật.

Lệnh này **chạy lại không sinh bản trùng**: một hệ thống = một bộ file, mãi mãi. Chạy `/system-design --feature payment` lần nữa **không** tạo ra `payment-v2` — hệ thống đọc mã nguồn cũ, tự xác định cái gì đổi, cho bạn xem **diff trước/sau của những tầng bị ảnh hưởng**, và chỉ sau chữ Y của bạn mới kết xuất lại các tầng đó và dựng lại bộ trình chiếu. Nhờ vậy bạn có thể chạy lại thoải mái: thêm một dịch vụ bên ngoài? thêm một worker? cứ gọi lại lệnh và nói vậy. Hình và bộ trình chiếu luôn khớp nhau, vì bộ trình chiếu luôn được dựng lại từ ảnh vừa kết xuất (xem Mục 4).

---

## 8. Ví dụ thực tế

Anh **Minh** là dev kiêm vai BA cho một sản phẩm đặt hàng online. Thứ Ba tới anh có buổi thống nhất kiến trúc: product owner, hai dev backend, và một quản lý sẽ hỏi "rốt cuộc chúng ta đang xây cái gì và nó phụ thuộc vào gì?". Một bức hình không phục vụ nổi cả hai nhóm — anh cần câu chuyện phân tầng.

Anh Minh mở terminal, gõ:

```
/system-design "hệ thống đặt hàng online: app web và mobile, API đặt hàng, cơ sở dữ liệu đơn hàng, worker chạy nền, gọi Momo để thanh toán và SendGrid để gửi email" --feature ordering
```

1. Hệ thống xác định đích: tính năng `ordering` chưa tồn tại, nên nó tự suy ra slug và sẽ tạo mới khi ghi — anh Minh không phải chuẩn bị gì trước.

2. Chưa có tài liệu tổng quan hệ thống, nên hệ thống phỏng vấn anh Minh — nhưng chỉ ở độ cao C4: "Ngoài khách hàng còn ai dùng hệ thống? Có vai trò nhân viên/quản trị không?" Anh Minh bổ sung: "có, nhân viên xác nhận đơn qua một màn hình quản trị." Không một câu hỏi nào về server hay port.

3. Hệ thống phân loại dữ kiện: L1 nhận 2 vai trò người dùng, khối hệ thống, và 2 hệ bên ngoài; L2 nhận 5 container (web/mobile, màn hình quản trị, API đặt hàng, DB đơn hàng, worker) cùng các đường gọi giữa chúng và ra Momo/SendGrid.

4. Nó xem trước bằng lời thường: *"Em sẽ vẽ thiết kế hệ thống đặt hàng theo C4: L1 Context + L2 Container. Người dùng (2): Khách, Nhân viên. Bên ngoài (2): Momo, SendGrid. Container (5): … Luồng chính: Khách → API → Momo → Worker → SendGrid. Apply?"* Anh Minh gõ `Y`.

5. Từng tầng được viết và kết xuất ra `.svg`. Tầng container biên dịch lỗi một lần — một nhãn có dấu `/` cần đặt trong ngoặc kép — hệ thống tự sửa rồi kết xuất lại.

6. Hệ thống tự soi ảnh vừa vẽ: ở L2 có hai đường cắt nhau rối gần chỗ worker, nó sắp lại mã nguồn rồi kết xuất lại — lần này gọn gàng.

7. Nó dựng `ordering-system-design.html` từ khuôn mẫu: nhúng cả hai file SVG, điền các thẻ tóm tắt, gỡ phần L3 vì chưa vẽ tầng component nào.

8. Báo cáo về: file nằm ở `docs/ordering/system-design/`, mở file `.html` để trình chiếu. Anh Minh mở trong trình duyệt, cuộn qua hai tầng, bấm **Copy PNG** ở bức L1 rồi dán vào thư mời họp. Trong buổi họp, anh quản lý có câu trả lời từ L1 trong mười giây; các dev tranh luận trên L2 — đúng kiểu phân vai mà các tầng được thiết kế để phục vụ.

Một tuần sau, team thêm một Redis cache đứng trước DB đơn hàng. Anh Minh chạy lại `/system-design --feature ordering`, nói rõ thay đổi — hệ thống diff tầng container, cho anh xem trước/sau, và sau chữ `Y` mới kết xuất lại L2 và dựng lại bộ trình chiếu. Vẫn một bộ file, không có bản `-v2` nào. Về sau khi một dev hỏi "bên trong API đặt hàng thực ra có gì?", anh Minh chạy `--component "Ordering API"` và bức hình mức đường phố L3 nhập vào cùng bộ trình chiếu.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (công thức mã nguồn D2 từng tầng, bảng màu, quy tắc khuôn mẫu HTML, các bẫy thường gặp), đọc file gốc: `.claude/skills/system-design/SKILL.md`.

Các lệnh liên quan trong cùng bộ công cụ:

- `explain-skills/d2-architect.vi.md` — **bức hình bối cảnh nhanh, một hình duy nhất** trong cùng gia đình. Quy tắc thực dụng: hình cho tài liệu → `/d2-architect`; câu chuyện phân tầng cho buổi họp → `/system-design`.
- `explain-skills/scan-project.vi.md` — vẽ bộ sơ đồ kiến trúc **bằng cách đọc codebase có sẵn** thay vì phỏng vấn bạn. Dự án mới / thiết kế từ mô tả → `/system-design`; code đã tồn tại (brownfield) → `/scan-project`.
- `explain-skills/sequence.vi.md` — khi bạn chỉ cần **ai gọi ai theo thứ tự nào, kèm nhánh lỗi**, không cần cấu trúc container bên dưới.
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
