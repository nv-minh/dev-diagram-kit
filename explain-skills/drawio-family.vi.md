---
type: skill-explainer
skill: drawio-family
updated: 2026-07-26
---

# Năm lệnh vẽ bằng draw.io — chọn lệnh nào?

[English](drawio-family.md) · **Tiếng Việt**

> Tài liệu này giải thích **năm lệnh `/drawio-*` liên quan với nhau thế nào**. Bốn lệnh vẽ **kiến trúc cloud với icon chính thức của từng hãng** — `/drawio-aws`, `/drawio-azure`, `/drawio-gcp`, `/drawio-databricks` — và lệnh thứ năm, `/drawio-sequence`, vẽ **sơ đồ tuần tự UML**. Cả năm đều cho ra cùng một loại sản phẩm: một **file `.drawio` sửa được**.

## 1. Vì sao đã có nhóm lệnh D2 / C4 rồi mà vẫn cần nhóm draw.io?

Bộ công cụ vốn đã có các lệnh vẽ kiến trúc: `/d2-architect` (hình bối cảnh một tầng, vẽ nhanh) và `/system-design` (bản vẽ C4 nhiều tầng). Cả hai đều vẽ bằng **ô hộp chung chung** — một database là một hình chữ nhật ghi chữ "Database", một hàng đợi là một hình chữ nhật ghi chữ "Queue". Với một bức tranh **logic** thì như vậy là chuẩn: người đọc tập trung vào vai trò và quan hệ, không bận tâm sau mỗi ô là sản phẩm của hãng nào.

Nhưng có những người nghe lại tư duy theo **sản phẩm của hãng**, chứ không theo vai trò logic. Trong một buổi review kiến trúc AWS, kỹ sư cloud không hỏi "thành phần lưu trữ của anh là gì?" — họ hỏi "đây là S3 hay EFS? Lambda có nằm trong private subnet không?" Với cuộc trao đổi đó, bạn cần một bức hình mà **mỗi dịch vụ mang đúng icon chính thức của nó**: biểu tượng Lambda màu cam, chiếc xô S3 màu xanh lá. Đội cloud nhận ra những hình đó chỉ trong một cái liếc mắt, nhanh hơn đọc bất kỳ nhãn chữ nào. Đó là lý do nhóm lệnh `/drawio-*` tồn tại — vẽ hình **đúng nhận diện thương hiệu cloud**.

Còn một khác biệt thứ hai, thiết thực không kém: **định dạng đầu ra**. Nhóm lệnh D2 đưa bạn một tấm ảnh đã hoàn thiện. Nhóm `/drawio-*` đưa bạn một file `.drawio` — một **sơ đồ "sống"** mà ai cũng mở được bằng ứng dụng draw.io miễn phí (hoặc bản web diagrams.net, hoặc extension draw.io của VS Code) rồi tiếp tục chỉnh tay: kéo một ô, thêm một ghi chú, dời một mũi tên. Nhờ vậy nó là sản phẩm bàn giao đúng khi kiến trúc sư hay khách hàng muốn **nhận lấy bức hình** và tự phát triển tiếp.

**Một câu để nhớ:** hình logic chung chung → nhóm lệnh D2; hình cần đúng dịch vụ cloud thật với icon chính thức, trong một file người khác sửa tay được → nhóm `/drawio-*`.

---

## 2. Bảng chọn nhanh

Nếu chỉ đọc một phần, hãy đọc bảng này:

```
 CÂU HỎI                                             → CHỌN LỆNH

 Hệ thống chạy trên AWS (S3, Lambda, VPC, RDS...)
 và hình phải hiện icon AWS chính thức?              → /drawio-aws

 Hệ thống chạy trên Microsoft Azure (AKS,
 Cosmos DB, Application Gateway, Key Vault...)?      → /drawio-azure

 Hệ thống chạy trên Google Cloud (GKE, Cloud SQL,
 BigQuery, Cloud Storage...)?                        → /drawio-gcp

 Bức tranh lakehouse / nền tảng dữ liệu Databricks
 (Delta Lake, SQL Warehouse, Unity Catalog...)?      → /drawio-databricks

 "Ai gọi ai, theo thứ tự nào" — và bạn cần một file
 sơ đồ ĐỘC LẬP, sửa tay được?                        → /drawio-sequence

 "Ai gọi ai" nhưng nhúng THẲNG vào tài liệu
 Markdown của tính năng (hiện trên GitHub)?          → /sequence  (Mermaid — có file giải thích riêng)

 Hình kiến trúc logic, không cần nhận diện
 thương hiệu hãng nào?                               → /d2-architect hoặc /system-design
```

Hai mẹo để nhớ: chọn **lệnh cloud theo nơi hệ thống thực sự chạy** (bên dưới chúng là cùng một công cụ, chỉ khác bộ icon), còn với sơ đồ tuần tự thì hỏi **"người ta sẽ đọc nó ở đâu?"** — nằm trong tài liệu → `/sequence` (Mermaid), là file độc lập để ai đó mở ra và sửa → `/drawio-sequence`.

---

## 3. Năm lệnh đặt cạnh nhau

| | `/drawio-aws` | `/drawio-azure` | `/drawio-gcp` | `/drawio-databricks` | `/drawio-sequence` |
|---|---|---|---|---|---|
| **Vẽ gì** | kiến trúc AWS | kiến trúc Azure | kiến trúc Google Cloud | lakehouse Databricks | tuần tự UML (lifeline + thông điệp theo thời gian) |
| **Icon** | AWS chính thức | Azure chính thức | GCP chính thức | Databricks chính thức | không — tiêu đề chữ thường (hình người que cho vai con người) |
| **Danh mục icon** | có sẵn trong bộ kit | tải một lần khi dùng lần đầu (~13MB) | tải một lần khi dùng lần đầu (~2MB) | có sẵn trong bộ kit (~400KB) | không cần |
| **Dịp dùng điển hình** | review AWS / trao đổi Well-Architected | review thiết kế Azure | review thiết kế GCP | kiến trúc nền tảng dữ liệu / ML | dẫn giải request-response với dev hoặc đối tác |

Cả bốn lệnh cloud đều nhận cùng một gợi ý bố cục (`--type pipeline | network | hierarchy | hubspoke | mesh | sequence`) mô tả **hình dáng của luồng** — pipeline trái-sang-phải, bố cục mạng VPC, trục giữa tỏa nan hoa... — để bộ máy dàn trang biết cách sắp xếp hình. Bạn hiếm khi cần ghi nó: mặc định `pipeline` hợp với đa số kiến trúc mức tính năng.

---

## 4. Luồng chạy — một quy trình chung

Cả năm lệnh chạy qua cùng những bước như nhau, với hai cơ chế an toàn nên biết trước: một **bước xin phép** (chưa ghi gì cho tới khi bạn đồng ý) và một **cổng kiểm định chặn cứng** (một sơ đồ lỗi sẽ không bao giờ được bàn giao).

```
 BẠN GÕ LỆNH
 /drawio-aws "serverless upload pipeline" --feature upload
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 1 — Hiểu kiến trúc                               │
 │  Đọc tài liệu sẵn có (tổng quan hệ thống, đặc tả      │
 │  tính năng). Không có gì để đọc → hỏi bạn: những      │
 │  dịch vụ nào, luồng chính là gì. KHÔNG tự bịa dịch vụ.│
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 2 — Xem trước, xin phép (bước xin phép)          │
 │  Kế hoạch bằng lời thường: "N dịch vụ, luồng này,     │
 │  bố cục này, file ra ở đây." Bạn gật (Y) → đi tiếp.   │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 3 — Tra từng icon trong danh mục stencil         │
 │  Một lượt tìm gộp ("s3, lambda, dynamodb...") trên    │
 │  danh mục chuẩn của hãng. Chỉ được dùng những tên     │
 │  danh mục trả về. (Bỏ qua với /drawio-sequence —      │
 │  lệnh này không dùng icon cloud.)                     │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 4 — Viết build-script {slug}.src.ts              │
 │  Một đoạn script nhỏ MÔ TẢ bức hình: icon nào, nhóm   │
 │  nào, mũi tên nào. Không có tọa độ — bộ máy dàn trang │
 │  tự tính mọi vị trí.                                  │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 5 — Build + kiểm định (CỔNG CHẶN CỨNG)           │
 │  Bộ máy kiểm: mọi stencil có tồn tại, không mũi tên   │
 │  lơ lửng, lồng nhau đúng thứ tự (vd VPC→AZ→Subnet),   │
 │  không đè chồng. CÓ lỗi → KHÔNG ghi file .drawio;     │
 │  hệ thống sửa build-script rồi chạy lại.              │
 └──────────────────────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────────────┐
 │ BƯỚC 6 — Bàn giao                                     │
 │  {slug}.drawio trong docs/{feature}/drawio/ — mở bằng │
 │  ứng dụng draw.io / diagrams.net / extension VS Code. │
 │  (+ {slug}.svg nếu máy có cài app desktop.)           │
 └──────────────────────────────────────────────────────┘
```

Để ý thứ bạn giữ lại sau cùng: **cả hai file**. File `.drawio` là bức hình; còn build-script `.src.ts` là *công thức* tạo ra bức hình. Khi kiến trúc thay đổi, bạn gọi lại lệnh — nó cập nhật công thức rồi build lại, thay vì bạn phải gỡ rối một bản vẽ đã sửa tay.

---

## 5. Vì sao phải tra từng icon trong danh mục? (bước chống bịa icon)

Đây là "chiêu đặc trưng" của cả nhóm lệnh, và nó tồn tại vì một kiểu lỗi có thật. Riêng AWS đã có hàng trăm dịch vụ, và bên trong file draw.io mỗi icon được tham chiếu bằng một mã tên nội bộ chính xác (dạng như `mxgraph.aws4.something`). Một AI viết những tên đó **theo trí nhớ** sớm muộn cũng sẽ tạo ra một tên *nghe* có vẻ đúng nhưng không tồn tại — chẳng hạn `s3_storage` thay vì tên thật. File tạo ra sẽ mở lên với những hình trống hoặc vỡ, và bạn chỉ phát hiện khi tự nhìn thấy.

Nên quy tắc là: **không bao giờ tin trí nhớ; danh mục mới là chuẩn.** Mọi tên icon phải đi ra từ một lượt tìm trên danh mục stencil thật của hãng (Bước 3), và bộ kiểm định soát lại từng tên một lần nữa lúc build (Bước 5). Một tên sai bị bắt **trước khi file được ghi** — thông báo lỗi còn gợi ý luôn những tên gần đúng — thay vì hiện ra thành một bức hình vỡ trên màn hình của bạn. Cũng chính cổng chặn cứng này ép các quy tắc thiết kế theo từng hãng: các khối AWS phải lồng đúng thứ tự Cloud→Region→VPC→AZ→Subnet, và bộ kiểm định còn đưa ra **lời khuyên** (không phải lỗi) khi phát hiện một "mùi thiết kế" thật trong sơ đồ của bạn, ví dụ một database nằm trong public subnet.

---

## 6. Vì sao Azure và GCP cần tải một lần?

Những danh mục chuẩn đó khá nặng — bản Azure ~13MB, phần lớn là ảnh icon nhúng sẵn. Đóng gói tất cả vào bộ kit sẽ làm nó phình to với mọi người, kể cả những ai không bao giờ vẽ Azure. Nên bộ kit chỉ kèm sẵn danh mục AWS và Databricks, còn danh mục Azure và GCP thì tải **khi cần, đúng một lần**:

```
bash scripts/drawio-catalog-ensure.sh azure   # hoặc: gcp
```

Bình thường bạn không phải tự chạy lệnh này — lần đầu bạn gọi `/drawio-azure` hoặc `/drawio-gcp`, lệnh sẽ nhận ra danh mục còn thiếu và tự tải về (hoặc chỉ cho bạn đúng một dòng lệnh để chạy). Sau lần đầu đó, nó được lưu sẵn trên máy và không bao giờ tải lại.

---

## 7. Bạn nhận được gì, và mở nó thế nào

- **`{slug}.drawio`** — sản phẩm bàn giao. Mở được ở ba nơi miễn phí: **ứng dụng draw.io desktop**, **bản web** (app.diagrams.net), hoặc **extension draw.io của VS Code**. Ai trong đội cũng sửa tay được ở đó.
- **`{slug}.src.ts`** — build-script (công thức). Giữ nó cạnh file `.drawio`; chính nó làm cho việc cập nhật trở nên rẻ.
- **`{slug}.svg`** — tùy chọn. Xuất PNG/SVG cần **cài ứng dụng draw.io desktop**; không có thì cũng chẳng sao — bạn chỉ nhận riêng file `.drawio`, vẫn dùng đầy đủ.

Giống các lệnh vẽ khác trong bộ kit, không có vòng xem-rồi-sửa ngay trong khung chat — mã XML của draw.io không hiện thành hình trong chat. Bạn xem hình thật trong draw.io, rồi hoặc **sửa tay tại đó** (giờ nó là file của bạn), hoặc **gọi lại lệnh** kèm điều cần đổi để nó build lại.

---

## 8. Ví dụ thực tế

Anh **Minh**, một dev kiêm việc BA, phải trình bày kiến trúc của tính năng "upload" cho đội cloud của khách hàng. Lần trước anh đưa một sơ đồ ô hộp chung chung, câu hỏi đầu tiên nhận về là *"đây chính xác là loại lưu trữ nào?"* — nên lần này anh muốn icon AWS thật. Anh gõ:

```
/drawio-aws "users upload files via CloudFront + S3; API Gateway → Lambda → DynamoDB for metadata; an S3 event triggers a thumbnail Lambda" --feature upload
```

1. Hệ thống đọc tài liệu sẵn có của `upload` để xác nhận các dịch vụ và luồng — không bịa thêm gì.
2. Nó xem trước bằng lời thường: *"6 dịch vụ (CloudFront, S3, API Gateway, 2× Lambda, DynamoDB), bố cục pipeline, file ra `docs/upload/drawio/upload-aws.drawio`. Apply?"* Anh Minh gõ `Y`.
3. Nó tìm trên danh mục AWS một lượt gộp — "cloudfront, s3, api gateway, lambda, dynamodb" — và nhận về đúng tên stencil chính thức cho từng dịch vụ.
4. Nó viết `upload-aws.src.ts`: chỉ có cấu trúc và các mũi tên, không có tọa độ.
5. Build + kiểm định: lượt đầu thất bại — một tên stencil bị gõ nhầm — và bộ kiểm định từ chối ghi file *kèm gợi ý tên đúng*. Hệ thống sửa build-script, chạy lại, và cổng kiểm định cho qua sạch sẽ.
6. Anh Minh nhận `upload-aws.drawio`. Anh mở trên app.diagrams.net — mỗi dịch vụ mang đúng icon chính thức của nó. Trong buổi review, kiến trúc sư phía khách mở đúng file đó và tự kéo vào hai ghi chú. Phía họ không cần cài công cụ gì đặc biệt.

Một tuần sau, cũng vị kiến trúc sư ấy muốn dẫn giải **trình tự các lời gọi** của luồng upload — và muốn sửa hình trực tiếp trong một buổi workshop. Anh Minh dùng `/drawio-sequence "browser → API Gateway → Lambda → DynamoDB, with the async thumbnail event" --feature upload`, cho ra một file tuần tự độc lập, sửa tay được. (Nếu chỉ để nằm trong tài liệu của đội trên GitHub, anh đã dùng `/sequence` — Mermaid, nhúng thẳng vào Markdown.)

---

## Xem thêm

Tài liệu này giải thích cả nhóm lệnh ở mức dễ hiểu. Chi tiết kỹ thuật đầy đủ nằm trong các file gốc: `skills/drawio-aws/SKILL.md`, `skills/drawio-azure/SKILL.md`, `skills/drawio-gcp/SKILL.md`, `skills/drawio-databricks/SKILL.md`, `skills/drawio-sequence/SKILL.md`.

Các file giải thích liên quan trong cùng bộ công cụ:

- `explain-skills/d2-architect.vi.md` — `/d2-architect`, bức hình **kiến trúc logic bằng ô hộp chung chung** (D2). Dùng khi nhận diện thương hiệu hãng không quan trọng.
- `explain-skills/sequence.vi.md` — `/sequence`, **sơ đồ tuần tự Mermaid nhúng trong tài liệu**. Cùng một câu hỏi ("ai gọi ai, theo thứ tự nào"), khác chỗ ở của bức hình.
- Quy tắc chọn loại sơ đồ đầy đủ cho cả bộ kit nằm ở file gốc: `.claude/rules/diagram-selection.md`.
