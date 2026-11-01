## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T18:14:21Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/nfr-requirements/reliability-requirements.md > NFR3.3 và NFR4.3 | Tài liệu ghi lỗi `DbUpdateConcurrencyException` sẽ được "đổi" thành 404, nhưng không nói ai đổi. Trong `backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs` của U1 chỉ có xử lý 23505 và 23503, không có xử lý lỗi tranh chấp. Nếu U3 hiểu là "U1 lo" thì sửa/xóa phòng ban vừa bị xóa sẽ ra 500. | Ghi rõ trong NFR3.3 rằng `DepartmentService` tự bắt `DbUpdateConcurrencyException` và ném lỗi nghiệp vụ không-tìm-thấy (404). Nếu muốn U1 lo thì phải ghi đó là việc cần thêm vào U1. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/nfr-requirements/reliability-requirements.md > NFR4.2 | Mức sàn 80% cần "đọc được con số theo lớp", nhưng công cụ đọc báo cáo bị hoãn sang NFR Design. `coverlet.collector` chỉ sinh file cobertura XML. Công cụ đọc thường là `reportgenerator`, mà dự án cấm cài global. | Ghi thêm ràng buộc: công cụ đọc báo cáo phải cài cục bộ bằng tool manifest, hoặc đọc thẳng thuộc tính `line-rate` của lớp `DepartmentService` trong XML. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/nfr-requirements/reliability-requirements.md > NFR3.1 và tech-stack-decisions.md > NFR3.4 | Chỉ mục `lower(name)` trong PostgreSQL phụ thuộc collation của database (English_United States.1252, UTF8 trên Windows). Phần "đạt khi" chỉ thử "kế toán" với "Kế toán". Chưa có ca kiểm chữ hoa có dấu như "KẾ TOÁN", trong khi tài liệu nêu chính ca này là lý do chọn InMemory. | Thêm một ca kiểm thủ công bằng pgAdmin: chèn "KẾ TOÁN" khi đã có "Kế toán" phải bị 23505. Nếu PostgreSQL không coi hai tên này là trùng thì phải xử lý trước khi viết code. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/nfr-requirements/tech-stack-decisions.md > NFR4.5 | Tài liệu nói InMemory chạy `ToLower()` bằng .NET nên "đúng với chữ tiếng Việt có dấu". `ToLower()` phụ thuộc culture hiện tại của máy chạy test, còn `lower()` của PostgreSQL phụ thuộc collation của database. Hai bên có thể lệch nhau ở vài ký tự, nên test xanh chưa chắc chứng minh được hành vi trên PostgreSQL thật. | Ghi chú giới hạn này vào NFR4.6, và nói rõ rằng hành vi không phân biệt hoa thường với chữ có dấu trên database thật chỉ được xác nhận bằng ca kiểm thủ công ở trên. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| traceability | PASS (theo thông báo của brief, chưa chạy lại) | Không có mâu thuẫn dò được từ phía công cụ. |
| Rà soát thủ công với backend U1 | `AppDbContext` không sealed, `DbConstraintNames.DepartmentNameUnique = "ux_departments_name"` khớp tên chỉ mục | Cách test bằng lớp con của `AppDbContext` ném lỗi sẵn là khả thi. Tên chỉ mục khớp với U1. |

### Summary

NFR của U3 đủ đo được và bám sát các điểm đã nêu ở lần rà soát thiết kế. Có bốn điểm nhỏ nên làm rõ trước khi duyệt: ai chịu trách nhiệm đổi lỗi tranh chấp thành 404, công cụ đọc độ phủ, ca kiểm chữ hoa có dấu trên PostgreSQL thật, và giới hạn của InMemory. Không có điểm nào chặn việc triển khai.
