---
type: skill-explainer
skill: diagram
updated: 2026-07-26
---

# `/diagram` là gì và nó chạy như thế nào?

[English](diagram.md) · **Tiếng Việt**

## 1. Dùng để làm gì, khi nào nên gõ lệnh này

Bộ công cụ này có hơn hai mươi lệnh vẽ sơ đồ — sequence, state, swimlane, ERD, mindmap, kiến trúc cloud với icon chính hãng AWS/Azure, và nhiều nữa. Phủ đủ mọi nhu cầu thì tốt, nhưng lại sinh ra một vấn đề rất thực tế: **bạn biết mình muốn thể hiện điều gì, nhưng không biết lệnh nào vẽ được điều đó.**

`/diagram` sinh ra để giải đúng bài toán này. Nó là một **bộ điều phối** (router): bạn mô tả nhu cầu bằng lời thường, nó tự tìm ra lệnh vẽ nào phù hợp, rồi **chạy lệnh đó giúp bạn**, mang theo cả phần mô tả của bạn. Bản thân nó không bao giờ tự vẽ — hãy hình dung nó như **cô lễ tân ở phòng khám**: nghe bạn kể triệu chứng rồi đưa bạn tới đúng bác sĩ chuyên khoa, chứ không tự tay chữa bệnh cho bạn.

Vài tình huống điển hình nên dùng `/diagram`:

- Bạn mới dùng bộ công cụ, chưa thuộc hết 20+ lệnh vẽ.
- Bạn nắm nội dung ("ai làm gì trong quy trình hoàn tiền") nhưng không rành từ vựng sơ đồ (đó là activity diagram? swimlane? hay BPMN?).
- Bạn cứ phân vân giữa hai lệnh na ná nhau (`/erd` hay `/dbdiagram`? `/activity` hay `/activity-swimlane`?) và muốn có người quyết giúp.

Gõ lệnh đơn giản như:

```
/diagram "show how the login + OAuth callback flow works"
```

Phần trong ngoặc kép là mô tả bằng lời thường về điều bạn muốn thể hiện. Nếu chỉ muốn nghe gợi ý chứ chưa muốn chạy gì, thêm `--recommend-only` — hệ thống nêu tên lệnh phù hợp rồi dừng lại, để bạn tự chạy.

**Một câu để nhớ:** `/diagram` là lệnh **"tôi cần loại sơ đồ nào?"** — mô tả nhu cầu, trả lời tối đa 2 câu hỏi ngắn, và lệnh vẽ đúng sẽ chạy với mô tả của bạn được chuyển tiếp vào.

---

## 2. Toàn bộ luồng chạy — sơ đồ

```
 BẠN GÕ LỆNH
 /diagram "mo ta dieu ban muon the hien"
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Đọc hiểu nhu cầu của bạn                     │
 │  Phân tích mô tả (hoặc lấy từ cuộc hội thoại). Ghi    │
 │  nhận những gì đáng chuyển tiếp: --feature, @file,    │
 │  đường dẫn mã nguồn hay tên hàm.                      │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Đối chiếu với bảng điều phối                  │
 │  So nhu cầu của bạn với bảng "muốn thể hiện X → dùng  │
 │  lệnh Y" (khoảng 20 dòng). Khớp đúng một dòng →       │
 │  KHÔNG hỏi gì, nhảy thẳng tới Bước 4.                 │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Vẫn phân vân giữa 2-3 ứng viên?              │
 │  Hỏi TỐI ĐA 2 câu ngắn, gộp chung một lượt (ví dụ    │
 │  "vẽ từ mô tả/đặc tả, hay từ code có sẵn?", "nhúng   │
 │  trong tài liệu, hay xuất ảnh rời?").                 │
 │  Bảng đã quyết được thì không bao giờ hỏi.            │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Thông báo, rồi bàn giao                      │
 │  In một dòng: "→ /<lệnh> <tham số> (vì <lý do một    │
 │  dòng>)" — rồi CHẠY lệnh đó, mang theo mô tả và các  │
 │  câu trả lời của bạn.                                 │
 │  Có --recommend-only → dừng ở đây.                    │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Lệnh được chọn tiếp quản                     │
 │  Từ đây bạn ở trong /sequence, /dfd, /erd... — với   │
 │  đầy đủ bước xem trước và tự kiểm của chính lệnh đó.  │
 │  Không có gì khớp (nhu cầu không phải là sơ đồ)? Nó   │
 │  nói rõ trong một dòng và gợi ý thứ gần nhất.         │
 └──────────────────────────────────────────────────────┘
        │
        ▼
     HOÀN TẤT — sơ đồ đúng được vẽ bởi đúng lệnh
```

---

## 3. Nó quyết định bằng cách nào? (bảng điều phối)

Bộ não của router là một bảng ánh xạ "điều bạn muốn thể hiện" sang đúng một lệnh. Vài dòng mẫu để bạn hình dung:

| Bạn mô tả... | Nó điều tới |
|---|---|
| ai gọi ai **theo thời gian** (đăng nhập, thanh toán, webhook, nhánh lỗi) | `/sequence` |
| ai làm bước nào trong một **quy trình nhiều phòng ban** | `/activity-swimlane` |
| các **trạng thái** một đơn hàng đi qua (chờ → đã trả → đã hủy) | `/state` |
| **dữ liệu chảy đi đâu**, kho nào lưu nó | `/dfd` |
| **mô hình dữ liệu** (các bảng và quan hệ) | `/erd`, `/d2-erd` hoặc `/dbdiagram` — một câu hỏi sẽ quyết |
| kiến trúc với **icon AWS/Azure/GCP thật** | nhóm lệnh `/drawio-*` |
| một **hàm trong code** thực sự chạy ra sao | `/code-flow` |
| kiến trúc của **cả repo**, đọc từ code | `/scan-project` |

Một điều đáng biết: bảng nằm trong skill chỉ là **bản rút gọn**. Ma trận quyết định đầy đủ — kèm lập luận "khi nào dùng / khi nào không" cho từng loại sơ đồ — nằm ở một file quy tắc, `rules/diagram-selection.md`, và file đó là **nguồn chuẩn** (source of truth). Nếu bản rút gọn và file quy tắc lệch nhau, file quy tắc thắng. Đặt ma trận thật trong file quy tắc (thay vì chôn trong router) nghĩa là con người đọc thẳng được, các skill khác trỏ tới được, và khi thêm/bớt một skill vẽ sơ đồ thì có đúng một nơi chuẩn để cập nhật.

---

## 4. Vì sao "tối đa 2 câu hỏi" — và đó là những câu nào

Một router tra khảo người dùng còn tệ hơn không có router: nếu trả lời năm câu hỏi lâu hơn tự đọc danh sách lệnh, sẽ chẳng ai dùng nó. Nên thiết kế cố tình dè sẻn câu hỏi:

- **Không hỏi gì là trường hợp bình thường.** Bảng quyết được trong một dòng → router chạy lệnh ngay — hỏi thêm chỉ gây phiền.
- **Tối đa 2 câu, gộp chung một lượt**, và chỉ khi nhu cầu thật sự nằm giữa 2-3 ứng viên.

Những câu nó được phép chọn:

1. **Sự thật lấy từ đâu — mô tả/đặc tả, hay code có sẵn?** Từ code và bạn chỉ vào một hàm → `/code-flow`; từ code nhưng bao trùm cả dự án → `/scan-project`; còn lại thì dùng skill vẽ thường theo chủ đề.
2. **Kết quả nên có hình hài gì — nhúng trong tài liệu, hay file rời?** Nhúng (hình hiện ngay trong file `.md` trên GitHub/Obsidian) → nhóm Mermaid; ảnh rời đẹp cho stakeholder → nhóm D2; file `.drawio` chỉnh sửa được để dev làm tiếp → nhóm draw.io. Trên thực tế đây là câu hỏi hữu ích nhất — đa số phân vân "chọn cái nào trong hai cái này?" đều quy về nó.
3. *(chỉ để phá thế hòa)* **Góc nhìn nào quan trọng — ai làm gì (control), dữ liệu chảy đi đâu (data), hay các khối lồng nhau ra sao (structure)?**

---

## 5. Vì sao nó không bao giờ tự vẽ?

Đây là quy tắc cứng của skill, và đáng để hiểu lý do.

Mỗi lệnh vẽ trong bộ công cụ đi kèm những bảo đảm riêng: xem trước rồi mới ghi, vẽ thử để bắt lỗi cú pháp, đối chiếu nội dung để chắc không sót ý nào trong mô tả của bạn (tài liệu giải thích `/sequence` đi qua từng bước này). Nếu router "nhiệt tình" tự phác nhanh một bản, mọi bảo đảm đó đều bị bỏ qua — bạn nhận một hình mà không bước nào kiểm chứng, theo phong cách chẳng khớp quy ước nào của bộ công cụ. Chẳng khác gì tự chế ra một loại sơ đồ thứ hai mươi mốt không chính thức.

Nên việc của router dừng lại ở: **chọn lệnh, chuyển ngữ cảnh của bạn vào, rồi tránh sang một bên.** Hệ quả thực tế cho bạn: kết quả y hệt nhau dù bạn gọi thẳng `/sequence` hay đi qua `/diagram` — router thêm tiện lợi, không bao giờ là đường tắt né chất lượng.

---

## 6. Ví dụ thực tế

Anh **Quân** là dev backend vừa được giao kiêm việc BA trong team. Anh cần vẽ sơ đồ cho tài liệu nhưng chưa từng dùng bộ công cụ này, và danh sách hơn hai mươi lệnh vẽ với anh chưa có ý nghĩa gì.

Nhu cầu đầu tiên — mô tả quy trình hoàn tiền. Anh gõ:

```
/diagram "who does what in the refund process, 3 departments, with an approval step"
```

Bảng quyết được trong một dòng (quy trình nhiều vai → swimlane). Router in ra `→ /activity-swimlane "refund process..." (because ≥2 roles/lanes)` rồi chạy lệnh đó — **không hỏi câu nào**. Anh Quân trả lời các câu hỏi của chính lệnh đó và nhận được swimlane của mình.

Một tuần sau — mô hình dữ liệu. Anh gõ:

```
/diagram "the data model for orders and refunds"
```

Lần này có ba lệnh đều hợp lý (`/erd`, `/d2-erd`, `/dbdiagram`), nên router hỏi đúng một câu quyết định: *"Nhúng trong tài liệu, xuất ảnh rời đẹp, hay bàn giao cho dev với kiểu cột thật / SQL?"* Anh Quân trả lời "bàn giao cho dev — họ sẽ cần kiểu dữ liệu thật," và router chạy `/dbdiagram` với mô tả của anh chuyển tiếp vào.

Có hôm anh thử `/diagram "write me the spec for refunds"` — đó hoàn toàn không phải sơ đồ. Router nói rõ trong một dòng và chỉ anh sang `/srs`, thay vì cố ép ra một cái hình ở chỗ đáng lẽ là văn bản.

---

## Xem thêm

Tài liệu này chỉ giải thích ý tưởng và luồng chạy ở mức dễ hiểu. Muốn xem đầy đủ chi tiết kỹ thuật (bảng điều phối đầy đủ, quy tắc bàn giao, các trường hợp đặc biệt), đọc file gốc: `.claude/skills/diagram/SKILL.md`.

Đọc thêm:

- `.claude/rules/diagram-selection.md` — ma trận quyết định đầy đủ (nguồn chuẩn) mà router phản chiếu.
- `explain-skills/sequence.vi.md` — một lệnh vẽ tiêu biểu mà router này bàn giao tới, kèm giải thích đầy đủ các bước tự kiểm.
- `explain-skills/gallery.vi.md` — khi đã vẽ được nhiều sơ đồ cho một tính năng, lệnh này gom tất cả vào một file bàn giao.
