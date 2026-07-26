---
type: skill-explainer
skill: sync-confluence
updated: 2026-07-26
---

# `/sync-confluence` là gì và nó chạy như thế nào?

[English](sync-confluence.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

Dev nào kiêm việc BA cũng biết nỗi khổ này: code đã đi tiếp, còn trang Confluence mô tả nó thì lặng lẽ trở thành lời nói dối. Một endpoint được thêm, một trường trạng thái bị đổi tên, một quy tắc nghiệp vụ được chốt trong luồng chat — mà trang đặc tả vẫn mô tả thế giới của tháng trước. Chẳng ai cập nhật, vì cập nhật nghĩa là đọc lại cả trang rồi sửa tay trên Confluence.

`/sync-confluence` làm việc cập nhật đó thay bạn. Nó lấy **những gì thực sự đã thay đổi** — hoặc một **thay đổi trong code** (git diff), hoặc một **quyết định vừa chốt trong cuộc hội thoại** — tìm ra **phần nào của trang Confluence đang lệch**, rồi sửa **đúng phần đó tại chỗ**, giữ nguyên phần còn lại của trang. Hãy hình dung nó như **một người soát bản in cẩn thận cầm bút đỏ**: sửa đúng đoạn đã lỗi thời, chứ không gõ lại cả cuốn sách.

Hai chế độ, chọn theo cách bạn gọi lệnh:

- **Chế độ code** — bạn truyền một khoảng git: hệ thống đọc diff và chỉ lọc ra những thay đổi mà tài liệu quan tâm (hình dạng API/endpoint, tên và kiểu trường, trạng thái, quy tắc nghiệp vụ, cấu hình mặc định, bước trong luồng). Refactor thuần túy, format, hay thay đổi chỉ trong test đều được bỏ qua.
- **Chế độ hội thoại** — không có khoảng git: hệ thống lấy quyết định hay đặc tả bạn vừa bàn trong chat làm nguồn.

Bạn gõ:

```
/sync-confluence confluence:<page-url> --from HEAD~5..HEAD   # chế độ code
/sync-confluence confluence:<page-url>                       # chế độ hội thoại
/sync-confluence confluence:<page-url> --preview             # chạy thử: chỉ xem diff, không ghi gì
```

**Một câu để nhớ:** `/sync-confluence` giữ cho trang Confluence **khớp với sự thật mới nhất** — từ code hay từ hội thoại — bằng cách chỉ sửa phần đã lỗi thời, và **không bao giờ ghi mà chưa cho bạn xem trước**.

---

## 2. Cần chuẩn bị gì trước khi nó chạy được

Skill nói chuyện với Confluence qua **kết nối Atlassian MCP** — kết nối đó phải được xác thực trước (`/mcp` → chọn Atlassian), và tài khoản của bạn cần quyền **đọc + ghi** trên trang đích. Nếu thiếu kết nối, skill **dừng ngay và in hướng dẫn xác thực** — không bao giờ cố chạy tiếp hay ghi "được phần nào hay phần đó". Đây là chủ đích: quyền truy cập nửa vời vào một hệ thống bên ngoài còn nguy hiểm hơn là không có.

---

## 3. Toàn bộ luồng chạy — sơ đồ

```
 BẠN GÕ LỆNH
 /sync-confluence confluence:<url> [--from <range>] [--preview]
        │  (chưa xác thực Atlassian MCP → dừng, hướng dẫn /mcp)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Định vị trang                                │
 │  Đọc mã trang từ url và xác định trang thuộc site     │
 │  Atlassian nào — xác định động, không bao giờ ghi     │
 │  cứng. Có nhiều site → hỏi bạn chọn.                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Tải trang về, hai lần                        │
 │  Dạng chữ thường (để phân tích nội dung) và dạng      │
 │  HTML (để giữ cấu trúc — macro, bảng, panel). Không   │
 │  tìm thấy / không có quyền → báo rõ rồi dừng.         │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Thu thập "cái gì đã đổi"                     │
 │  Chế độ code: đọc git diff, chỉ giữ những thay đổi    │
 │  liên quan tới tài liệu. Chế độ hội thoại: rút ra     │
 │  quyết định/đặc tả đã chốt trong chat. Không bao giờ  │
 │  bịa ra logic không có nguồn.                         │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Ánh xạ thay đổi vào các mục của trang        │
 │  Khớp từng thay đổi với một mục theo tiêu đề ("API",  │
 │  "Data model", "Business rules"...). Không có mục     │
 │  nào khớp → đề xuất THÊM mục mới và hỏi bạn đặt ở     │
 │  đâu — không bao giờ nhét bừa.                        │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Soạn bản sửa tại chỗ + kiểm tra xung đột     │
 │  Chỉ viết lại các mục bị ảnh hưởng, giữ nguyên macro  │
 │  và bảng. Đồng thời so trang với trạng thái ở lần     │
 │  đồng bộ trước — có ai đó đã sửa trong lúc bạn vắng   │
 │  mặt → đính kèm cảnh báo.                             │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 6 — XEM TRƯỚC + CỔNG DUYỆT (bắt buộc, không có   │
 │          đường vòng)                                  │
 │  Hiện từng mục "trước → sau" bằng ngôn ngữ nghiệp     │
 │  vụ, kèm nguồn (các commit / hội thoại) và cảnh báo   │
 │  xung đột nếu có. Bạn trả lời Y / sửa / hủy.          │
 │  Có --preview → DỪNG hẳn tại đây.                     │
 └──────────────────────────────────────────────────────┘
        │  (bạn trả lời Y)
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 7 — Ghi, để lại dấu vết, báo cáo                 │
 │  Cập nhật trang (phiên bản mới, kèm thông điệp nói    │
 │  rõ đồng bộ cái gì từ đâu), tùy chọn để lại bình      │
 │  luận cuối trang làm dấu, ghi trạng thái mới của      │
 │  trang vào file sync-state cục bộ — rồi báo cáo:      │
 │  mục nào đã đổi, phiên bản mới, chỗ cần người xem lại.│
 └──────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — trang khớp với code/quyết định mới nhất
```

---

## 4. Vì sao bước xem trước là bắt buộc — và hoàn toàn không có auto-approve?

Hầu hết thao tác ghi trong bộ công cụ này đều qua một cổng xem trước, nhưng ở đây cổng là tuyệt đối: **không tồn tại cờ nào để bỏ qua nó, không bao giờ.** Lý do nằm ở nơi bản ghi đáp xuống.

Mọi thứ khác mà bộ công cụ ghi ra đều nằm trong repo của bạn — được git bảo vệ, nên sai sót nào cũng chỉ cách một lệnh `git checkout` là hoàn tác được. Trang Confluence thì khác: nó nằm trên **máy chủ bên ngoài, và các sửa đổi ở đó về thực chất là không thể đảo ngược**. Đúng là Confluence có lưu phiên bản trang, nhưng khôi phục một phiên bản là thao tác thủ công, vụng về — và nếu bản sửa lỗi của bạn đã đè lên thay đổi mới của đồng nghiệp, không cú khôi phục nào gỡ rối gọn gàng được. Ghi ra hệ thống bên ngoài giống như gửi một email: bạn có thể xin lỗi, nhưng không thể thu hồi.

Nên thỏa thuận là cố định: hệ thống luôn cho bạn xem **từng mục "trước → sau"**, bằng ngôn ngữ nghiệp vụ, nêu rõ nguồn của từng thay đổi (những commit nào, hay quyết định nào trong hội thoại) — và chỉ ghi sau khi bạn gõ `Y` rõ ràng. Muốn xem mà không có chút rủi ro nào? `--preview` chạy trọn phần phân tích rồi dừng hẳn ngay trước cổng.

---

## 5. Vì sao sửa tại chỗ — và vì sao nó từ chối "cải thiện" phần còn lại của trang

Có một đường tắt nghe hấp dẫn: sinh lại cả trang từ đầu. Skill cấm hẳn điều này, vì hai lý do.

**Thứ nhất, trang chứa những thứ bạn không thấy được ở dạng chữ thường.** Trang Confluence mang các **macro** — những khối đặc biệt như nhãn trạng thái, mục lục tự động, thẻ Jira nhúng — cộng thêm các bảng và panel được dựng tay. Viết lại cả trang sẽ san phẳng tất cả thành đoạn văn trơn; trang khi đó vừa "cập nhật" vừa hỏng. Sửa tại chỗ chỉ chạm vào mục đã thay đổi và giữ mọi thứ khác nguyên vẹn từng byte.

**Thứ hai, skill không được phép bịa.** Nó chỉ viết những gì truy được về một nguồn thật — một dòng diff có thật, một câu có thật trong hội thoại. Mục nào thay đổi không chạm tới thì được để yên *kể cả khi trông có vẻ đáng cải thiện*, vì "cải thiện" nghĩa là tự chế nội dung chưa ai quyết. Kỷ luật này áp cả cho sơ đồ nhúng trong trang: nếu logic đổi, skill gợi ý vẽ lại bằng đúng lệnh vẽ sơ đồ, chứ không đoán mò ra một hình mới. Thêm một ranh giới nữa: đồng bộ chỉ **một chiều** — skill đọc code và hội thoại của bạn; nó không bao giờ sửa code cho khớp với trang.

---

## 6. Cảnh báo xung đột — nó bảo vệ bạn khỏi điều gì

Giữa lần đồng bộ trước và hôm nay, một đồng nghiệp có thể đã sửa tay chính trang đó. Nếu hệ thống cứ nhắm mắt ghi bản cập nhật, nó có thể đè lên công sức của họ mà không ai hay biết.

Để bắt được chuyện này, mỗi lần đồng bộ thành công đều ghi lại một **dấu vân tay của trang** (cùng một mốc đánh dấu lần đồng bộ đã đi tới commit nào) vào một file trạng thái cục bộ nhỏ. Lần chạy sau, Bước 5 so dấu vân tay hiện tại của trang với bản đã ghi. Lệch nhau nghĩa là **"trang này đã bị thay đổi ngoài bộ công cụ kể từ lần đồng bộ trước"** — và màn xem trước khi đó mang theo một cảnh báo rõ ràng, để bạn xem đồng nghiệp đã đổi gì rồi mới quyết định đi tiếp, điều chỉnh, hay hủy. Đó chính là phản xạ "có ai sửa tài liệu này trong lúc mình vắng mặt không?" trước khi dán đè lên — chỉ khác là hệ thống không bao giờ quên kiểm tra.

---

## 7. Ví dụ thực tế

Anh **Huy**, dev backend phụ trách dịch vụ hoàn tiền, vừa merge ba commit: một endpoint hoàn tiền một phần mới, và trường trạng thái `refund_state` đổi tên thành `status`. Trang Confluence "Refund Spec" của team — đội support đọc hằng ngày — vẫn mô tả thế giới cũ.

Anh Huy gõ:

```
/sync-confluence confluence:https://acme.atlassian.net/wiki/spaces/PAY/pages/123456/Refund-Spec --from HEAD~3..HEAD
```

1. Hệ thống tìm thấy trang và tải về cả hai dạng. Đọc diff, nó giữ lại hai thay đổi liên quan tới tài liệu (endpoint mới, đổi tên trường), loại bỏ một cập nhật lockfile cùng ít refactor trong test, rồi ánh xạ các thay đổi vào hai mục theo tiêu đề: **"API"** (thêm endpoint hoàn tiền một phần) và **"Statuses"** (đổi tên trường, cập nhật bảng giá trị).

2. Kiểm tra xung đột phát tín hiệu: trang đã đổi kể từ lần đồng bộ trước của anh Huy. Màn xem trước chỉ rõ vì sao — tuần trước một PM sửa lỗi chính tả ở phần mở đầu. Khác mục, không giẫm lên nhau: an toàn, nhưng giờ anh Huy *biết rõ*.

3. Màn xem trước liệt kê cả hai mục "trước → sau" bằng lời dễ hiểu, nêu tên ba commit nguồn, rồi hỏi: *Apply changes to Confluence?* Anh Huy đọc diff của bảng "Statuses", xác nhận ánh xạ giá trị đúng, và gõ `Y`.

4. Trang lên phiên bản 12, kèm thông điệp phiên bản ghi rõ đã đồng bộ từ các commit đó; một bình luận nhỏ cuối trang đánh dấu lần đồng bộ, và file trạng thái cục bộ ghi lại dấu vân tay mới. Báo cáo liệt kê hai mục đã đổi và gắn cờ một chỗ cần người xem lại: một sơ đồ luồng nhúng trong trang có thể đã lỗi thời — anh Huy vẽ lại bằng lệnh vẽ sơ đồ rồi đồng bộ thêm một lần.

Hai tuần sau, team chốt trong một luồng chat: hoàn tiền có thêm thời gian ân hạn 48 giờ. Chưa có dòng code nào — nên anh Huy chạy lệnh **không kèm** `--from`, và chế độ hội thoại nhặt lấy quyết định đó. Trang chưa có mục "Grace period", nên hệ thống đề xuất thêm mục mới và hỏi đặt ở đâu; anh Huy nói "sau mục Statuses," duyệt màn xem trước, xong.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (cách tải trang, ánh xạ mục, file sync-state, các trường hợp đặc biệt), đọc file gốc: `.claude/skills/sync-confluence/SKILL.md`.

Đọc thêm:

- `.claude/rules/approval-gate.md` — quy tắc chung "xem trước rồi mới ghi" mà skill này siết thành "không có đường vòng."
- `.claude/rules/atlassian-sync.md` — các quy ước chung khi làm việc với Atlassian.
- `explain-skills/gallery.vi.md` — skill bàn giao còn lại: nó đóng gói sơ đồ thành một file, còn skill này giữ cho một trang tài liệu sống luôn đúng sự thật.
