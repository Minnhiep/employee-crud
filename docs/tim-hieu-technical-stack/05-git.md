# 05. Git và GitHub: lưu lịch sử mã nguồn

> Phần trong kế hoạch: *GitHub: clone, branch, commit, pull, merge; cài đặt và chạy dự án trên máy cá nhân.*
> Dùng suốt 10 ngày. Kết quả bàn giao đầu tiên của kế hoạch là **"Source code trên Git"**.

## 1. Nói đơn giản

- **Git** giống **chức năng "Version history" của Google Docs, nhưng cho cả thư mục code**, và bạn tự quyết lúc nào thì "chụp một bản lưu". Mỗi lần chụp là một **commit**: lưu toàn bộ thay đổi kèm lời ghi chú, người làm và thời điểm.
- **GitHub** là **nơi gửi bản sao lên mạng** để cả nhóm cùng lấy về và gửi lên.
- **Branch** (nhánh) giống **bản nháp riêng**: thử tính năng mới mà không làm hỏng bản chính. Thử xong thì **merge** (gộp) vào bản chính.

## 2. Các khái niệm

| Thuật ngữ | Nghĩa |
|---|---|
| **Repository** (repo) | Thư mục dự án có Git theo dõi |
| **Working directory** | File bạn đang sửa trên máy |
| **Staging area** | "Giỏ" chứa những thay đổi sẽ đưa vào commit kế tiếp (`git add`) |
| **Commit** | Một bản lưu có ghi chú |
| **Branch** | Một dòng phát triển riêng; nhánh chính thường tên `main` |
| **Remote** (`origin`) | Bản repo trên GitHub |
| **Clone** | Tải cả repo từ GitHub về máy lần đầu |
| **Pull** | Lấy thay đổi mới từ GitHub về và gộp vào máy |
| **Push** | Gửi commit trên máy lên GitHub |
| **Merge** | Gộp một nhánh vào nhánh khác |
| **Conflict** (xung đột) | Hai bên sửa **cùng một chỗ**, Git không tự chọn được, cần người quyết |
| **Pull Request** (PR) | Trên GitHub: đề nghị gộp nhánh, có chỗ để người khác xem và góp ý trước khi gộp |

## 3. Quy trình làm hằng ngày

```bash
# Lần đầu
git clone https://github.com/<to-chuc>/<repo>.git
cd <repo>

# Mỗi tính năng mới
git switch main
git pull                                  # lấy bản mới nhất trước khi bắt đầu
git switch -c feature/employee-search     # tạo và chuyển sang nhánh mới

# ... sửa code ...
git status                                # xem file nào đã đổi
git diff                                  # xem đổi cụ thể những gì
git add .                                 # đưa thay đổi vào "giỏ"
git commit -m "Thêm tìm kiếm nhân viên theo tên và email"
git push -u origin feature/employee-search

# Lên GitHub tạo Pull Request vào main, nhờ người khác xem, rồi merge
```

Cách viết commit tốt:
- **Nhỏ và có một mục đích**, ví dụ "Thêm API xóa nhân viên". Không gộp cả ngày làm vào một commit "update".
- **Commit message nói "làm gì"**, đủ để người đọc lịch sử hiểu mà không phải mở code.
- **Chạy được trước khi commit**, ít nhất là build không lỗi.

## 4. Xung đột (conflict) và cách xử lý

Xung đột xảy ra khi bạn và người khác **sửa cùng dòng** của cùng một file. Git đánh dấu trong file:

```
<<<<<<< HEAD
const API_URL = "http://localhost:5080";
=======
const API_URL = import.meta.env.VITE_API_URL;
>>>>>>> feature/env-config
```

Cách xử lý:
1. Đọc cả hai phần và quyết định giữ phần nào, hay kết hợp cả hai.
2. Xóa các dòng đánh dấu `<<<<<<<`, `=======`, `>>>>>>>`.
3. Chạy thử lại.
4. `git add <file>`, rồi `git commit`.

**Không chọn bừa một bên** khi chưa hiểu bên kia đổi gì. Nếu chưa chắc thì hỏi người viết phần đó.

Mẹo giảm xung đột: `git pull` thường xuyên, chia việc theo file/thư mục, merge nhánh nhỏ thường xuyên thay vì để nhánh sống quá lâu.

## 5. `.gitignore`: thứ KHÔNG được đưa lên Git

| Không đưa lên | Vì sao |
|---|---|
| `bin/`, `obj/` (.NET) | File biên dịch, ai build cũng tự sinh ra |
| `node_modules/` (React) | Thư viện tải về, rất nặng; `npm install` sẽ tải lại |
| `.env` có giá trị thật | Có thể chứa địa chỉ, khóa bí mật |
| Mật khẩu database | **Bảo mật**: đã lên GitHub thì coi như lộ, kể cả khi xóa sau đó (vẫn còn trong lịch sử) |

Tạo nhanh: `dotnet new gitignore` sinh `.gitignore` cho .NET; các công cụ tạo dự án React như Vite thường tạo sẵn `.gitignore`. Nếu chưa có thì tự thêm ít nhất `node_modules/`, `dist/`, `.env`. Mật khẩu DB để trong **User Secrets**, xem [03-aspnet-core.md](03-aspnet-core.md) mục 6.

Những thứ **phải** đưa lên: code, thư mục `Migrations/`, `package.json` + `package-lock.json`, file `.csproj`, `README.md`.

## 6. Cấu trúc repo gợi ý cho bài CRUD

```
employee-crud/
├── README.md            (cài đặt, chạy, danh sách API, sơ đồ DB)
├── .gitignore
├── backend/EmployeeApi/ (ASP.NET Core)
└── frontend/employee-ui/(React)
```

README cần đủ để **người khác clone về chạy được** (đây là yêu cầu bàn giao):
1. Cần cài gì, bản nào: .NET 10 SDK, Node.js, PostgreSQL 18, Git.
2. Tạo database và đặt connection string (user-secrets).
3. `dotnet ef database update`, rồi `dotnet run`.
4. `npm install`, rồi `npm run dev`.
5. Địa chỉ mở trang và địa chỉ API.

**Cách kiểm README:** clone repo vào một thư mục mới, làm đúng theo README từ đầu. Chỗ nào phải "tự biết" thì README còn thiếu.

## 7. Lệnh hay dùng khi gặp sự cố

| Muốn | Lệnh | Ghi chú |
|---|---|---|
| Xem lịch sử | `git log --oneline --graph` | |
| Bỏ thay đổi chưa add của một file | `git restore <file>` | **Mất thay đổi**, xem kỹ trước |
| Bỏ file khỏi "giỏ" | `git restore --staged <file>` | Không mất thay đổi |
| Tạm cất thay đổi để chuyển nhánh | `git stash`, rồi `git stash pop` | |
| Hủy một commit đã push | `git revert <commit>` | Tạo commit đảo ngược, an toàn khi làm chung |

Tránh `git push --force` lên nhánh dùng chung: lệnh này **ghi đè lịch sử của người khác**.

## 8. Câu hỏi tự kiểm

1. Commit, push, pull khác nhau thế nào?
2. Vì sao nên làm trên nhánh riêng thay vì sửa thẳng `main`?
3. Xung đột xảy ra khi nào? Kể các bước xử lý.
4. Vì sao không đưa `node_modules/` và mật khẩu DB lên Git? Lỡ đưa mật khẩu lên rồi thì xóa file có đủ không?
5. `git revert` và `git restore` khác nhau thế nào?
6. Làm sao kiểm README đã đủ cho người khác chạy được?

## Nguồn

- [Pro Git book](https://git-scm.com/book/en/v2), [GitHub Docs](https://docs.github.com/en/get-started): link quen thuộc, hôm nay em chưa mở lại.
