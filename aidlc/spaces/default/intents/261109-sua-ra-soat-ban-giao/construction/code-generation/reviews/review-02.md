## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-09T19:39:06Z
**Iteration:** 2
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | frontend/src/pages/employees/EmployeesPage.tsx > state `staleNoticeSearch` và biến `showStaleNotice` | Câu báo "Phòng ban đã chọn không còn tồn tại" nay chỉ ẩn khi chuỗi truy vấn đổi (`staleNoticeSearch !== currentSearch`). Khi người dùng đang ở `/employees` (chuỗi rỗng) và bấm lại mục "Nhân viên" trên menu, địa chỉ không đổi, trang không gắn lại, nên câu báo vẫn còn. Trước đây mỗi lần điều hướng là một location mới không mang cờ nên câu báo tự ẩn. code-summary mục 7 chỉ kiểm F5 và lọc phòng khác, không kiểm ca này. | Cân nhắc ẩn câu báo khi `location.key` đổi (ví dụ lưu `location.key` cùng `staleNoticeSearch`), hoặc ghi ca này vào mục "Điểm cần Hiệp xem" của code-summary là hành vi chấp nhận được. | Resolved (reviewer) |
| R-02 | Minor | frontend/src/pages/employees/EmployeeFormPage.tsx > ô Email, thuộc tính `autoComplete="email"` | Form này nhập email của người khác (nhân viên), nên trình duyệt gợi ý email của chính người dùng máy là sai mục đích; trước đó là `autoComplete="off"`. code-summary mục 14.2 đã khai và đề xuất giữ `off`; đây chỉ là việc chờ Hiệp quyết, không phải lỗi giấu. | Hiệp chọn ở cổng: giữ `email` theo kế hoạch hoặc đổi lại `off` (một thuộc tính, một dòng). | Resolved (reviewer) |
| R-03 | Minor | aidlc/spaces/default/intents/261109-sua-ra-soat-ban-giao/inception/requirements-analysis/requirements.md > FR6.9 (tiêu chí Given/When/Then) so với docs/danh-sach-api.md > "Thứ tự kiểm khi sửa (PUT)" | Tiêu chí FR6.9 viết tên toàn khoảng trắng thì PUT phòng 99999 ra 404, nhưng qua API thật ra 400 vì `[Required]` chạy trước controller. Code, test (`Update_WhenMissing_ThrowsNotFound_EvenIfNameInvalid` ở tầng service) và tài liệu API đều đúng với hành vi thật và code-summary mục 14.1 đã khai. Chỉ còn tiêu chí gốc chưa khớp. | Khi kiểm cuối, kỳ vọng 400 cho ca khoảng trắng, 404 cho ca tên quá dài (đã ghi trong code-summary); không cần sửa code. | Resolved (reviewer) |
| R-04 | Minor | backend/EmployeeCrud.Api/Program.cs > `Limits.MaxRequestBodySize = 64 * 1024` và nhánh 413 | Giới hạn 64 KB và đường 413 không có test tự động (host thử không chạy Kestrel); chỉ có kiểm bằng request thật (60 KB qua, 70 KB bị 413) ghi trong code-summary. Chấp nhận được theo `team.md` nhưng sẽ không bắt được nếu ai đó sau này xóa dòng cấu hình. | Giữ nguyên; để Build and Test chạy lại request 70 KB ra 413 như một phép kiểm tay bắt buộc. | Resolved (reviewer) |
| R-05 | Minor | frontend/src/pages/employees/EmployeesPage.tsx > hàm `confirmDelete`, nhánh `catch` | Nhánh lỗi 404 và lỗi mạng vẫn không dùng địa chỉ mới nhất, nhưng cả hai nhánh này không gọi `navigate` nên không còn kéo người dùng về chỗ cũ. Chỉ nêu để Hiệp biết ca "Back trong lúc xóa" đã được xử lý ở nhánh thành công, còn nhánh lỗi không cần xử lý. | Không cần sửa. | New |
| R-06 | Minor | aidlc/spaces/default/intents/261109-sua-ra-soat-ban-giao/construction/code-generation/code-summary.md > mục 321 (ghi chú về `ui-check.js`) | `ui-check.js` có ca U05, U13, U14 dùng `isVisible({ timeout })` mà Playwright bỏ qua `timeout`, nên có thể đỏ ngẫu nhiên. Đã ghi là việc đề xuất cho Build and Test, chưa sửa. | Khi sang Build and Test, đổi các ca đó sang `waitFor` trước khi dùng kết quả làm bằng chứng. | New |

> R-01 Reviewer note: `EmployeesPage.tsx` nay gắn câu báo với `location.key` (kiểu `StaleNotice`: pha `removing` rồi `shown` kèm `locationKey`). Khóa đổi thì ẩn và quên luôn, nên bấm lại mục menu cùng địa chỉ cũng ẩn, Back không hiện lại. Bấm Tìm lại đúng chuỗi cũ chỉ gọi `reload()` nên khóa không đổi và câu báo giữ. Việc đổi state trong lúc vẽ là mẫu React cho phép; không ghi ref trong lúc vẽ. Em đọc code, chưa chạy lại trình duyệt (không được khởi động server).

> R-02 Reviewer note: `EmployeeFormPage.tsx` ô email: `autoComplete="off"` cùng `type="text"`, `inputMode="email"`, `autoCapitalize="none"`, `spellCheck={false}`; comment tiếng Việt nói vì sao.

> R-03 Reviewer note: Không đổi code, đúng kế hoạch. `unit-test-instructions.md` dòng 39 và 40 ghi kỳ vọng thật: tên toàn khoảng trắng ra 400, tên 101 ký tự ra 404. `code-summary.md` dòng 104 khớp.

> R-04 Reviewer note: Có thêm `PipelineTests.Kestrel_LimitsRequestBodyTo64Kilobytes`: đọc `IOptions<KestrelServerOptions>` từ DI và so với `64 * 1024` viết thẳng, khớp `Program.cs` dòng 20. code-summary dòng 278 ghi phép thử đổi thành 128 KB làm đúng một test đỏ. Đường 413 thật vẫn chờ kiểm bằng request 70 KB ở Build and Test.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `dotnet test backend/EmployeeCrud.slnx` | PASS: 153/153 | Khớp kỳ vọng 152 + 1 test giới hạn 64 KB |
| `npm --prefix frontend run typecheck` | PASS | Không lỗi kiểu |
| `npm --prefix frontend run lint` | PASS (`--max-warnings 0`) | react-hooks sạch; không ghi ref trong lúc vẽ |
| `git ls-files --eol -c -o --exclude-standard` (lọc `w/crlf`, `w/mixed`) | Không dòng nào | Không còn CRLF hay trộn |
| Tìm mã theo dõi (`R-0x`, `FRx`, `Step 12`) trong `frontend/src` và `*.cs` của backend | Không có | Comment trong code sạch, đúng luật dự án |

Không chạy được: kiểm trên trình duyệt thật và request 70 KB (không được khởi động backend, frontend). Đây là việc của Build and Test, không phải lý do NOT-READY.

### Summary

Cả bốn điểm trước (R-01 đến R-04) đã xử lý đúng như kế hoạch Step 12; 153/153 test, typecheck và lint đều qua, comment tiếng Việt không có mã theo dõi, và hai trang danh sách đã dùng địa chỉ mới nhất khi xóa xong. Chỉ còn hai ghi chú Minor, không chặn duyệt.
