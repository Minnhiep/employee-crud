## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-09T19:01:45Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | frontend/src/pages/employees/EmployeesPage.tsx > state `staleNoticeSearch` và biến `showStaleNotice` | Câu báo "Phòng ban đã chọn không còn tồn tại" nay chỉ ẩn khi chuỗi truy vấn đổi (`staleNoticeSearch !== currentSearch`). Khi người dùng đang ở `/employees` (chuỗi rỗng) và bấm lại mục "Nhân viên" trên menu, địa chỉ không đổi, trang không gắn lại, nên câu báo vẫn còn. Trước đây mỗi lần điều hướng là một location mới không mang cờ nên câu báo tự ẩn. code-summary mục 7 chỉ kiểm F5 và lọc phòng khác, không kiểm ca này. | Cân nhắc ẩn câu báo khi `location.key` đổi (ví dụ lưu `location.key` cùng `staleNoticeSearch`), hoặc ghi ca này vào mục "Điểm cần Hiệp xem" của code-summary là hành vi chấp nhận được. | New |
| R-02 | Minor | frontend/src/pages/employees/EmployeeFormPage.tsx > ô Email, thuộc tính `autoComplete="email"` | Form này nhập email của người khác (nhân viên), nên trình duyệt gợi ý email của chính người dùng máy là sai mục đích; trước đó là `autoComplete="off"`. code-summary mục 14.2 đã khai và đề xuất giữ `off`; đây chỉ là việc chờ Hiệp quyết, không phải lỗi giấu. | Hiệp chọn ở cổng: giữ `email` theo kế hoạch hoặc đổi lại `off` (một thuộc tính, một dòng). | New |
| R-03 | Minor | aidlc/spaces/default/intents/261109-sua-ra-soat-ban-giao/inception/requirements-analysis/requirements.md > FR6.9 (tiêu chí Given/When/Then) so với docs/danh-sach-api.md > "Thứ tự kiểm khi sửa (PUT)" | Tiêu chí FR6.9 viết tên toàn khoảng trắng thì PUT phòng 99999 ra 404, nhưng qua API thật ra 400 vì `[Required]` chạy trước controller. Code, test (`Update_WhenMissing_ThrowsNotFound_EvenIfNameInvalid` ở tầng service) và tài liệu API đều đúng với hành vi thật và code-summary mục 14.1 đã khai. Chỉ còn tiêu chí gốc chưa khớp. | Khi kiểm cuối, kỳ vọng 400 cho ca khoảng trắng, 404 cho ca tên quá dài (đã ghi trong code-summary); không cần sửa code. | New |
| R-04 | Minor | backend/EmployeeCrud.Api/Program.cs > `Limits.MaxRequestBodySize = 64 * 1024` và nhánh 413 | Giới hạn 64 KB và đường 413 không có test tự động (host thử không chạy Kestrel); chỉ có kiểm bằng request thật (60 KB qua, 70 KB bị 413) ghi trong code-summary. Chấp nhận được theo `team.md` nhưng sẽ không bắt được nếu ai đó sau này xóa dòng cấu hình. | Giữ nguyên; để Build and Test chạy lại request 70 KB ra 413 như một phép kiểm tay bắt buộc. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `dotnet test backend/EmployeeCrud.slnx` | PASS: 152/152, 0 lỗi, 0 bỏ qua | Khớp số trong code-summary (148 − 1 + 5). |
| `npm --prefix frontend run typecheck` và `lint` | PASS, mã thoát 0 | Hooks, kiểu và quy tắc ESLint không báo lỗi. |
| `git ls-files --eol -c -o --exclude-standard` (lọc `w/crlf`, `w/mixed`) | Không in dòng nào | Không có file CRLF, kể cả `global.json` và `docs/luong-xu-ly-thuc-te.md` mới. |
| Đối chiếu tên trong `docs/luong-xu-ly-thuc-te.md` (`MapPostgres`, `ValidationResponseFactory`, `splitErrors`, `readSuccess`, `toHttpError`, `showSaveError`, `EmailPattern`, `TryNormalize`, `apiPost`, mã 23001, `PayloadTooLarge`) | Đều tìm thấy trong code | Trang tài liệu khớp code. |

### Summary

Phần backend, test và tài liệu khớp yêu cầu: chỉ ba thay đổi hành vi có chủ đích (FR6.3, FR6.4, FR6.9), comment SQL khớp mã, test mới có phép thử gây lỗi trong code-summary và xanh 152/152. Giao diện: các lệch so với kế hoạch (FR7.7 dùng state, FR7.8 một phần, `usePageTitle` bỏ điều kiện replace, `autoComplete="email"`) đều được khai đầy đủ. Chỉ còn bốn điểm Minor để Hiệp cân nhắc ở cổng, không điểm nào chặn.
