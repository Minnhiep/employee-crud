# Hướng dẫn kiểm thử: kiem-cuoi-crlf

## Khung test và cấu hình

- Không thêm khung test mới. Việc này sửa cấu hình repo, nên phép kiểm hồi quy là các lệnh sẵn có: Prettier của dự án (`frontend/node_modules`, gọi qua `npm run format:check`) và Git (`git ls-files --eol`, `git check-attr`).
- Bộ test hiện có: xUnit trong `backend/EmployeeCrud.Api.Tests` (148 test), chạy bằng `dotnet test`. Không đổi file test nào ngoài comment (nếu Smart App Control buộc phải thêm, theo luật dự án).

## Lệnh chạy (đúng phạm vi việc này)

Chạy từ gốc repo.

1. Phép kiểm hồi quy chính (Prettier trên đúng các file bị lỗi):
   `npm --prefix frontend run format:check`
   - Trước khi sửa: thất bại, báo 29 file. Sau khi sửa: đạt ("All matched files use Prettier code style!").
2. Kiểu xuống dòng của file (Git Bash), toàn repo kể cả `aidlc/` (từ Step 10):
   `git ls-files --eol | grep -E 'i/(crlf|mixed)|w/(crlf|mixed)'`
   - Đạt khi lệnh không in dòng nào (grep thoát mã 1).
   - Với file trong `aidlc/` không có thay đổi chưa commit: `git hash-object --no-filters <file>` trùng `git rev-parse :<file>`, tức byte trên đĩa giống hệt bản Git đang lưu.
3. Thuộc tính Git áp lên file:
   `git check-attr text eol -- frontend/src/App.tsx backend/EmployeeCrud.Api/Program.cs`
   - Đạt khi mỗi file báo `text: auto` và `eol: lf`.
4. Không đổi nội dung ngoài xuống dòng:
   `git diff --ignore-cr-at-eol --stat`
   - Đạt khi danh sách chỉ khác đường cơ sở (ghi ở `code-summary.md` Step 1) thêm `.editorconfig` và `README.md`.
5. Bộ test hiện có, chạy riêng một lệnh:
   `dotnet test backend/EmployeeCrud.slnx`
   - Đạt khi 148/148 qua. Nếu bị Smart App Control chặn (lỗi 0x800711C7), ghi lại thông báo lỗi; xử lý theo FR4.2.

## Mục tiêu độ phủ

- Việc này không đổi code ứng dụng nên không có dòng code mới để đo. Mức sàn của dự án (ít nhất 80% số dòng của các lớp service) được Build and Test kiểm trên toàn bộ test; lần đo gần nhất (03/11) là 100% cho `DepartmentService`, `EmployeeService`. Không đổi ngưỡng nào.

## Mock, stub và dữ liệu test

- Không cần mock hay dữ liệu test mới. Phép kiểm hồi quy chạy trên chính các file của repo.
- Bộ test xUnit giữ nguyên: dùng database giả lập trong bộ nhớ, không chạm `employee_db`.
