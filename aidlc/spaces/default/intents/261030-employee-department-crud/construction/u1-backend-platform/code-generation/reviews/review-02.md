## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T18:55:36Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs > MapPostgres, nhánh ForeignKeyViolation (23503); aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/code-generation/traceability.json > BR1.5 | Luật BR1.5 yêu cầu hai kết quả khác nhau cho lỗi khóa ngoại: ghi nhân viên vào phòng ban vừa bị xóa thì trả 400 kèm `errors.departmentId`; xóa phòng ban vừa có nhân viên thì trả 409 với title "Không thể xóa phòng ban". Code chỉ có một nhánh chung trả 409 "Không thể thực hiện", và không có cơ chế nào cho U3/U4 báo ngữ cảnh thao tác (BR1.5 nói U3/U4 báo ngữ cảnh khi lưu). Plan đã duyệt chấp nhận đường dự phòng chung, nhưng traceability vẫn ghi BR1.5 là OK. Mục 6 của code-summary.md cũng không nói U3/U4 phải tự bắt lỗi 23503 rồi ném `DomainError`. Hệ quả: nếu U3/U4 quên, nhân viên ghi vào phòng ban đã xóa sẽ ra 409 chung, form không tô đỏ ô phòng ban. | Đổi trạng thái BR1.5 trong traceability.json thành thực hiện một phần, ghi rõ phần còn lại giao cho U3/U4. Thêm vào code-summary.md mục 6 một câu: U3 phải bắt 23503 khi xóa phòng ban và ném `DomainError.Conflict` có title riêng; U4 phải bắt 23503 khi ghi nhân viên và ném `DomainError.Validation("departmentId", ...)`. Hoặc thêm một thông tin ngữ cảnh vào `ErrorMapper` để nhánh này tự phân biệt. | Unresolved |
| R-02 | Minor | backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs; backend/EmployeeCrud.Api/Program.cs > khối `IsDevelopment()` | BR2.4 (OpenAPI chỉ bật ở Development) không có test nào: bộ test chạy ở môi trường Testing nhưng không kiểm `/openapi/v1.json` trả 404 ngoài Development. Nhánh Development (trang `/swagger`) cũng chưa được chạy, code-summary.md đã ghi là việc Hiệp tự kiểm. | Thêm một test nhỏ: gọi `/openapi/v1.json` và `/swagger` ở môi trường Testing, mong đợi 404 dạng ProblemDetails. Giữ bước tay kiểm `/swagger` ở Development trong hướng dẫn W4. | Unresolved |
| R-03 | Minor | backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs > nhóm test CORS; backend/EmployeeCrud.Api/Platform/Cors/CorsSetup.cs | Chưa có test cho request preflight (OPTIONS kèm `Access-Control-Request-Method: PUT` hoặc `DELETE`). Trình duyệt luôn gửi preflight cho PUT/DELETE từ Vite, nên đây là đường hay vỡ nhất của CORS ở U3/U4. Các test hiện có chỉ kiểm GET và POST kèm header Origin. | Thêm một test OPTIONS với Origin `http://localhost:5173` và `Access-Control-Request-Method: DELETE`, mong đợi 204 có `Access-Control-Allow-Methods` chứa DELETE. Thêm một test cho Origin lạ không nhận header. | Unresolved |
| R-04 | Minor | backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs > MapBadRequest | Mọi `BadHttpRequestException` mã 400 đều bị gán lời báo "Dữ liệu gửi lên không đúng định dạng JSON" ở `errors.body`, kể cả khi nguyên nhân không phải JSON (ví dụ header hỏng, thân request đứt giữa chừng). Lời báo có thể sai nguyên nhân khi Hiệp debug. | Đổi lời báo thành câu trung tính ("Yêu cầu gửi lên không hợp lệ") cho nhánh này, hoặc ghi chú rõ trong comment rằng đây là chủ ý. | Unresolved |
| R-05 | Minor | backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj; backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj | Nhiều gói ghim bản trôi (`Microsoft.EntityFrameworkCore` 10.*, `Microsoft.EntityFrameworkCore.Design` 10.*, `Npgsql.EntityFrameworkCore.PostgreSQL` 10.*, `Microsoft.AspNetCore.Mvc.Testing` 10.*) trong khi các gói khác ghim bản cụ thể. Không có file khóa phụ thuộc, nên lần restore sau có thể kéo bản mới hơn và đổi hành vi mà không ai chủ động. Đây là chủ ý theo plan, nhưng khác với cách ghim 10.0.14 mà code-summary.md mô tả. | Ghim bản cụ thể đã dùng (EF Core 10.0.14, Npgsql 10.0.3, Mvc.Testing 10.0.14), hoặc bật `RestorePackagesWithLockFile`. | Unresolved |
| R-06 | Minor | backend/EmployeeCrud.Api/Platform/Errors/ValidationResponseFactory.cs > Create; backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs > MissingRequiredField_OnProducesJsonAction_StillReturnsProblemJsonWithType | Phản hồi 400 giờ tự dựng `type` và `traceId` bằng tay, tách khỏi `AddProblemDetails` mà 404/409 dùng, nên hai nơi có thể lệch nhau về sau. Test chỉ chạy qua `TestOnlyController`, chưa chạy qua controller thật. | Thêm comment nhắc phải đổi đồng bộ với cấu hình `AddProblemDetails`, hoặc thêm kiểm tra so sánh `type` của 400 với `type` của 404. Kiểm một lần thủ công với POST `/api/departments` thật. | New |

> R-01 Reviewer note: `traceability.json` vẫn ghi BR1.5 là OK. Với 23001 thì tình huống xóa phòng ban còn nhân viên là đường thật, và nó trả 409 chung "Không thể thực hiện" nếu U3 không tự bắt lỗi. `code-summary.md` mục 5b còn ghi "traceability.json không đổi".

> R-02 Reviewer note: Chưa có test OpenAPI trả 404 ngoài môi trường Development.

> R-03 Reviewer note: Chưa có test CORS preflight OPTIONS cho PUT/DELETE.

> R-04 Reviewer note: Mọi `BadHttpRequestException` mã 400 vẫn bị gán lời báo lỗi JSON.

> R-05 Reviewer note: `EmployeeCrud.Api.csproj` và `EmployeeCrud.Api.Tests.csproj` vẫn dùng phiên bản trôi `10.*`.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `dotnet test` (nhóm Platform) | PASS: 21/21, 0 lỗi | Khớp số test dự kiến. Cả hai test của Step 9 đều chạy và đạt. |
| `dotnet format --verify-no-changes` | PASS: không có thay đổi cần làm | Code đúng định dạng. |

### Summary

Bản sửa BT-01 và BT-02 đúng nguyên nhân gốc, có test chứng minh, và tài liệu U5 đã khớp. Việc còn lại đáng cân nhắc trước khi duyệt là R-01: cập nhật trạng thái BR1.5 và ghi rõ U3/U4 phải tự bắt lỗi khóa ngoại.
