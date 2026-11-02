## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T18:01:43Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | README.md > mục 3 "Đặt connection string bằng user-secrets" | README viết `Remove-Variable p, s` "xóa nó khỏi bộ nhớ". Thực tế lệnh này chỉ bỏ tên biến; chuỗi mật khẩu dạng văn bản vẫn nằm trong bộ nhớ tiến trình PowerShell cho tới khi bị thu dọn, và dòng `PtrToStringAuto(SecureStringToBSTR(...))` không giải phóng vùng BSTR. Phần "không vào lịch sử PowerShell" thì đúng. | Sửa câu giải thích thành "bỏ biến sau khi dùng" (không hứa xóa khỏi bộ nhớ), hoặc thêm `ZeroFreeBSTR`. Đây chỉ là chỗ nói quá, không ảnh hưởng chạy. | Resolved (reviewer) |
| R-02 | Minor | README.md > mục 11 "Sự cố thường gặp", lỗi Smart App Control | README bảo "chỉnh Smart App Control trong Windows Security, cân nhắc trước khi làm" nhưng không nói rõ hệ quả. Theo hiểu biết của tôi (chưa kiểm trên máy), trên Windows 11 tắt Smart App Control thường không bật lại được nếu không cài lại hệ điều hành. Người làm theo README có thể tắt mà không biết. | Thêm một câu nêu rõ hệ quả này (hoặc ghi "chưa kiểm") và gợi ý thử build lại trước. Kiểm với tài liệu Microsoft rồi mới khẳng định. | Resolved (reviewer) |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/code-generation/unit-test-instructions.md > dòng T6 | Tiêu chí T6 chỉ cho phép chữ giữ chỗ `<mật-khẩu-của-bạn>`, nhưng README đã đổi sang `$p` và mẫu che `***`. Chạy T6 hôm nay ra 3 dòng (README.md dòng 48, 57, 60), đều không có mật khẩu thật; code-summary đã ghi nhận chỗ lệch này. Tiêu chí chưa được cập nhật. | Sửa cột "Đạt khi" của T6 thành "mọi dòng khớp chỉ chứa biến `$p` hoặc `***`". Không cần đổi tài liệu. | Resolved (reviewer) |
| R-04 | Minor | docs/danh-sach-api.md > Quy ước chung và mục "Lỗi 400" | Tài liệu ghi đúng hành vi thật: lỗi 400 trả `application/json` và thiếu trường `type`, khác FR4/C3 (yêu cầu `application/problem+json`). Người đọc handover sẽ thấy 404/409 và 400 có hai kiểu khác nhau mà không rõ đó là lệch đã biết. Việc này đã nằm trong danh sách chuyển cho Build and Test (mục 4), nhưng chưa có ghi chú ngay trong tài liệu. | Thêm một dòng trong tài liệu (ví dụ "đây là hành vi hiện tại, đang chờ xem xét") để người đọc không tưởng là lỗi tài liệu. Việc sửa code do Build and Test quyết. | Resolved (reviewer) |
| R-05 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/code-generation/code-summary.md > §3.6 và §5 mục 2 | Hai điểm cần Hiệp nắm khi duyệt. (a) README chưa được chạy từ đầu trên máy trắng: bước đặt user-secrets lần đầu và tạo database mới chỉ kiểm bằng cách đọc lệnh (đã ghi là hạn chế cùng máy). (b) `ErrorMapper` chưa nhận SQLSTATE 23001, nên khi hai thao tác chen nhau, xóa phòng ban có thể trả 500 thay vì 409; tài liệu API mô tả 409 chỉ đúng trên đường đi qua Service. Cả hai đã được ghi đúng chỗ. | Không cần sửa U5. Hiệp nhớ rằng hai điểm này là rủi ro còn mở, và (b) cần xử lý ở Build and Test. Thư mục `C:UsersASUSthu-clone-employee-crud` ngoài dự án cũng cần Hiệp tự quyết giữ hay xóa. | Accepted risk |
| R-06 | Suggestion | README.md > mục 3, khối lệnh `Read-Host` | Mật khẩu có ký tự đặc biệt của chuỗi kết nối (dấu `;`, `=`) sẽ làm hỏng connection string. Tôi chưa kiểm hành vi này, đây là suy luận từ cú pháp. Ngoài ra khối lệnh chỉ chạy trong PowerShell và chưa có ghi chú về điều đó. | Nếu muốn, thêm một dòng cảnh báo mật khẩu có `;` hoặc `=` cần bao trong dấu nháy. Không chặn bàn giao. | New |

> R-01 Reviewer note: README mục 3 nay viết `Remove-Variable` "bỏ hai biến sau khi dùng", nói rõ không hứa xóa sạch khỏi bộ nhớ, gợi ý đóng cửa sổ PowerShell (diff 4bde213..HEAD).

> R-01 Earlier decision: Accepted risk

> R-02 Reviewer note: README mục 11 nay bảo thử build lại trước, cảnh báo tắt Smart App Control có thể không bật lại được nếu không cài lại Windows, ghi "tùy phiên bản; chưa kiểm trên máy làm bài".

> R-02 Earlier decision: Accepted risk

> R-03 Reviewer note: Cột "Đạt khi" của T6 nay cho phép biến `$p`, mẫu `***` hoặc chữ giữ chỗ. Chạy T6 ra 3 dòng (README.md dòng 48, 57, 60), đều khớp tiêu chí mới.

> R-03 Earlier decision: Accepted risk

> R-04 Reviewer note: `docs/danh-sach-api.md` có ghi chú "Lệch đã biết" dưới ví dụ lỗi 400 và dòng Quy ước chung ghi 400 thiếu `type`. Tôi đã đối chiếu `frontend/src/api/client.ts`: `readProblem` (dòng 189-193) chỉ đọc body khi Content-Type chứa `application/problem+json`, nên nhận định về ảnh hưởng tới giao diện là đúng.

> R-04 Earlier decision: Accepted risk

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| T1 | `10` | Đủ 10 thao tác API. |
| T2 | 4 dòng: `#### Lỗi 400` (226), `#### Lỗi 404` (250), `#### Lỗi 409` (270 và 292); `application/problem+json` = 5 | Đủ 400, 404, 409 và số lần xuất hiện ≥ 3. |
| T3 | `erDiagram` (15), `departments {` (17), `employees {` (21) | Đủ 3 dòng. |
| T4 | 12 mục `## 1.` đến `## 12.` | Đủ các mục theo FR7.4. |
| T5 | 4 dòng (86, 121, 161, 162), mỗi tài liệu có ít nhất một dòng | Đạt. |
| T6 | 3 dòng: README.md 48 (`Password=$p`), 57 và 60 (`Password=***`) | Không có mật khẩu thật; khớp tiêu chí T6 đã sửa. |
| `git diff 4bde213 HEAD --stat` | Chỉ `README.md` (+31/-6) và `docs/danh-sach-api.md` (+3/-1) | Không đụng code, đúng BR4.1. |

### Summary

Bốn điểm R-01 đến R-04 đã được sửa đúng nội dung, T1 đến T6 chạy lại đều đạt, và diff chỉ chạm hai file tài liệu. Nhận định rằng lỗi 400 làm giao diện mất lời báo theo ô khớp với mã `client.ts`; việc sửa nằm ở Build and Test như đã ghi trong code-summary mục 5. Tôi không chạy backend, build hay test.
