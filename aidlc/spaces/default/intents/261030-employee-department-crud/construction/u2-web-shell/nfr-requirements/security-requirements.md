# Yêu cầu bảo mật: u2-web-shell

> **Nguồn:**
> - `inception/requirements-analysis/requirements.md` (NFR2, NFR7)
> - `inception/contract-design/contract-summary.md` C3 (CORS, `client_rules`)
> - `functional-design/rules.md` (BR2.1–BR2.4), `functional-design-questions.md` Q1 = A
> - `project.md` Forbidden (không đăng nhập, không commit bí mật)
>
> Ứng dụng không có đăng nhập. Phía giao diện, mục tiêu bảo mật là: không chứa bí mật, chỉ chạy ở đúng origin mà backend cho phép, và không để dữ liệu người dùng nhập biến thành mã chạy trên trang.

## 1. Bí mật (NFR2)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR2.1 | Frontend không chứa bí mật nào | Mọi thứ trong `frontend/` đều có thể công khai: `.env.development` chỉ có `VITE_API_BASE_URL`; không có chuỗi kết nối, mật khẩu hay khóa nào. Quét `git grep --untracked -i -n -E "(password\|pwd)\s*=" -- frontend` ra 0 dòng | NFR2, project.md Forbidden |
| NFR2.2 | Thư mục build và thư viện không vào Git | `node_modules/` và `dist/` nằm trong `.gitignore` (đã có từ U1) | team.md Way of Working |

## 2. Origin và CORS (NFR7)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR7.1 | Frontend luôn chạy đúng origin backend cho phép | Vite chạy ở `http://localhost:5173` với `strictPort`: cổng bận thì báo lỗi thay vì tự nhảy sang 5174 (lúc đó CORS chặn mọi lời gọi). Áp dụng cho cả `npm run dev` và `npm run preview` | C3 cors, review Infrastructure Design U1 |
| NFR7.2 | Không gửi thông tin đăng nhập qua CORS | `fetch` không đặt `credentials: "include"`; không đọc/ghi cookie | C3 `credentials: false` |
| NFR7.3 | Gọi đúng địa chỉ backend đã chốt | Địa chỉ gốc lấy từ `VITE_API_BASE_URL` = `http://localhost:5081` (Q1 = A); backend chạy bằng hồ sơ `http` (mặc định của `dotnet run`) và không bật chuyển hướng HTTPS, để preflight của POST/PUT/DELETE không bị hỏng | Q1, review Functional Design U2 |

## 3. Dữ liệu hiển thị (chống chèn mã)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR7.4 | Dữ liệu từ API và từ người dùng chỉ được hiển thị như chữ | Không dùng `dangerouslySetInnerHTML`, `innerHTML` hay `eval`; React tự thoát ký tự đặc biệt. Kiểm bằng `git grep -n -E "dangerouslySetInnerHTML\|innerHTML\|eval\(" -- frontend/src` ra 0 dòng | Phòng XSS: tên nhân viên, email là dữ liệu người dùng nhập (FR2) |
| NFR7.5 | Lời báo lỗi không lộ chi tiết kỹ thuật | Giao diện chỉ hiện `title`/`detail`/`errors` của ProblemDetails (đã an toàn ở U1) hoặc câu chung; không in đối tượng lỗi, stack trace hay URL nội bộ ra màn hình | C3 client_rules, NFR2.3 của U1 |

## 4. Không áp dụng

- Xác thực, phân quyền, token: không có đăng nhập (`project.md` Forbidden).
- Content Security Policy qua header: chạy dev trên máy, không có máy chủ web riêng; không đặt ở phạm vi này.
- Mã hóa dữ liệu ở trình duyệt: không lưu dữ liệu ở trình duyệt (không `localStorage`).
