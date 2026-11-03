## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-04
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S4 (cột "Dọn dẹp" của ca "Email trùng khác hoa thường") | Cột "Dọn dẹp" ghi "Không cần" vì tin rằng lệnh chèn chắc chắn bị từ chối. Nếu chỉ mục email trong database thật không phân biệt hoa thường như kỳ vọng (ví dụ khác với sơ đồ DB), lệnh chèn sẽ thành công, thêm một dòng nhân viên rác và không có bước dọn nào. Ngoài ra một lệnh chèn bị từ chối vẫn làm nhảy số id (sequence), nên "database không đổi" chỉ đúng với số dòng, không đúng với bộ đếm id. | Thêm một dòng dự phòng: nếu lệnh chèn bất ngờ thành công thì xóa đúng dòng vừa chèn (theo id hoặc email) rồi đếm lại, và ghi là lệch so với sơ đồ DB. Ghi chú thêm rằng bộ đếm id có thể nhảy dù lệnh bị từ chối. | Accepted risk |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S1 (bảng, hàng "Lịch sử commit cũ") | Việc quét lịch sử hiện chỉ dựa vào chuỗi mật khẩu do Hiệp gõ; nếu Hiệp quên làm hoặc gõ sai thì không có lớp chặn nào khác. Ngoài ra thiết kế chưa nói rõ phạm vi quét có gồm cả thư mục `aidlc/` (log kiểm toán, memory) cũng được commit, nơi mật khẩu có thể lọt vào nếu từng được gõ trong hội thoại. | Bổ sung một lượt quét AI chạy được mà không cần biết mật khẩu, ví dụ tìm mẫu `Password=` có giá trị thật trong `git log -p --all -G"Password="` và `git grep -i "password="`. Ghi rõ phạm vi là toàn repo gồm cả `aidlc/`. | Accepted risk |
| R-03 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S5 | Địa chỉ frontend lấy từ cấu hình Vite, nhưng Vite tự đổi sang cổng khác khi cổng mặc định đang bận; khi đó CORS sẽ chặn và người cài gặp đúng lỗi mà S5 muốn tránh. | Mục "Sự cố thường gặp" nên nhắc: nếu Vite báo cổng khác với README thì tắt tiến trình đang chiếm cổng cũ rồi chạy lại, không mở CORS. | Accepted risk |
| R-04 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S2 | "Đỗ Văn An" là tên giống người thật; thiết kế cho phép chép vào ví dụ. An toàn hơn là ưu tiên bản ghi mẫu vừa tạo (`Nguyễn Văn Mẫu`) và tránh dùng tên này. | Ưu tiên bản ghi mẫu mới tạo cho mọi JSON mẫu; chỉ dùng "Đỗ Văn An" khi bắt buộc. | Accepted risk |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > Change Request 03/11/2026 (FR8) | Thiết kế SQL đúng trên PostgreSQL 18 (`NOT EXISTS lower(name)` khớp chỉ mục `ux_departments_name`; `ON CONFLICT DO NOTHING` không cần chỉ rõ cột nên bắt được chỉ mục biểu thức `lower(email)`). Nhưng chưa nói `ON CONFLICT DO NOTHING` cũng nuốt lỗi trùng email âm thầm. | Thêm một câu: câu đếm cuối file là cách duy nhất phát hiện email bị bỏ qua. | New |
| R-06 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > Change Request 03/11/2026 (FR8) | Chưa nêu rủi ro của khối xóa: xóa theo hậu tố email (người tự nhập cũng mất) và xóa phòng cùng tên đang rỗng; mức giảm nhẹ hiện chỉ là `BEGIN/COMMIT` và việc phải bỏ `--` thủ công. | Ghi hai rủi ro này cùng cách giảm nhẹ (xem trước bằng `SELECT` cùng điều kiện). | New |
| R-07 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > Change Request 03/11/2026 (FR8) | Chưa ghi là bản xóa chưa được chạy thử (code-summary §6d: "khối gỡ chưa chạy"). | Ghi trạng thái "chưa kiểm" cho khối xóa, hoặc kiểm trước khi đóng Unit. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đọc SQL `docs/du-lieu-mau.sql` | Cú pháp hợp lệ PostgreSQL; Hiệp chạy hai lần đều ra 80 | Phần chèn đã có bằng chứng chạy thật. |

### Summary

Thiết kế bảo vệ dữ liệu của file SQL hợp lý và đúng với chỉ mục thật; chỉ cần ghi rõ các rủi ro còn lại của khối xóa chưa chạy thử.
