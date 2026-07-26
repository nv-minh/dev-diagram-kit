---
type: skill-explainer
skill: gallery
updated: 2026-07-26
---

# `/gallery` là gì và nó chạy như thế nào?

[English](gallery.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

Sau vài tuần làm BA cho một tính năng, sơ đồ của nó nằm rải rác khắp nơi: hình kiến trúc là file `.svg` trong thư mục này, mô hình dữ liệu ở thư mục kia, sơ đồ tuần tự và trạng thái thì sống dưới dạng mã Mermaid bên trong các tài liệu `.md`. Với bạn thế là ổn — nhưng giờ bạn cần cho một **stakeholder xem tất cả, mà người đó không có VS Code, không có quyền vào repo, và không đủ kiên nhẫn cho kiểu "mở thư mục này, rồi file kia."**

`/gallery` giải bài toán bàn giao đó. Nó gom **mọi sơ đồ của một tính năng vào một file HTML tự chứa duy nhất**: mỗi loại sơ đồ một tab, nền tối, kèm thanh công cụ xuất với các nút **Copy / PNG / PDF** trên từng tab. File mở bằng cú nhấp đúp — không cần server, không cần mạng để hiện hình, không cần cài gì. Bạn gửi một file qua chat hay email, và người nhận có trọn bộ hình của tính năng.

Một điều cần nói rõ ngay từ đầu: **`/gallery` không phải là một loại sơ đồ.** Nó không vẽ gì mới. Nó chỉ đóng gói những gì các lệnh khác đã vẽ — hãy hình dung nó như **đóng những trang rời thành một cuốn sổ**, chứ không viết thêm trang nào.

Bạn gõ:

```
/gallery --feature payment
```

và nhận được `docs/payment/payment-gallery.html`. Thêm `--out some/path.html` nếu muốn đặt file ở chỗ khác.

**Một câu để nhớ:** `/gallery` biến một thư mục sơ đồ thành **một file gửi được qua chat** — để trao trọn bộ hình của một tính năng cho những người sẽ không bao giờ mở repo của bạn.

---

## 2. Toàn bộ luồng chạy — sơ đồ

```
 BẠN GÕ LỆNH
 /gallery --feature payment
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Kiểm tra tên tính năng                       │
 │  --feature là BẮT BUỘC ở đây — không đoán. Bộ deck    │
 │  gói theo đúng từng tính năng; đoán sai nghĩa là gói  │
 │  nhầm hình vào một file đưa cho stakeholder.          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Quét tìm sơ đồ                               │
 │  Rà qua docs/{feature}/ (cộng thư mục dùng chung      │
 │  docs/_shared/) để tìm hai loại nguyên liệu:          │
 │   • ảnh .svg có sẵn (D2 / PlantUML / BPMN)            │
 │   • các khối mã Mermaid bên trong tài liệu .md        │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Xem trước rồi mới dựng (xin phép)            │
 │  Nói cho bạn bằng lời: tìm thấy bao nhiêu sơ đồ, sẽ   │
 │  thành những tab nào, khối Mermaid nào được vẽ hay    │
 │  bị bỏ qua. Bạn gật (Y) rồi nó mới dựng.              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Dựng bằng script chuyên dụng                 │
 │  Một script (gallery-build.ts) lắp ráp file HTML:     │
 │  nhúng thẳng từng .svg vào file, vẽ các khối Mermaid  │
 │  thành hình (khi máy có công cụ mmdc), rồi ráp khung  │
 │  tab + thanh công cụ xuất. HTML không bao giờ được    │
 │  viết tay.                                            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Kiểm tra lại kết quả                         │
 │  Xác nhận file tồn tại và số liệu tổng kết của        │
 │  script khớp (N sơ đồ trong M tab).                   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Báo hoàn tất                                 │
 │  File nằm ở đâu, mỗi tab bao nhiêu sơ đồ, khối        │
 │  Mermaid nào đã vào deck. Mở file trong trình duyệt   │
 │  hay không là quyền của bạn.                          │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — nhấp đúp file HTML, chuyển tab, xuất qua ⋯
```

---

## 3. Bộ deck trông thế nào, và tab được chia ra sao

Mở file lên, bạn thấy một trang nền tối với **dãy tab chạy ngang trên đầu — mỗi loại sơ đồ một tab**: Architecture, Data flow, Data model, Process (BPMN), Use cases, Code flow, SRS diagrams. Một sơ đồ rơi vào tab nào là do **nó được tìm thấy trong thư mục nào** — các lệnh vẽ của bộ công cụ vốn đã lưu mỗi loại vào thư mục riêng, nên việc phân nhóm có sẵn không tốn công. Sơ đồ nằm trong thư mục mà script không nhận ra sẽ rơi vào tab "Other"; nếu thấy vướng, chuyển hoặc đổi tên thư mục về một loại đã biết rồi dựng lại.

Mỗi tab có thanh công cụ xuất (nút `⋯`) với ba thao tác cho sơ đồ đang xem:

- **Copy** — đưa hình vào clipboard, sẵn sàng dán vào tin nhắn chat hay slide.
- **PNG** — tải hình đang xem về thành file ảnh.
- **PDF** — xuất ra PDF, tiện khi người nhận muốn in hay lưu trữ.

Thanh công cụ này không được viết mới riêng cho `/gallery` — nó chính là **thanh công cụ của `/system-design`** (lệnh vẽ kiến trúc nhiều tầng), được dùng lại nguyên vẹn. Một thanh công cụ, hai skill: sửa hay cải tiến ở một chỗ thì phải đồng bộ sang chỗ kia, và đó chính là lý do skill cấm tự ý sửa phần mã xuất một cách riêng lẻ.

---

## 4. Vì sao HTML phải do script dựng — và vì sao là một file tự chứa

**Vì sao dùng script, không viết HTML tay?** Vì bộ deck phải *tái lập được*. Bạn sẽ dựng lại nó mỗi lần thêm hay sửa một sơ đồ, và mỗi lần dựng phải cho kết quả đáng tin như nhau — cùng bộ tab, cùng cách nhúng, cùng thanh công cụ. Tự tay lắp một file HTML lớn đúng là loại việc mà một sơ suất nhỏ (một ký tự chưa thoát trong SVG được nhúng) âm thầm làm hỏng cả file. Nên quy tắc cứng của skill là: **chạy script dựng, không bao giờ viết HTML tay.** Việc dựng có tính lặp lại an toàn — chạy lại chỉ đơn giản ghi đè bộ deck cũ, biến "thêm sơ đồ, dựng lại, gửi lại" thành nhịp làm việc tự nhiên.

Một chốt chặn tinh tế đáng biết: khi quét, script cố tình **bỏ qua mọi bộ deck đã dựng trước đó** (`*-gallery.html` và các file sinh tự động tương tự). Không có chốt này, lần dựng sau sẽ nhúng bộ deck *cũ* vào bộ deck *mới* như thể nó là một sơ đồ — một file nuốt chính phiên bản trước của mình và phình gấp đôi sau mỗi lần dựng.

**Vì sao phải tự chứa?** Toàn bộ ý nghĩa nằm ở trải nghiệm của người nhận. Stakeholder nhận đúng một file; nó phải chạy trên máy họ mà không cần chuẩn bị gì — không server để khởi động, không tải hình qua mạng, không lỗi thiếu file vì một thư mục không đi kèm. Đó là lý do mọi SVG được nhúng *vào trong* HTML thay vì liên kết ra ngoài. Đánh đổi rất sòng phẳng: tính năng có nhiều sơ đồ lớn thì file HTML sẽ lớn. Với một file bàn giao, điều đó là bình thường và chấp nhận được.

---

## 5. Vì sao không có vòng "sửa ngay trong chat" — và những gì có thể thiếu

**Không lặp sửa trong chat.** Bạn duyệt bộ deck bằng cách mở nó trong trình duyệt — tab và thanh công cụ thật nằm ở đó, khung chat không thể hiện ra được. Và còn một lý do sâu hơn: `/gallery` không bao giờ sửa sơ đồ. Nếu một hình trong deck bị sai, deck không phải là chỗ để sửa — bạn sửa sơ đồ *gốc* bằng chính lệnh vẽ của nó (`/sequence`, `/dfd`, `/erd`...), rồi chạy lại `/gallery`. Bộ deck là tấm gương phản chiếu các nguồn; lau gương không làm đẹp được khuôn mặt.

**Những gì có thể thiếu — các khối Mermaid.** Sơ đồ `.svg` có sẵn luôn được đưa vào. Nhưng sơ đồ lưu dạng *mã* Mermaid trong tài liệu (sequence, state, ERD, mindmap, journey...) phải được vẽ thành hình trước đã, và việc đó cần một công cụ phụ (`mmdc`, trình vẽ Mermaid dòng lệnh, cùng một Chrome cho nó dùng). Nếu máy chưa cài, các khối đó bị **bỏ qua kèm cảnh báo** thay vì làm hỏng cả lần dựng — bạn vẫn nhận bộ deck hợp lệ, chỉ thiếu nội dung của các tab dựa trên Mermaid. Cài `@mermaid-js/mermaid-cli` rồi dựng lại là đủ.

**Chưa có sơ đồ nào?** Script dừng với thông báo "No diagrams found" — bộ deck không có gì để đóng. Vẽ trước đã (hoặc hỏi `/diagram` xem nên vẽ bằng lệnh nào), rồi quay lại.

---

## 6. Ví dụ thực tế

Anh **Minh**, một dev kiêm việc BA cho tính năng "onboarding", có buổi sprint review vào thứ Sáu. Hai tuần qua anh đã vẽ một sơ đồ kiến trúc (`/d2-architect`), một sơ đồ luồng dữ liệu (`/dfd`), một ERD, và hai luồng tuần tự nằm trong tài liệu các luồng của tính năng. Người xem: một product owner và hai trưởng nhóm vận hành — không ai trong số họ sẽ clone repo.

Anh Minh gõ:

```
/gallery --feature onboarding
```

1. Hệ thống xác nhận tính năng tồn tại, rồi quét `docs/onboarding/` và thư mục dùng chung: tìm thấy 3 file `.svg` và 3 khối Mermaid trong các tài liệu.

2. Nó xem trước: *"7 sơ đồ vào 4 tab (Architecture, Data flow, Data model, SRS diagrams); 3 khối Mermaid sẽ được vẽ. Dựng chứ?"* Anh Minh gõ `Y`.

3. Script dựng `docs/onboarding/onboarding-gallery.html`, nhúng từng SVG và vẽ các khối Mermaid thành hình.

4. Báo cáo xác nhận: 7 sơ đồ trong 4 tab, mọi khối Mermaid đều vẽ được. Anh Minh nhấp đúp file — deck nền tối, tab trên đầu, mọi thứ hiện đủ mà không cần mạng.

Anh thả đúng một file vào kênh review. Trong buổi họp, chị product owner tự chuyển qua lại các tab trên laptop của mình; khi cần hình luồng dữ liệu "cho bộ slide báo cáo," chị tự bấm `⋯ → PNG` và kéo vào slide. Không ai phải hỏi anh Minh cách mở thứ gì.

Sprint sau, onboarding thêm một bước thanh toán và một luồng tuần tự thay đổi. Anh Minh sửa sơ đồ *gốc* bằng `/sequence`, rồi chạy lại `/gallery --feature onboarding` — bộ deck được dựng đè tại chỗ, và anh gửi lại vẫn đúng một file đó.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (script dựng, cách ánh xạ tab, quy tắc dùng lại thanh công cụ), đọc file gốc: `.claude/skills/gallery/SKILL.md`.

Đọc thêm:

- `explain-skills/diagram.vi.md` — chưa chắc lệnh vẽ nào tạo ra sơ đồ bạn còn thiếu? Router sẽ chọn giúp.
- `explain-skills/sequence.vi.md` — một trong các lệnh vẽ mà thành quả sẽ vào bộ deck này.
- `/system-design` (file gốc: `.claude/skills/system-design/SKILL.md`) — lệnh vẽ kiến trúc mà bộ deck này mượn thanh công cụ xuất.
