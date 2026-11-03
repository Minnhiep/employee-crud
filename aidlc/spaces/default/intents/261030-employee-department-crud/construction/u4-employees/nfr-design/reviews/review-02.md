## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-03
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-design/traceability.json > upstream_ids / coverage | Các mã NFR6.1, NFR6.2, NFR6.4, NFR6.5, NFR6.6, NFR3.7, NFR3.8, NFR4.5, NFR4.6, NFR4.7 được thiết kế nhắc tới (logical-components.md, observability-design.md §1 và §3, reliability-design.md §1, security-design.md §2) nhưng không có dòng nào trong `coverage`. Bảng truy vết vì vậy thiếu so với những gì thiết kế thật sự phủ. | Thêm các mã này vào `upstream_ids` và `coverage`, trỏ tới mục thiết kế tương ứng. | Accepted risk |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-design/security-design.md > Luật định dạng email (BR1.6, Q2) | Cùng một biểu thức chính quy chạy ở C# và TypeScript nhưng hai bên hiểu khác nhau: `$` của .NET khớp cả trước ký tự xuống dòng cuối, `s` của hai bên có tập ký tự Unicode không hoàn toàn trùng. Hiện không gây lỗi vì chuỗi đã được trim, nhưng câu "cùng nội dung ở C# và TypeScript" chưa bảo đảm "cùng kết quả". | Ghi chú rõ rằng việc trim trước là điều kiện để hai bên cho cùng kết quả; cân nhắc dùng `z` ở phía C#, và thêm vào bộ ví dụ chuẩn một ca có ký tự xuống dòng hoặc khoảng trắng Unicode ở cuối. | Accepted risk |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-design/performance-design.md > §1 (điều kiện tìm) và security-design.md §2 | Thiết kế mô tả tìm kiếm là `lower(...)` chứa `lower(@p)` ở phía PostgreSQL, nhưng code minh họa dùng `term.ToLower()` của .NET (phụ thuộc culture của máy) rồi mới đưa vào tham số. Với "Đ" thì phần kiểm ở reliability-design §5 sẽ phát hiện, nhưng thiết kế không nói rõ chuỗi tìm được hạ chữ ở đâu. | Nêu rõ trong thiết kế: hạ chữ chuỗi tìm bằng `ToLowerInvariant()` hoặc để EF dịch `ToLower()` thành `lower()` trong SQL, để hai bên so cùng một quy tắc. | Accepted risk |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-design/performance-design.md > Change Request 03/11/2026 (FR8), phần Bảo mật | Ghi chú chỉ nói `returnTo` bị giới hạn, không nhắc `search` và `departmentId` trong state điều hướng (N-07). Mã nguồn đã dựng lại chúng bằng URLSearchParams nên an toàn, nhưng thiết kế chưa ghi, người sau dễ đổi thành nối chuỗi. | Thêm một câu: giá trị trong state luôn đi qua URLSearchParams, không nối thẳng vào đường dẫn. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đọc chéo thiết kế với mã nguồn | Khớp | Truy vấn con dùng ix_employees_department_id, không N+1; int.TryParse với NumberStyles.None và CultureInfo.InvariantCulture; ConfirmDialog dùng useId, showModal, vùng aria-live. |

### Summary

Thiết kế phi chức năng khớp mã nguồn thực tế và không có rủi ro kiến trúc; chỉ nên ghi thêm một câu về state điều hướng.
