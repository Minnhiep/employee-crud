## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T08:17:34Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-design/traceability.json > upstream_ids / coverage | Các mã NFR6.1, NFR6.2, NFR6.4, NFR6.5, NFR6.6, NFR3.7, NFR3.8, NFR4.5, NFR4.6, NFR4.7 được thiết kế nhắc tới (logical-components.md, observability-design.md §1 và §3, reliability-design.md §1, security-design.md §2) nhưng không có dòng nào trong `coverage`. Bảng truy vết vì vậy thiếu so với những gì thiết kế thật sự phủ. | Thêm các mã này vào `upstream_ids` và `coverage`, trỏ tới mục thiết kế tương ứng. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-design/security-design.md > Luật định dạng email (BR1.6, Q2) | Cùng một biểu thức chính quy chạy ở C# và TypeScript nhưng hai bên hiểu khác nhau: `$` của .NET khớp cả trước ký tự xuống dòng cuối, `s` của hai bên có tập ký tự Unicode không hoàn toàn trùng. Hiện không gây lỗi vì chuỗi đã được trim, nhưng câu "cùng nội dung ở C# và TypeScript" chưa bảo đảm "cùng kết quả". | Ghi chú rõ rằng việc trim trước là điều kiện để hai bên cho cùng kết quả; cân nhắc dùng `z` ở phía C#, và thêm vào bộ ví dụ chuẩn một ca có ký tự xuống dòng hoặc khoảng trắng Unicode ở cuối. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-design/performance-design.md > §1 (điều kiện tìm) và security-design.md §2 | Thiết kế mô tả tìm kiếm là `lower(...)` chứa `lower(@p)` ở phía PostgreSQL, nhưng code minh họa dùng `term.ToLower()` của .NET (phụ thuộc culture của máy) rồi mới đưa vào tham số. Với "Đ" thì phần kiểm ở reliability-design §5 sẽ phát hiện, nhưng thiết kế không nói rõ chuỗi tìm được hạ chữ ở đâu. | Nêu rõ trong thiết kế: hạ chữ chuỗi tìm bằng `ToLowerInvariant()` hoặc để EF dịch `ToLower()` thành `lower()` trong SQL, để hai bên so cùng một quy tắc. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Sensor đã chạy phía người làm (required-sections, upstream-coverage, linter, type-check, traceability) | Không chạy lại theo yêu cầu của lượt này | Không có kết quả để diễn giải; các đối chiếu bên dưới do reviewer tự kiểm trực tiếp trên mã nguồn. |
| Đối chiếu thủ công với mã U1/U2 | `DbConstraintNames.EmployeeEmailUnique` = `ux_employees_email` và `EmployeeDepartmentForeignKey` = `fk_employees_department` đúng như thiết kế dùng. `ErrorMapper` đã đổi 23505 email thành 409 `errors.email` và có đường dự phòng 23503 thành 409 chung. `vite.config.ts` đặt cả dev và preview ở cổng 5173 (strictPort) nên Lighthouse trên `npm run preview` không vướng CORS. Log U1 chỉ ghi `{Status} {Method} {Path}`. | Các khẳng định về điểm tích hợp với U1/U2 đều đúng; không có tham chiếu gãy. |

### Summary

Thiết kế NFR của U4 nhất quán với contract chung và với mã nền U1/U2/U3: ba lớp chặn (form, service, database), phân công rõ ai bắt lỗi nào khi hai thao tác chen nhau, thứ tự kiểm cố định, phương án dự phòng cho `ILike` và cách đo/kiểm thật trên PostgreSQL đều đủ để triển khai mà không phải đoán. Chỉ còn ba điểm Minor (thiếu mã trong bảng truy vết, khác biệt nhỏ giữa biểu thức chính quy .NET và JS, chỗ hạ chữ chuỗi tìm chưa nói rõ), không chặn.
