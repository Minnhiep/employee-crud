# Practices Discovery: câu hỏi về cách làm việc của dự án

Các câu hỏi này chốt cách cả dự án sẽ được làm: dùng Git thế nào, làm phần nào trước, viết test ra sao, "triển khai" nghĩa là gì, và quy ước viết code. Mỗi câu có sẵn một đề xuất, dựa trên mặc định của AI-DLC đã chỉnh cho khớp với các quyết định trong `project.md` (chạy trên máy, không có CI/CD, không có Docker). Phần trong ngoặc vuông ở tiêu đề cho biết câu hỏi thuộc vai trò nào. Hiệp có thể trả lời mọi câu.

Bản nháp tham khảo: `team-practices.md` và `discovered-rules.md` trong cùng thư mục.

---

## Q1. [Kỹ sư phát hành] Dùng nhánh Git thế nào?

Một người làm, Git chỉ ở trên máy, sau này mới đẩy lên GitHub. Câu này chốt việc commit thẳng lên nhánh chính hay tách nhánh riêng cho từng phần việc.

A. Commit thẳng lên `main` (đơn giản nhất, hợp với một người làm) (Đề xuất)
B. Mỗi phần việc một nhánh ngắn (ví dụ `feature/phong-ban`), làm xong gộp về `main` trong ngày, để tập quy trình branch/merge
C. Dùng Git Flow (nhánh `develop`, `release`...)
X. Other (please specify)

[Answer]: A

## Q2. [Kỹ sư phát hành] Ai commit và lời ghi chú commit viết thế nào?

A. Hiệp tự commit sau mỗi phần đã build và test qua; lời ghi chú tiếng Việt, ngắn, nói "làm gì" (ví dụ "Thêm API danh sách phòng ban") (Đề xuất)
B. AI-DLC commit khi Hiệp bảo; lời ghi chú tiếng Việt, ngắn
C. Hiệp tự commit; lời ghi chú theo chuẩn Conventional Commits bằng tiếng Anh (ví dụ `feat: add department list API`)
X. Other (please specify)

[Answer]: A

## Q3. [Kỹ sư phát hành] Cài công cụ phát triển (ví dụ `dotnet-ef` để chạy migration) ở đâu?

Lệnh `dotnet ef` không có sẵn trong .NET SDK, phải cài thêm. Cài toàn máy (`--global`) thì nằm ngoài thư mục dự án.

A. Cài cục bộ trong dự án bằng tool manifest (`dotnet new tool-manifest` rồi `dotnet tool install dotnet-ef`), chạy bằng `dotnet ef ...`, không đụng tới ngoài thư mục dự án (Đề xuất)
B. Cài toàn máy (`dotnet tool install --global dotnet-ef`)
X. Other (please specify)

[Answer]: A

## Q4. [Trưởng nhóm giao hàng] Có làm trước một lát mỏng chạy xuyên suốt không?

Walking skeleton (bộ khung biết đi) là một phiên bản nhỏ nhất chạy được từ đầu tới cuối, làm trước tiên để chứng minh các phần nối được với nhau, trước khi làm tính năng thật. Ví dụ ở đây: chỉ màn hình danh sách phòng ban, lấy dữ liệu từ PostgreSQL qua API và hiển thị trên React.

A. Không. Làm đầy đủ phần phòng ban trước, rồi tới nhân viên (kế hoạch classic mặc định không làm bộ khung) (Đề xuất)
B. Có. Làm trước lát mỏng "danh sách phòng ban từ DB lên màn hình" và kiểm chạy thật, rồi mới làm các tính năng còn lại
X. Other (please specify)

[Answer]: A

## Q5. [Kỹ sư kiểm thử] Viết test trước hay sau code?

A. Test-after: viết xong code một lớp (ví dụ service) rồi viết test cho lớp đó và chạy ngay (Đề xuất, dễ theo dõi với người mới)
B. TDD: viết test trước (để nó báo đỏ), rồi viết code cho test xanh
X. Other (please specify)

[Answer]: A

## Q6. [Kỹ sư kiểm thử] Mức test tự động và độ phủ (coverage) là bao nhiêu?

Kế hoạch classic mặc định yêu cầu test phủ ít nhất 80% số dòng code và chạy trong CI trước khi gộp. Nhưng `project.md` đã quyết: không có CI/CD, và chỉ viết unit test cho logic nghiệp vụ chính (các lớp service). Câu này chốt mức sàn khi không có CI.

A. Phủ ít nhất 80% trên các lớp service, đo bằng coverlet, Hiệp chạy `dotnet test` trên máy trước khi commit (Đề xuất)
B. Phủ ít nhất 80% trên toàn bộ backend (cả controller), chạy trên máy trước khi commit
C. Không đặt mức %, chỉ yêu cầu mỗi hàm service chính có 1 test trường hợp đúng và ít nhất 2 test trường hợp lỗi (thấp hơn mức 80% mặc định của kế hoạch classic)
X. Other (please specify)

[Answer]: A

## Q7. [Lập trình viên] Dùng thư viện test nào cho backend?

A. xUnit, đặt trong một project test riêng (ví dụ `EmployeeCrud.Api.Tests`); test service dùng database giả lập trong bộ nhớ (Đề xuất, phổ biến nhất với ASP.NET Core)
B. NUnit
C. MSTest
X. Other (please specify)

[Answer]: A

## Q8. [Kỹ sư phát hành] "Triển khai" trong bài này nghĩa là gì?

Đã quyết là chạy trực tiếp trên máy (`dotnet run`, `npm run dev`, PostgreSQL trên máy), không có máy chủ thật.

A. Triển khai = chạy trên máy theo README. Coi là xong khi: migration chạy được, API mở được OpenAPI, gọi thử qua Postman đúng, giao diện React làm được đủ thêm/sửa/xóa/tìm. Khi hỏng thì quay lui bằng `git revert` và `dotnet ef database update <migration trước>` (Đề xuất)
B. Như A, và thêm một script để khởi động backend và frontend bằng một lệnh
X. Other (please specify)

[Answer]: A

## Q9. [Lập trình viên] Định dạng và kiểm lỗi code thế nào?

Formatter tự sắp lại khoảng trắng và xuống dòng cho đều; linter báo những chỗ code dễ gây lỗi. Không có CI nên cả hai đều chạy trên máy.

A. C#: file `.editorconfig` + lệnh `dotnet format`. JavaScript: ESLint (Vite tạo sẵn) + Prettier với cấu hình mặc định (Đề xuất)
B. C#: `.editorconfig` + `dotnet format`. JavaScript: chỉ ESLint, không thêm Prettier
C. Không thêm công cụ, chỉ dùng định dạng mặc định của VS Code
X. Other (please specify)

[Answer]: A

## Q10. [Lập trình viên] Tên bảng và cột trong PostgreSQL đặt theo kiểu nào?

PostgreSQL quen dùng chữ thường nối gạch dưới (`snake_case`, ví dụ `full_name`). EF Core mặc định giữ nguyên tên lớp C# (`FullName`), khi viết SQL tay phải bọc trong ngoặc kép.

A. `snake_case`, khai báo tay trong cấu hình EF Core (nhìn thấy rõ trong code, không thêm gói) (Đề xuất)
B. `snake_case`, dùng gói `EFCore.NamingConventions` để đổi tự động
C. Giữ mặc định của EF Core (`PascalCase`)
X. Other (please specify)

[Answer]: A

## Q11. [Lập trình viên] Comment trong code viết bằng tiếng gì?

A. Tiếng Việt, ngắn, giải thích "vì sao" ở chỗ không hiển nhiên (giúp Hiệp tự trình bày lại code) (Đề xuất)
B. Tiếng Anh
X. Other (please specify)

[Answer]: A

## Q12. [Kỹ sư phát hành] Có đồng ý thêm 5 luật cứng này cho dự án không? (select all that apply)

Đây là những ràng buộc rút ra từ lời Hiệp đã ghi (`project.md`, `CLAUDE.md`). Luật nào được chọn sẽ được thêm vào `project.md`, và mọi bước sau phải tuân theo. 7 luật "không" đã có sẵn (không microservices, Redux, CI/CD, Docker, TypeScript/Next.js, đăng nhập, commit mật khẩu) vẫn giữ nguyên.

A. LUÔN để Hiệp tự trả lời mọi câu hỏi và tự duyệt mọi bước; AI-DLC không trả lời hay duyệt thay
B. LUÔN kiểm tra dữ liệu ở cả form React lẫn API; API trả lỗi theo ProblemDetails với mã HTTP đúng (400/404/409)
C. LUÔN viết chữ trên giao diện và thông báo lỗi bằng tiếng Việt
D. KHÔNG cài công cụ hay gói ra ngoài thư mục dự án, không đổi PATH khi Hiệp chưa duyệt; và KHÔNG tự đẩy code lên GitHub (Hiệp tự làm từng bước khi xong bài)
X. Other (please specify)

[Answer]: A, B, C, D; X: làm đúng chuẩn chỉnh theo yêu cầu của PJ tôi đưa cho bạn
