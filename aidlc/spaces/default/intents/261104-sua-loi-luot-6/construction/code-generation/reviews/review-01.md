## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-04T07:37:12Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | backend/EmployeeCrud.Api/EmployeeCrud.Api.http > thao tác 2 "Thêm phòng ban (tên trùng, kể cả khác hoa thường, sẽ ra 409)" | Thân yêu cầu là tên "Thử nghiệm", không có trong 4 phòng ban mẫu, nên lần chạy đầu ra 201 chứ không phải 409. Nhãn vẫn nói "sẽ ra 409". FR5.1 yêu cầu ví dụ ghi 409 phải chạy ra 409 hoặc đổi nhãn; thao tác 5 đã được sửa đúng cách này, thao tác 2 thì chưa. Thao tác 7 (email trùng ra 409) có thể cùng lỗi, chưa đối chiếu được thân yêu cầu. | Đổi nhãn thao tác 2 thành "lần đầu ra 201, gửi lại lần hai mới ra 409", hoặc đổi tên trong thân thành một phòng đã có. Rà thao tác 7 theo cách đó. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261104-sua-loi-luot-6/construction/code-generation/code-summary.md > bảng "Kết quả kiểm" | Phần Giả định của yêu cầu và Step 1 của kế hoạch bắt kiểm dữ liệu đang có (83 nhân viên, 9 phòng ban) không chứa noncharacter trước khi sửa, nhưng bản tóm tắt không ghi kết quả. Người duyệt không thấy bằng chứng rằng luật mới không làm hỏng bản ghi cũ (bản ghi cũ chứa noncharacter sẽ không sửa được nữa vì bị trả 400). | Thêm một dòng vào bảng ghi kết quả kiểm dữ liệu hiện có: số bản ghi đã đọc và số bản ghi có noncharacter. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261104-sua-loi-luot-6/construction/code-generation/traceability.json > coverage FR2.1, FR6.2 | Mỗi yêu cầu chỉ trỏ tới một file. FR2.1 sửa 6 file C# nhưng chỉ nêu `DepartmentService.cs`. FR6.2 sửa các file `00`–`05` nhưng chỉ nêu file `00`. Người lần theo từ yêu cầu sang code sẽ bỏ sót phần còn lại. | Thêm các file còn lại vào mục tương ứng, hoặc ghi "xem `git diff`" cho hai yêu cầu nhiều file. | New |
| R-04 | Minor | frontend/src/pages/employees/EmployeeFormPage.tsx > khối `catch` sau `hasLeftFormRef.current`; frontend/src/pages/departments/DepartmentFormPage.tsx > khối `catch` tương ứng | Khi người dùng đã rời form và lần lưu sau đó lỗi, chỉ có `console.error`: người dùng tưởng đã lưu mà thực ra không. Kế hoạch (R-05) và `code-summary.md` đã ghi đây là giới hạn đã biết và Hiệp đã chấp nhận ở bước duyệt yêu cầu, nên không chặn. | Chỉ để Hiệp cân nhắc lần cuối. Nếu giữ, bảo đảm ghi vào danh sách "em đề xuất" việc thêm vùng thông báo chung. | New |
| R-05 | Minor | backend/EmployeeCrud.Api/Platform/Text/TextInput.cs > doc comment của `TryNormalize` | Câu liệt kê thiếu dấu phẩy: "… (ví dụ U+200B, U+202E) ký tự Unicode hỏng (nửa cặp surrogate) hoặc noncharacter …". Câu đọc như hai mục dính nhau, trong khi Hiệp cần đọc to được comment này. | Thêm dấu phẩy sau "(ví dụ U+200B, U+202E)". | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Không có công cụ kiểm tra cho stage này | Không áp dụng | Không có gì để chạy. Người điều phối đã chạy `npm --prefix frontend run verify`, mã thoát 0, 146/146 test; tôi không chạy lại. |

**Đã tự đối chiếu bằng đọc mã:** `IsNoncharacter` chặn đúng 66 mã (U+FDD0–U+FDEF và `& 0xFFFE == 0xFFFE` cho mọi mặt phẳng); nó chạy sau bước kiểm nửa cặp surrogate nên `char.ConvertToUtf32` không ném lỗi. Biểu thức `\p{Noncharacter_Code_Point}` ở frontend khớp cùng tập mã. `parseId` (1 đến 2147483647, không số 0 đầu) khớp `int.TryParse` ở `ParseDepartmentFilter` và ràng buộc `{id:int}` của controller, chỉ chặt hơn ở số 0 đầu, đúng như trước khi sửa. Cờ `hasLeftFormRef` được đặt lại khi gắn nên chịu được StrictMode. Hộp xác nhận xóa gọi `setPending(null)` trước `onError`, nên `useEffect` đưa focus về tiêu đề chạy sau khi hộp đã đóng. Test hủy request dùng bộ đếm `SlowRequestsStarted` và chờ theo điều kiện; `Logs.Entries` đọc từ `ConcurrentQueue` nên không có đua dữ liệu. Các dòng sửa trong `docs/danh-sach-api.md`, `docs/so-do-database.md` khớp code và `docs/du-lieu-mau.sql` (4 phòng ban, 80 nhân viên).

### Summary

Thay đổi nhỏ, đúng phạm vi bugfix, không có lỗi kiến trúc hay tham chiếu gãy: luật noncharacter nhất quán giữa backend, form React và ô tìm, và các giới hạn của FR3.3 đã được ghi lại. Còn 5 điểm Minor về chứng cứ và độ chính xác của tài liệu, không chặn.
