# Cách làm việc của nhóm

> Bản tích hợp của lead (aidlc-pipeline-deploy-agent), ngày 2026-10-30, dự án greenfield `employee-crud`.
> Căn cứ: câu trả lời của Hiệp trong `practices-discovery-questions.md` (Q1–Q12), cộng với Tech Stack, Decided và Forbidden đã có trong `project.md`. Năm mục của `org.md` chỉ dùng làm gợi ý ban đầu.
> Nhóm ở đây là một người: Hiệp (thực tập sinh) làm trên máy cá nhân, AI-DLC sinh code.

## Way of Working

- Chúng tôi commit thẳng lên nhánh chính `main` theo kiểu trunk-based: không tách nhánh tính năng, không có nhánh sống lâu như `develop` hay `release/*`. Lý do: chỉ một người làm và Git mới ở trên máy (Q1).
- AI-DLC sinh code; Hiệp tự trả lời mọi câu hỏi và tự duyệt mọi gate. Code sinh ra phải đủ rõ để Hiệp tự giải thích được từng tầng (React → Web API JSON → ASP.NET Core → PostgreSQL).
- AI-DLC không tự commit. Sau mỗi phần đã build và test qua, Hiệp xem lại thay đổi (`git status`, `git diff`) rồi tự commit (Q2).
- Mỗi commit nhỏ, một mục đích. Lời ghi chú viết tiếng Việt, ngắn, nói "làm gì", ví dụ `Thêm API danh sách phòng ban` (Q2).
- Công cụ phát triển (ví dụ `dotnet-ef` để chạy migration) được cài cục bộ trong dự án bằng tool manifest: `dotnet new tool-manifest`, rồi `dotnet tool install dotnet-ef`, rồi chạy bằng `dotnet ef ...`. Không cài `--global`, không đổi PATH (Q3).
- Nếu ở Construction AI-DLC tạo worktree riêng cho từng Bolt (một đợt code), chúng tôi giữ mặc định của AI-DLC: tách từ `main`, gộp về `main` kiểu squash-merge.
- Hiện chỉ dùng Git trên máy. Khi xong bài, Hiệp tự đẩy lên GitHub từng bước; AI-DLC không tự push.
- Trước commit đầu tiên có code, `.gitignore` phải loại `bin/`, `obj/`, `node_modules/`, `dist/`, `.env` và mọi file chứa mật khẩu database.

## Walking Skeleton

- Chúng tôi **không** làm walking skeleton. Walking skeleton là bản nhỏ nhất chạy xuyên suốt mọi tầng, làm trước để chứng minh các phần nối được với nhau. Lý do: scope `classic` đặt `skeleton: off`, và Hiệp đã chọn không làm (Q4).
- Thứ tự làm: làm **đầy đủ** phần phòng ban trước, rồi mới tới nhân viên. Phòng ban không phụ thuộc gì, còn nhân viên phải chọn phòng ban có sẵn (Q4). Units Generation và Delivery Planning chia Unit cụ thể theo thứ tự này.

## Testing Posture

- **Methodology**: test-after
- **Methodology evidence**: Hiệp chọn viết code trước, rồi viết test cho phần đó và chạy ngay, vì người mới dễ theo dõi hơn (Q5). Lựa chọn này cũng khớp mặc định của org.md và quyết định trong project.md chỉ viết unit test cho logic nghiệp vụ chính.
- **Ordering**: Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.
- Phạm vi test tự động: chỉ unit test cho các service, tập trung vào luật nghiệp vụ. Ví dụ: email trùng (không phân biệt hoa thường) trả 409, phòng ban không tồn tại, không xóa được phòng ban còn nhân viên, tìm theo họ tên và email không phân biệt hoa thường, không tìm thấy trả 404. Mỗi service có ít nhất một trường hợp đúng và hai trường hợp lỗi hoặc biên. Không viết E2E, không viết test tự động cho React, không làm bộ test tích hợp lớn.
- Độ phủ: ít nhất 80% số dòng (line coverage) của các lớp service, đo bằng coverlet (`dotnet test --collect:"XPlat Code Coverage"`). Hiệp chạy `dotnet test` trên máy trước mỗi commit, thay cho bước CI mà dự án không có (Q6). Build and Test kiểm mức sàn này và không được hạ nó xuống để cho qua.
- Công cụ: xUnit, đặt trong một project test riêng cạnh backend (ví dụ `EmployeeCrud.Api.Tests`). Test service dùng database giả lập trong bộ nhớ (Q7). Chọn cụ thể provider nào thì để Code Generation quyết, vì việc hàm `ILike` của Npgsql có chạy được trên provider giả lập hay không vẫn chưa kiểm (xem `evidence.md`).
- Kiểm thủ công cả luồng: theo các danh sách F, V, A, D, R trong `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`, kiểm từ dưới lên: database → API → giao diện → cả luồng.
- Khối lượng và loại test theo Test Strategy `Standard` của workflow; mức sàn của scope chỉ cộng thêm, không thay thế.

## Deployment

- Trong phạm vi này không có môi trường staging hay production. "Triển khai" nghĩa là chạy trên máy theo README: PostgreSQL 18 trên máy (cổng 5432, database `employee_db`), `dotnet ef database update`, `dotnet run` cho backend, `npm install` rồi `npm run dev` cho frontend. Không CI/CD, không Docker (Q8).
- Triển khai coi là xong khi đủ bốn điều: migration chạy được; API mở được trang OpenAPI; gọi thử qua Postman ra đúng kết quả; giao diện React làm được đủ thêm, sửa, xóa, tìm (Q8).
- Quay lui khi hỏng: commit hỏng thì `git revert <commit>`; migration hỏng thì `dotnet ef database update <migration trước đó>` (Q8).
- README là hướng dẫn triển khai: cần cài gì, bản nào; đặt connection string bằng user-secrets; lệnh tạo database bằng migration; lệnh chạy; địa chỉ trang và địa chỉ API.
- Bàn giao là source trên Git: backend, frontend, migration, sơ đồ DB, danh sách API kèm JSON mẫu và README. Hiệp tự đẩy lên GitHub sau.

## Code Style

- C# / ASP.NET Core: theo quy ước chuẩn của .NET: PascalCase cho class, method, property; camelCase cho biến cục bộ và tham số; `_camelCase` cho field private; method bất đồng bộ có hậu tố `Async`; bật nullable reference types. Định dạng theo file `.editorconfig` và lệnh `dotnet format` (Q9).
- React / JavaScript: ESLint theo cấu hình Vite tạo sẵn (`npm run lint`) cộng Prettier với cấu hình mặc định (Q9). File component dạng `.jsx`, tên component PascalCase, biến và hàm camelCase.
- Format và lint chạy trên máy trước khi commit; dự án không có CI.
- Database: tên bảng và cột viết thường dạng `snake_case` (`employees`, `departments`, `full_name`, `department_id`), khai báo tay trong cấu hình EF Core (`ToTable`, `HasColumnName`), không thêm gói `EFCore.NamingConventions` (Q10).
- API: đường dẫn chữ thường, danh từ số nhiều (`/api/employees`, `/api/departments`); JSON dùng camelCase (mặc định của ASP.NET Core); lỗi trả theo ProblemDetails với mã 400/404/409.
- Ngôn ngữ: tên trong code (class, biến, route, cột) bằng tiếng Anh; chữ trên giao diện và thông báo lỗi cho người dùng bằng tiếng Việt. Comment trong code viết tiếng Việt, ngắn, giải thích "vì sao" ở chỗ không hiển nhiên, để Hiệp tự trình bày lại được code (Q11).
- Khi AI-DLC góp ý về style, đọc cấu hình linter của dự án trước; chỉ góp ý những gì linter chưa bao.
