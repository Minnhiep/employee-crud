## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-03
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/nfr-design/security-design.md > §2 Cơ chế chọn, mục 1-2 | Lý do chọn cơ chế bị đảo ngược. Đặt `UseCors` ở ngoài `UseExceptionHandler` không giúp header CORS sống sót. `CorsMiddleware` ghi `Access-Control-Allow-Origin` vào `Response.Headers` ngay khi request đi vào. Khi có ngoại lệ, `UseExceptionHandler` (đứng bên trong) chạy `Response.Clear()` và xóa toàn bộ header đó, rồi mới gọi `IExceptionHandler`. Chính §2 nói bộ bắt lỗi xóa header, nhưng sau đó lại kết luận "đặt CORS ở ngoài để không phụ thuộc lúc nó xóa". Hai câu này mâu thuẫn. Test số 1 có thể thất bại, và khi đó Code Generation phải quay sang "cách dự phòng" mà tài liệu chỉ nhắc một dòng. Đây đúng là điểm Major cũ của NFR7.2, nên mới chỉ được hứa, chưa được giải. Điều này dựa trên hiểu biết về mã nguồn ASP.NET Core và chưa chạy thử trên máy. | Đổi cơ chế chính thành: `IExceptionHandler` tự áp lại chính sách CORS đã đăng ký (lấy `ICorsPolicyProvider` và `ICorsService`, rồi gọi `ApplyResult` lên `httpContext.Response`) trước khi ghi ProblemDetails. Header đặt ở bước này nằm sau lệnh xóa nên còn nguyên. Giữ `UseCors` ở ngoài cùng để phục vụ preflight và các phản hồi không phải lỗi. Sửa lại câu giải thích cho đúng, và giữ ba test như bằng chứng. | Accepted risk |
| R-02 | Major | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/nfr-design/security-design.md > §2 mục 3 (test dùng `WebApplicationFactory` và endpoint chỉ có trong test) | Test chưa dựng được từ mô tả. (a) "Endpoint chỉ có trong test" không nói cách thêm. Với minimal hosting, không thể thêm endpoint từ DI; `IStartupFilter` thì hoặc đứng ngoài CORS (test vô nghĩa) hoặc đứng sau bước cuối chuỗi. (b) `WebApplicationFactory<Program>` cần `Program` công khai (`public partial class Program`). (c) Bước kiểm chuỗi kết nối lúc khởi động (reliability §1, NFR1.1) sẽ làm factory sập vì máy test không có user-secrets, nên test phải tự cấp `ConnectionStrings:Default` giả. Cả ba điểm đều không được nêu, nên một người code theo tài liệu sẽ phải tự đoán. | Ghi rõ trong tài liệu: dùng một controller test (đăng ký bằng `AddApplicationPart` trong `ConfigureTestServices`) có action ném `InvalidOperationException`; khai báo `public partial class Program`; trong factory dùng `ConfigureAppConfiguration` để đặt chuỗi kết nối giả (không cần database thật vì `AddDbContext` chỉ mở kết nối khi truy vấn). | Accepted risk |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/nfr-design/security-design.md > §3 (bỏ 413 / 32 KB) | Bỏ giới hạn 32 KB là hợp lý, vì NFR2.4 không có nguồn. Nhưng câu "Kestrel trả lỗi trước khi vào bộ đổi lỗi" không đúng hẳn. Body vượt `MaxRequestBodySize` (mặc định 30.000.000 byte) làm `BadHttpRequestException` bị ném khi model binding đọc body. Ngoại lệ đó đi vào `UseExceptionHandler`, và nhánh "Lỗi lạ → 500" trong reliability §4 sẽ biến nó thành 500 kèm log Error. | Sửa câu giải thích cho đúng. Trong `IExceptionHandler` thêm một nhánh: `BadHttpRequestException` thì giữ nguyên `StatusCode` của nó (400 hoặc 413) và đổi thành ProblemDetails. Thêm một ca vào danh sách unit test ở reliability §4. | Accepted risk |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/nfr-design/observability-design.md > mục "Lỗi 4xx" so với performance-design.md > NFR5.1 | Observability yêu cầu ghi log Information cho mọi lỗi 4xx, nhưng performance-design cấm middleware log từng request. Không nói component nào ghi dòng log này. 404/405/415 đi qua `UseStatusCodePages` không có chỗ để ghi, còn 400 do `InvalidModelStateResponseFactory`. | Chỉ rõ nơi ghi log 4xx (bộ đổi lỗi cho ngoại lệ nghiệp vụ, factory cho 400, callback của trang mã trạng thái cho 404/405/415), hoặc hạ yêu cầu xuống chỉ ghi các lỗi do `DomainError`. | Accepted risk |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/nfr-design/reliability-design.md > §2 | Tiêu chí W4 có đường lui hợp lý. Có thể hơi nhẹ ở hai điểm: `dotnet ef` chạy `Program.cs` lúc thiết kế, nên bước kiểm chuỗi kết nối phải ném ngoại lệ, không được gọi `Environment.Exit`. `database update` cũng tự tạo `employee_db` nếu chưa có, nên không chứng minh được "Hiệp đã tạo database". Gói `Microsoft.EntityFrameworkCore.Design` là cần thiết và đã có. | Ghi thêm hai lưu ý này vào hướng dẫn mà Code Generation sẽ viết (ngắn, một dòng mỗi ý). | Accepted risk |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đối chiếu security-design / reliability-design với C1, C2, C3 sau FR8 | Khớp | Đường dự phòng 23503/23001 thành 409 "Không thể thực hiện" vẫn đúng hình dạng 409 của C1; `employeeCount` và `departmentId` không đi qua ErrorMapper. |

### Summary

Thiết kế NFR của U1 vẫn nhất quán với hợp đồng đã sửa; không cần đổi.
