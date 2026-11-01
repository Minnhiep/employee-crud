## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T14:40:52Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs > MapPostgres, nhánh ForeignKeyViolation (23503); aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/code-generation/traceability.json > BR1.5 | Luật BR1.5 yêu cầu hai kết quả khác nhau cho lỗi khóa ngoại: ghi nhân viên vào phòng ban vừa bị xóa thì trả 400 kèm `errors.departmentId`; xóa phòng ban vừa có nhân viên thì trả 409 với title "Không thể xóa phòng ban". Code chỉ có một nhánh chung trả 409 "Không thể thực hiện", và không có cơ chế nào cho U3/U4 báo ngữ cảnh thao tác (BR1.5 nói U3/U4 báo ngữ cảnh khi lưu). Plan đã duyệt chấp nhận đường dự phòng chung, nhưng traceability vẫn ghi BR1.5 là OK. Mục 6 của code-summary.md cũng không nói U3/U4 phải tự bắt lỗi 23503 rồi ném `DomainError`. Hệ quả: nếu U3/U4 quên, nhân viên ghi vào phòng ban đã xóa sẽ ra 409 chung, form không tô đỏ ô phòng ban. | Đổi trạng thái BR1.5 trong traceability.json thành thực hiện một phần, ghi rõ phần còn lại giao cho U3/U4. Thêm vào code-summary.md mục 6 một câu: U3 phải bắt 23503 khi xóa phòng ban và ném `DomainError.Conflict` có title riêng; U4 phải bắt 23503 khi ghi nhân viên và ném `DomainError.Validation("departmentId", ...)`. Hoặc thêm một thông tin ngữ cảnh vào `ErrorMapper` để nhánh này tự phân biệt. | New |
| R-02 | Minor | backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs; backend/EmployeeCrud.Api/Program.cs > khối `IsDevelopment()` | BR2.4 (OpenAPI chỉ bật ở Development) không có test nào: bộ test chạy ở môi trường Testing nhưng không kiểm `/openapi/v1.json` trả 404 ngoài Development. Nhánh Development (trang `/swagger`) cũng chưa được chạy, code-summary.md đã ghi là việc Hiệp tự kiểm. | Thêm một test nhỏ: gọi `/openapi/v1.json` và `/swagger` ở môi trường Testing, mong đợi 404 dạng ProblemDetails. Giữ bước tay kiểm `/swagger` ở Development trong hướng dẫn W4. | New |
| R-03 | Minor | backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs > nhóm test CORS; backend/EmployeeCrud.Api/Platform/Cors/CorsSetup.cs | Chưa có test cho request preflight (OPTIONS kèm `Access-Control-Request-Method: PUT` hoặc `DELETE`). Trình duyệt luôn gửi preflight cho PUT/DELETE từ Vite, nên đây là đường hay vỡ nhất của CORS ở U3/U4. Các test hiện có chỉ kiểm GET và POST kèm header Origin. | Thêm một test OPTIONS với Origin `http://localhost:5173` và `Access-Control-Request-Method: DELETE`, mong đợi 204 có `Access-Control-Allow-Methods` chứa DELETE. Thêm một test cho Origin lạ không nhận header. | New |
| R-04 | Minor | backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs > MapBadRequest | Mọi `BadHttpRequestException` mã 400 đều bị gán lời báo "Dữ liệu gửi lên không đúng định dạng JSON" ở `errors.body`, kể cả khi nguyên nhân không phải JSON (ví dụ header hỏng, thân request đứt giữa chừng). Lời báo có thể sai nguyên nhân khi Hiệp debug. | Đổi lời báo thành câu trung tính ("Yêu cầu gửi lên không hợp lệ") cho nhánh này, hoặc ghi chú rõ trong comment rằng đây là chủ ý. | New |
| R-05 | Minor | backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj; backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj | Nhiều gói ghim bản trôi (`Microsoft.EntityFrameworkCore` 10.*, `Microsoft.EntityFrameworkCore.Design` 10.*, `Npgsql.EntityFrameworkCore.PostgreSQL` 10.*, `Microsoft.AspNetCore.Mvc.Testing` 10.*) trong khi các gói khác ghim bản cụ thể. Không có file khóa phụ thuộc, nên lần restore sau có thể kéo bản mới hơn và đổi hành vi mà không ai chủ động. Đây là chủ ý theo plan, nhưng khác với cách ghim 10.0.14 mà code-summary.md mô tả. | Ghim bản cụ thể đã dùng (EF Core 10.0.14, Npgsql 10.0.3, Mvc.Testing 10.0.14), hoặc bật `RestorePackagesWithLockFile`. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| dotnet test backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform" | PASS: Passed 19, Failed 0, Skipped 0, Total 19 (595 ms) | Khớp với 11 test của ErrorMapper và 8 test của PipelineTests trong plan. Không test nào mở kết nối database. |
| Quét bí mật (Grep không phân biệt hoa thường, mẫu password hoặc pwd theo sau bởi dấu bằng, trong backend, bỏ bin và obj) | 0 dòng | Đạt BR2.2. Không có mật khẩu trong file nguồn. |
| sensor traceability | Đã đạt theo brief | Không kiểm lại; xem finding Major về BR1.5 để biết trạng thái ghi chưa đúng thực tế. |
| sensor required-sections | Không chạy riêng | Không có kết quả để trích dẫn. |
| dotnet format --verify-no-changes, dotnet build | Không chạy lại | Hai lệnh có thể ghi file hoặc nằm ngoài lệnh được phép; chỉ trích kết quả từ code-summary.md (đạt, 0 cảnh báo). |

### Summary

Nền tảng U1 triển khai đúng thiết kế và đủ rõ để U3/U4 dựa vào: lỗi đi qua một cửa duy nhất (`ErrorMapper` thuần, bộ bắt lỗi áp lại CORS), chuỗi xử lý đúng thứ tự, kiểm chuỗi kết nối sau `Build()`, không có thứ ngoài phạm vi. 19/19 test đạt. Điểm đáng cân nhắc nhất trước khi duyệt là BR1.5 mới được thực hiện một phần nhưng traceability ghi là OK, nên cần ghi rõ phần còn lại giao cho U3/U4. Các điểm Minor còn lại là thiếu test cho OpenAPI và preflight CORS, lời báo 400 chung chung, và gói ghim bản trôi.
