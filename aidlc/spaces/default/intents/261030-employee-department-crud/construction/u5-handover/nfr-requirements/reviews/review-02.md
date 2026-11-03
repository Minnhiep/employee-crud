## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-04
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/security-requirements.md > NFR2.1 (cột "Kiểm bằng cách nào") | NFR2 gốc đòi "không có mật khẩu trong bất kỳ file nào được commit", nhưng cách kiểm chỉ là `git grep`, mà `git grep` chỉ quét cây làm việc hiện tại, không quét lịch sử commit. Repo đã có nhiều commit (U1 đến U4) và Hiệp sắp đẩy lên GitHub, nên một mật khẩu lỡ commit rồi xóa ở commit sau vẫn còn trong lịch sử và vẫn bị lộ khi đẩy. | Thêm bước quét lịch sử, ví dụ `git log -p -S"<chuỗi>"` hoặc `git grep` trên các commit cũ (Hiệp tự gõ chuỗi mật khẩu, không ghi vào tài liệu). Nếu tìm thấy trong lịch sử thì báo Hiệp trước khi đẩy lên GitHub. | Accepted risk |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/security-requirements.md > NFR2.1 | Cách kiểm chỉ tìm "chuỗi mật khẩu thật", nên nếu file cấu hình (ví dụ `appsettings*.json`, `.env`) chứa mật khẩu dưới dạng khác thì dễ sót. Quy tắc team.md cũng đòi `.gitignore` loại `.env` và file chứa mật khẩu, nhưng NFR2.x không có dòng nào kiểm điều này. | Thêm một dòng kiểm: `.gitignore` có loại `.env`, `bin/`, `obj/`, `node_modules/`, `dist/`; và `git grep -i "password="` trên `appsettings*.json` không ra giá trị thật. | Accepted risk |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/tech-stack-decisions.md > NFR1.1 | NFR1 gốc đòi chạy được "từ bản clone sạch", nhưng cách kiểm (Hiệp clone trên cùng máy) có hạn chế: user-secrets và database `employee_db` đã có sẵn, nên chưa chứng minh được README đủ bước cho người cài mới. BR4.3 có ghi hạn chế này nhưng NFR1.1 thì không. | Ghi rõ hạn chế vào cột kiểm của NFR1.1 và yêu cầu kết quả đối chiếu nêu những bước (tạo database, đặt user-secrets) chỉ được kiểm bằng cách đọc, không bằng cách chạy. | Accepted risk |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/security-requirements.md > NFR2.4 | Ca thử "chèn email trùng" cần một dòng có sẵn để trùng; nếu Hiệp chèn dòng mồi cho thử thì cuối cùng phải xóa dòng đó, nhưng chỉ có "đếm lại bằng pgAdmin" là cách kiểm, dễ bỏ sót dòng mồi nếu số đếm trùng ngẫu nhiên. | Ghi rõ dùng một nhân viên có sẵn làm dòng mồi (không chèn mới), hoặc nếu chèn mới thì liệt kê câu lệnh xóa đúng dòng đó. | Accepted risk |
| R-05 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/traceability.json > upstream_ids | Danh sách `upstream_ids` chỉ có NFR1 đến NFR8. Tuy vậy các dòng bảo mật và công cụ còn dựa vào FR7.1 đến FR7.4 và BR1.3, BR1.5, BR2.4, BR3.2. Bốn hàng NFR đều khớp tệp, nhưng người đọc không thấy được dòng NFR nào sinh từ luật nào. | Tùy chọn: thêm trường nối mỗi NFR2.x, NFR7.1 với BR tương ứng (đã có ở cột "Luật liên quan") để dễ truy vết. Không bắt buộc với bản "Làm gọn". | Accepted risk |
| R-06 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/security-requirements.md > Change Request 03/11/2026 (FR8) mục (1) | Yêu cầu nói khối xóa "chỉ xóa dữ liệu mẫu `@congty.example`", nhưng câu SQL xóa mọi email có đuôi này, kể cả người tự nhập. | Đổi lời thành "mọi người có email đuôi `@congty.example`". | New |
| R-07 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/security-requirements.md > mục (3) | Yêu cầu hiệu năng AC6.6.3 (trung vị 1 giây, Lighthouse 90) chưa có số đo cho Lighthouse; mới có API trung vị 3,4 ms với 83 người, không phải 80. | Ghi rõ Lighthouse còn chờ đo ở Build and Test, và số liệu API đo trên 83 người. | New |
| R-08 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-requirements/security-requirements.md > mục (2) | Chưa nêu rằng file chỉ dành cho database demo trên máy; file dùng quyền `postgres` trong pgAdmin, và khối xóa có thể xóa phòng cùng tên đang rỗng. | Thêm một dòng: chỉ chạy trên database demo, không chạy trên dữ liệu thật. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đối chiếu bằng tay | Email `.example` (RFC 2606), tên giả, không bí mật nào trong file SQL | Phù hợp luật Forbidden về bí mật. |

### Summary

Yêu cầu phi chức năng của Change Request nhỏ và hợp lý, không có vấn đề chặn; cần ghi chính xác hơn phạm vi xóa và trạng thái đo Lighthouse.
