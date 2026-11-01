# Lý do xếp thứ tự và các rủi ro

> **Nguồn:** `units-generation/unit-of-work-dependency.md`, `contract-design/contract-summary.md` (bảng câu hỏi còn mở), `bolt-plan.md`, `delivery-planning-questions.md` (Q1–Q4).
>
> **Bolt** là một lượt làm trọn một phần việc, kết thúc bằng thứ chạy được.

## 1. Cách xếp thứ tự đã chọn

**Nền móng trước, rủi ro sớm, rồi đi theo giá trị.** Ý tưởng "làm rủi ro trước" theo mô hình xoắn ốc (Boehm, Spiral Model). Phần còn lại xếp theo giá trị (value-first). Hiệp chọn ở Q1-A.

- **B1 (U1) trước B2 (U2):** đây là lựa chọn duy nhất sơ đồ phụ thuộc cho phép. Những thứ chưa chắc nhất đều nằm ở backend: nối PostgreSQL lần đầu, user-secrets, `dotnet-ef` cục bộ, project test. Hiệp đánh dấu rủi ro kết nối DB ở Q4-A. Đặt chúng vào Bolt đầu để vướng gì thì biết ngay, trước khi viết code nghiệp vụ.
- **B2 tiếp theo:** khung giao diện và CSS chung là nền cho mọi trang. Kiểm a11y (khả năng tiếp cận) ngay ở đây xử lý rủi ro Q4-C (mục tiêu G1–G6) sớm, khi sửa còn rẻ.
- **B3 → B4 → B5:** thứ tự bắt buộc theo sơ đồ (U4 cần U3, U5 cần tất cả). Thứ tự này cũng trùng với giá trị: xong B3 là đã có tính năng phòng ban chạy trọn; B4 hoàn thành mục tiêu chính của `docs/ke-hoach.md`; B5 làm cho bài nộp được.

**Không lệch khỏi sơ đồ phụ thuộc:** B1 → B2 → B3 → B4 → B5 là một thứ tự topo hợp lệ của sơ đồ trong `unit-of-work-dependency.md`.

**Phương án không chọn:**
- **Q1-B, giao diện trước:** có màn hình xem sớm hơn, nhưng rủi ro kết nối DB lộ ra muộn.
- **Q1-C, chấm điểm WSJF:** chỉ có một chỗ được chọn thứ tự (U1/U2), chấm điểm là thừa.

## 2. Danh sách rủi ro

| # | Rủi ro | Khả năng | Ảnh hưởng | Cách giảm | Bolt |
|---|---|---|---|---|---|
| R1 | Kết nối PostgreSQL lần đầu thất bại: sai mật khẩu, sai cổng, chưa có database, user-secrets đặt sai project (Hiệp lo, Q4-A) | Trung bình | Cao: chặn mọi Bolt sau | Làm ở B1. AI viết hướng dẫn từng bước và cách kiểm (`dotnet ef dbcontext info`); Hiệp tự làm, gặp lỗi thì dán thông báo để AI chỉ cách sửa | B1 |
| R2 | Database giả lập dùng khi test không so sánh không phân biệt hoa thường giống PostgreSQL thật, nên test xanh mà chạy thật lại sai | Trung bình | Trung bình | Chốt ở B3, unit đầu tiên cần tới (câu hỏi mở của C2 và C5); dùng một cách so sánh chạy giống nhau ở cả hai nơi; kiểm lại bằng Postman trên DB thật | B3, B4 |
| R3 | Không đạt các mục tiêu chất lượng G1–G6 (WCAG 2.1 AA, Lighthouse 100/≥90/≥90, W3C) (Hiệp lo, Q4-C) | Trung bình | Trung bình | Kiểm a11y ngay ở B2 cho khung trang. Các Bolt sau kiểm lại trang của mình. Build and Test đo đủ | B2–B4 |
| R4 | Đường dẫn thư mục dự án dài (59 ký tự, trong OneDrive) vượt giới hạn 260 ký tự của Windows khi build hoặc `npm install` | Thấp–Trung bình | Trung bình | Hiệp chưa chọn mục này ở Q4. Nếu gặp lỗi đường dẫn thì dừng lại hỏi Hiệp: chuyển thư mục hay bật long paths (cần quyền quản trị, Hiệp quyết) | Mọi Bolt |
| R5 | OneDrive đồng bộ thư mục `bin/`, `obj/`, `node_modules/` làm khóa file hoặc chậm build | Trung bình | Thấp–Trung bình | Có lỗi khóa file thì dừng lại hỏi Hiệp (có thể tạm dừng đồng bộ OneDrive) | B1–B4 |
| R6 | Lỗi do ASP.NET Core tự sinh (JSON hỏng, đường dẫn lạ, 405, 415) không theo dạng ProblemDetails tiếng Việt. Đây là điểm R-02 của Contract Design, Hiệp đã chấp nhận là rủi ro | Trung bình | Thấp | Code Generation của B1 xử lý theo C3. Build and Test gọi thử từng trường hợp bằng Postman | B1 |

## 3. Điểm kiểm sau mỗi Bolt

- **Đạt (go):**
  - DoD của Bolt trong `bolt-plan.md` đủ.
  - `dotnet build` và `dotnet test` xanh; với Bolt có frontend thì `npm run lint` sạch.
  - Hiệp duyệt ở điểm kiểm và tự commit.
- **Không đạt (no-go):**
  - Một tiêu chí DoD hỏng; hoặc
  - R1 hay R2 chưa giải quyết.

  Khi đó sửa ngay trong Bolt đó, không sang Bolt sau.
