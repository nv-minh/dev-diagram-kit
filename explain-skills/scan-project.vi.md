---
type: skill-explainer
skill: scan-project
updated: 2026-07-26
---

# `/scan-project` là gì và nó chạy như thế nào?

[English](scan-project.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

`/scan-project` nhận một **codebase có sẵn** — một dự án đã được xây từ trước, có khi từ nhiều năm, có khi bởi những người đã rời đi — và **dịch ngược ra một bộ sơ đồ kiến trúc đầy đủ từ chính mã nguồn**. Bạn không phải mô tả gì cả; hệ thống đọc code và vẽ ra những gì nó tìm thấy.

Hãy hình dung nó giống như **thuê một người đo đạc cho căn nhà không còn bản vẽ**: căn nhà tồn tại, người ta vẫn ở trong đó, nhưng chẳng ai còn giữ bản thiết kế. Người đo đạc đi hết từng tầng, đo từng phòng, lần theo đường ống, rồi giao lại cho bạn một tập bản vẽ — mặt bằng, sơ đồ ống nước, sơ đồ điện — mỗi bản kèm ghi chú *mức độ chắc chắn* ("bức tường này tôi tự tay đo" so với "ống này chắc là chạy hướng đó, tôi không mở trần ra được"). Tập bản vẽ ấy chính là thứ `/scan-project` tạo ra, cho phần mềm: kiểu dự án được thừa kế mà không còn bản vẽ này, trong nghề gọi là codebase **brownfield**.

Vài tình huống điển hình nên dùng `/scan-project`:

- Bạn **vừa gia nhập hoặc vừa được giao một dự án** gần như không có tài liệu, và cần hiểu hình hài của nó trước khi đụng vào bất cứ thứ gì.
- Bạn là **dev kiêm vai BA** trên một hệ thống cũ, và các bên liên quan cứ hỏi "hệ thống này rốt cuộc gồm những gì?" — câu hỏi mà code trả lời được nhưng không tài liệu nào trả lời.
- Tài liệu có tồn tại nhưng **lạc hậu nhiều năm**, và bạn muốn những bức hình vẽ từ những gì code nói *hôm nay*, không phải những gì ai đó viết ngày xưa.

Gõ lệnh đơn giản như:

```
/scan-project
```

để quét dự án ở thư mục hiện tại, hoặc trỏ tới nơi khác và thu hẹp phạm vi:

```
/scan-project ~/work/legacy-shop            # quét dự án ở một đường dẫn
/scan-project --focus src/billing           # codebase lớn: chỉ quét sâu một khu vực
/scan-project --module billing              # chỉ vẽ (lại) chi tiết một module
```

**Một câu để nhớ:** `/scan-project` **đọc code** của một dự án có sẵn và vẽ ra **cả bộ sơ đồ kiến trúc** từ đó — mỗi phần tử đều được dán nhãn mức độ chắc chắn và xuất xứ trong code — để bạn thừa kế một hệ thống có tài liệu thay vì một câu đố.

---

## 2. Toàn bộ luồng chạy — sơ đồ

Luồng chạy có **hai giai đoạn với một điểm dừng hẳn ở giữa**: đầu tiên hệ thống quét và đưa bạn xem *một kế hoạch* về những gì nó tìm thấy và đề xuất vẽ; chỉ sau khi bạn duyệt nó mới vẽ bất cứ thứ gì. (Vì sao có điểm dừng đó — xem Mục 5.)

```
 BẠN GÕ LỆNH
 /scan-project [đường dẫn] [--focus <thư mục>]
        │
        ▼
 ═════ GIAI ĐOẠN 1 — QUÉT VÀ LẬP KẾ HOẠCH ═════
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Nhận diện đây là dự án kiểu gì               │
 │  Đọc các file khai báo (package.json, go.mod,         │
 │  pom.xml…) → ngôn ngữ, framework, các điểm vào.       │
 │  Framework không rõ → hỏi bạn xác nhận stack thay vì  │
 │  đoán bừa.                                            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Cử các "trinh sát" đi đọc code               │
 │  Vài trợ lý quét song song, mỗi trợ lý một khía       │
 │  cạnh: các module & ranh giới · phụ thuộc giữa các    │
 │  module (phụ thuộc vòng bị gắn cờ) · lược đồ dữ       │
 │  liệu · 2-3 luồng quan trọng nhất từ các điểm vào ·   │
 │  các hệ bên ngoài (DB, hàng đợi, thanh toán,          │
 │  email…). Trinh sát CHỈ ĐỌC: họ báo cáo phát hiện     │
 │  kèm bằng chứng file, không bao giờ ghi hay vẽ gì.    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Đối chiếu với tài liệu, nếu có               │
 │  README / docs / các bản ghi quyết định được so với   │
 │  những gì code nói. Khi mâu thuẫn, CODE thắng —       │
 │  nhưng bản thân mâu thuẫn được ghi lại cho bạn.       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Viết kế hoạch quét, rồi DỪNG HẲN             │
 │  Một file scan-plan: các module tìm thấy, các sơ đồ   │
 │  đề xuất (danh sách tick để bạn cắt bớt), và danh     │
 │  sách các chỗ chưa chắc (🟡). Hệ thống in tóm tắt và  │
 │  hỏi: "Vẽ bộ này chứ? (Y / bỏ một sơ đồ / sửa)" —     │
 │  rồi CHỜ. Không vẽ gì trước khi bạn trả lời.          │
 └──────────────────────────────────────────────────────┘
        │
        ▼   (bạn trả lời Y, hoặc cắt bớt danh sách)
 ═════ GIAI ĐOẠN 2 — VẼ ═════
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Vẽ từng sơ đồ đã chọn                        │
 │  Tổng quan C4, bản đồ module, chi tiết module, ERD,   │
 │  các luồng chính — mỗi loại vẽ theo đúng công thức    │
 │  của lệnh anh em tương ứng (/system-design, /d2-erd,  │
 │  /sequence…), từ các phát hiện đã quét.               │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Kết xuất và kiểm từng sơ đồ                  │
 │  Mỗi sơ đồ được biên dịch ra ảnh thật; lỗi → tự sửa   │
 │  rồi thử lại (vài lần mỗi sơ đồ). Không giao thứ gì   │
 │  bị hỏng.                                             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Viết mục lục (và bộ sưu tập tùy chọn)        │
 │  Một file mục lục: từng sơ đồ, các file nguồn của nó  │
 │  trong code, và mức độ chắc chắn. Tùy chọn thêm một   │
 │  trang HTML gallery (nền tối, xuất PNG/PDF) nhúng     │
 │  toàn bộ sơ đồ.                                       │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 8 — Báo cáo, kèm những gì cần bạn kiểm lại       │
 │  Liệt kê các file, và — quan trọng — các mục 🟡 mà    │
 │  hệ thống không xác nhận được từ code và muốn bạn     │
 │  kiểm chứng.                                          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — mở mục lục (hoặc gallery) để duyệt cả bộ
```

---

## 3. Bên trong bộ sơ đồ có gì?

Một lần quét tạo ra tối đa **sáu sản phẩm**, tất cả nằm trong một thư mục dùng chung (`docs/_shared/architecture/` — kiến trúc thuộc về cả dự án, không bao giờ thuộc về một tính năng):

1. **Tổng quan C4** — hai mức phóng to: bức *context* (hệ thống là một khối, người dùng của nó, các dịch vụ bên ngoài) và bức *container* (các app/dịch vụ/kho dữ liệu bên trong). Cùng quy ước với `/system-design` — xem bài giải thích đó để hiểu ý nghĩa các tầng.
2. **Bản đồ module** — các module của dự án và các đường phụ thuộc giữa chúng. **Phụ thuộc vòng bị gắn cờ**, không bị giấu — module A cần B mà B lại cần ngược A là một trong những thứ giá trị nhất một lần quét có thể phơi ra, vì đọc từng file một thì không bao giờ thấy.
3. **Chi tiết module** — mở nắp một module: các thành phần chính và dây nối bên trong. Vẽ cho module bạn nêu tên (`--module`) hoặc các module lớn nhất.
4. **ERD** — bức tranh dữ liệu: các bảng và quan hệ giữa chúng, đọc từ schema/migration/entity của ORM. Dự án không có schema → sơ đồ này được bỏ kèm ghi chú, không bao giờ bịa ra.
5. **Các luồng chính** — 2-3 sơ đồ tuần tự của những hành trình quan trọng nhất (đường đi request chính, một job chạy nền, một webhook), lần theo từ các điểm vào thật trong code.
6. **Mục lục** — bảng tra cứu: từng sơ đồ, dữ kiện lấy từ đâu, chắc chắn tới mức nào. Tùy chọn thêm **HTML gallery** — một trang nền tối nhúng toàn bộ sơ đồ kèm xuất PNG/PDF, cùng phong cách với bộ trình chiếu của `/system-design`.

Để ý rằng đây chính là các *loại* sơ đồ mà bộ công cụ vốn đã vẽ từng cái một — và đó là chủ ý: `/scan-project` dùng lại đúng công thức của `/system-design`, `/d2-architect`, `/d2-erd`, `/sequence` thay vì tự chế một kiểu riêng. Một sơ đồ quét ra và một sơ đồ vẽ tay đứng cạnh nhau trong tài liệu của bạn vẫn đồng bộ. Một điểm cộng nhỏ: vì lần quét *biết* các công nghệ nó tìm thấy (Postgres, Redis, Kafka…), các nút đó được gắn logo công nghệ tự động — liếc qua bức container là thấy ngay cả stack.

---

## 4. Các nhãn mức độ chắc chắn: ✅ đọc được · 🔵 suy ra · 🟡 đoán

Đây là phần khiến một sơ đồ quét ra đáng tin, nên nó xứng đáng có một mục riêng.

Khi một con người dịch ngược một codebase, họ âm thầm trộn ba loại hiểu biết: những thứ họ *đọc trực tiếp* ("có bảng `payments` — tôi thấy file migration"), những thứ họ *suy ra* ("dịch vụ này nói chuyện với Redis — thư viện client được import và cấu hình"), và những thứ họ *đoán* ("hàng đợi này chắc dành cho sự kiện đơn hàng — cái tên gợi ý vậy"). Một sơ đồ trình bày cả ba bằng cùng một nét mực tự tin là nguy hiểm: người đọc không phân biệt được bức tường đã đo với đường ống chỉ là giả định.

Vì vậy mọi phần tử trong bộ đều mang hai nhãn:

- **Mức độ chắc chắn** — ✅ *đọc được chắc chắn* (thấy trực tiếp trong code) · 🔵 *suy ra* (kết luận từ bằng chứng mạnh) · 🟡 *đoán* (hợp lý nhưng chưa xác nhận — "cần bạn kiểm chứng").
- **Xuất xứ (provenance)** — *dữ kiện lấy từ file hay đường dẫn nào*, để mọi khẳng định đều kiểm lại được tại nguồn trong vài giây.

Đằng sau là một quy tắc cứng: **hệ thống không bịa.** Nếu một luồng hay một quan hệ thực sự không đọc ra được từ code, nó bị đánh dấu 🟡 và đưa vào danh sách "xin xác nhận" trong báo cáo cuối — chứ không được gán một cái tên tự chế với nét mực tự tin. Bản thân danh sách 🟡 cũng hữu ích thật sự: nó là một chương trình nghị sự làm sẵn cho buổi nói chuyện tiếp theo của bạn với người còn nhớ lịch sử hệ thống.

---

## 5. Vì sao có điểm dừng hẳn giữa quét và vẽ?

Vì giữa "code chứa gì" và "cái gì đáng vẽ" có một phán đoán mà **chỉ bạn mới đưa ra được**.

Lần quét có thể tìm thấy chín module, trong đó ba cái là code chết không ai đụng tới nhiều năm. Nó có thể đề xuất một ERD từ một schema đang giữa chừng chuyển đổi. Nó có thể đặt tên một module là `misc` vì thư mục chẳng cho nó cái tên nào tốt hơn. Nếu hệ thống cắm đầu vẽ luôn cả bộ, bạn sẽ nhận những sơ đồ bóng bẩy về những thứ lẽ ra không nên vẽ — mà sản phẩm bóng bẩy lại có kiểu trông đáng tin hơn mức nó xứng đáng.

Vì vậy Giai đoạn 1 kết thúc bằng việc viết một **kế hoạch quét** — danh sách module kèm vai trò và mức chắc chắn, danh sách tick các sơ đồ đề xuất, và các câu hỏi còn mở — rồi **dừng hẳn** và chờ. Bạn có thể bỏ một sơ đồ ("bỏ ERD đi, schema đó đang bị thay"), sửa tên một module, hay trả lời một câu 🟡 trước khi bất kỳ bức hình nào tồn tại. Chỉ sau chữ Y của bạn Giai đoạn 2 mới vẽ, và chỉ vẽ những gì sống sót qua danh sách tick.

Một lựa chọn thiết kế nữa thuộc về mục này: các trinh sát đọc code (Bước 2 của luồng chạy) **chỉ-đọc theo thiết kế**. Họ trả phát hiện về; luồng chính làm toàn bộ việc ghi, và chỉ sau khi bạn duyệt ở điểm dừng. Đó chính là giao ước "xem trước rồi mới ghi" mà mọi lệnh trong bộ công cụ này tuân thủ — lần quét chỉ áp dụng nó ở quy mô lớn hơn.

---

## 6. Nó sống sót qua một codebase khổng lồ bằng cách nào?

Đọc *mọi* file của một dự án lớn vừa chậm vừa gần như vô ích — hình hài của một kiến trúc nằm trong một phần nhỏ số file. Nên lần quét được thiết kế để **lấy mẫu thông minh thay vì đọc cạn kiệt**:

- Nó **ưu tiên các file nhiều tín hiệu**: file khai báo (dự án này là gì?), các điểm vào (request đi vào từ đâu?), schema/migration (có những dữ liệu gì?), và đồ thị import (ai phụ thuộc ai?). Thư mục lớn được lấy mẫu, không đọc từng file.
- Với codebase thật sự lớn, bạn tự thu hẹp bằng **`--focus <thư mục>`** — quét sâu một khu vực, để phần còn lại nông. Trong **monorepo**, mỗi package/service tự nhiên trở thành một "container" trong bức tổng quan, và bạn có thể `--focus` từng service ở các lần chạy riêng.
- Các trinh sát chạy như **các trợ lý riêng biệt**, mỗi trợ lý đọc khía cạnh của mình và chỉ trả về *phát hiện* — các bảng dữ kiện kèm bằng chứng file — chứ không phải nội dung file thô. Luồng chính tổng hợp phát hiện; nó không bao giờ tự chìm trong mã nguồn.

Sự đánh đổi thẳng thắn: lấy mẫu nghĩa là lượt đầu có thể bỏ sót — và đó chính xác là lý do tồn tại của các nhãn chắc chắn (Mục 4) và điểm dừng hẳn (Mục 5). Một góc bị sót hiện lên thành một dấu 🟡 hoặc một lỗ hổng bạn nhận ra trong kế hoạch quét, bạn chỉ ra, và một lần chạy lại với `--focus` lấp vào. Hệ thống được thiết kế để *thiếu nhưng sửa được*, thay vì *sai nhưng tự tin*.

---

## 7. Chạy lại, và nó khác các lệnh anh em thế nào

**Chạy lại chính là cách bình thường để giữ bộ sơ đồ sống.** Lệnh này chạy lại không sinh bản trùng: một dự án = một bộ file. Chạy `/scan-project` lần nữa sau vài tháng phát triển và nó vào **chế độ cập nhật** — quét lại, diff từng sơ đồ với bản đang có, cho bạn xem cái gì đổi (một module mới, một phụ thuộc biến mất, ba bảng mới), và chỉ ghi đè sau chữ Y của bạn. Tài liệu kiến trúc của bạn có thể bám theo code thay vì mục nát như tài liệu viết tay. Muốn làm tươi có chủ đích, `--module <tên>` vẽ lại đúng chi tiết một module.

Hai lệnh anh em dễ nhầm với lệnh này; đây là ranh giới:

| | `/system-design` | `/scan-project` | `/code-flow` |
|---|---|---|---|
| Nguồn sự thật | **bạn** — mô tả, tài liệu, phỏng vấn | **code** — không phỏng vấn nghiệp vụ | **code** — một mục tiêu |
| Phạm vi | thiết kế một hệ thống, vẽ từ trên xuống | **cả codebase**, trọn bộ sơ đồ | hành vi của **một hàm/module** |
| Hợp nhất cho | dự án mới / làm thiết kế trước | thừa kế hoặc lập tài liệu một dự án brownfield | "hàm *này* thực ra chạy thế nào?" |

Thực tế chúng nối tiếp nhau: `/scan-project` cho bạn tấm bản đồ của một hệ thống thừa kế; khi một luồng trên bản đồ đó cần kính hiển vi, `/code-flow <mục tiêu>` lần theo đúng một hàm với xuất xứ tới từng dòng; và khi bạn *thiết kế một thay đổi* cho hệ thống, `/system-design` vẽ bức tranh tương-lai từ mô tả của bạn. Scan đọc cái *đang là*, system-design vẽ cái *sẽ là*.

---

## 8. Ví dụ thực tế

Anh **Tuấn** vừa được giao một hệ thống đặt hàng NestJS bốn năm tuổi. Hai dev từng xây nó đã nghỉ; README vẫn mô tả phiên bản một; còn quản lý muốn có bức tranh kiến trúc trước thứ Sáu. Đọc code từng file một sẽ ngốn của anh hàng tuần.

Anh Tuấn mở terminal ở gốc dự án, gõ:

```
/scan-project
```

1. Hệ thống đọc `package.json` và bố cục mã nguồn: NestJS trên TypeScript, một schema Postgres trong `prisma/`, điểm vào ở `src/main.ts` và vài consumer hàng đợi.

2. Các trinh sát tỏa ra: một người lập bản đồ module (`orders`, `payments`, `inventory`, `notifications`, `shared`…), một người lần các import xuyên module — và gắn cờ chuyện `orders` với `inventory` **import lẫn nhau**, một phụ thuộc vòng — một người đọc schema Prisma (14 bảng), một người lần luồng checkout và một webhook thanh toán từ điểm vào của chúng, một người gom các hệ bên ngoài (Postgres, Redis, một SDK Momo, cấu hình SMTP).

3. README cũ khẳng định có một "reporting service" — trinh sát không tìm thấy dấu vết nào trong code. Mâu thuẫn được ghi lại: code thắng, README đã lạc hậu.

4. Hệ thống viết kế hoạch quét rồi dừng: *"Phát hiện 6 module, 4 hệ bên ngoài, 14 bảng. Em đề xuất: tổng quan C4 · bản đồ module (1 vòng ⚠️) · ERD (14 bảng) · sequence «checkout», «payment webhook» · chi tiết module «orders». Chưa chắc (🟡): mục đích của job `legacy-sync` — cái tên gợi ý đồng bộ với một hệ cũ, code không xác nhận gì. Vẽ bộ này chứ?"* Anh Tuấn tạm bỏ chi tiết module ("cứ tổng quan trước đã") rồi trả lời Y.

5-6. Giai đoạn 2 vẽ từng sơ đồ đã chọn theo công thức của gia đình và biên dịch tất cả; ERD cần một lần tự sửa (nhãn bảng có ký tự đặc biệt), rồi mọi thứ đều pass.

7. Mục lục được viết — mỗi sơ đồ kèm xuất xứ ("modules: từ cấu trúc `src/*`; ERD: từ `prisma/schema.prisma`") — cộng thêm HTML gallery. Bức container hiện Postgres, Redis và Momo với logo của chúng: cả stack lộ ra trong một cái liếc mắt.

8. Báo cáo liệt kê các file và nhắc lại dấu 🟡: *"Xin xác nhận `legacy-sync` làm gì."* Anh Tuấn hỏi quản lý của team cũ, biết rằng nó đồng bộ đơn hàng sang một hệ thống kho sắp bị khai tử, và ghi chú vào mục lục.

Thứ Sáu, anh Tuấn trình bày gallery. Phụ thuộc vòng giữa `orders` và `inventory` — thứ không ai trong phòng biết — trở thành đầu việc chính của buổi họp. Ba tháng sau, khi team đã tách `inventory` cho tử tế, anh Tuấn chạy lại `/scan-project`: chế độ cập nhật diff bản đồ module, cho thấy mũi tên vòng đã biến mất, và sau chữ Y của anh cả bộ lại đúng với hiện tại — không mục nát, không file `-v2` nào.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (khung file scan-plan, prompt cho các trợ lý quét, công thức từng loại sơ đồ, các bẫy thường gặp), đọc file gốc: `.claude/skills/scan-project/SKILL.md`.

Các lệnh liên quan trong cùng bộ công cụ:

- `explain-skills/system-design.vi.md` — vẽ thiết kế hệ thống **từ mô tả/phỏng vấn của bạn** (chiều greenfield). `/scan-project` là tấm gương brownfield của nó: cùng các loại sơ đồ, nhưng code là nguồn sự thật và không có phỏng vấn nghiệp vụ.
- `/code-flow` — người anh em **một-mục-tiêu**: lần theo một hàm/module trong code có sẵn thành một sơ đồ luồng với xuất xứ `file:line`. Scan cho tấm bản đồ, code-flow cho kính hiển vi. File gốc: `.claude/skills/code-flow/SKILL.md`.
- `explain-skills/d2-erd.vi.md` và `explain-skills/sequence.vi.md` — phiên bản độc lập của sơ đồ ERD và sơ đồ tuần tự mà lần quét tạo ra trong bộ của nó.
- Quy tắc chọn loại sơ đồ đầy đủ nằm ở file gốc: `.claude/rules/diagram-selection.md`.
