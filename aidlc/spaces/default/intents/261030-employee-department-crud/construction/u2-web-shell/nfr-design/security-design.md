# Thiết kế bảo mật: u2-web-shell

> **Nguồn:** `nfr-requirements/security-requirements.md` (NFR2.1, NFR2.2, NFR7.1–NFR7.5), `functional-design/rules.md` (BR2.1–BR2.4), `inception/contract-design/contract-summary.md` C3, review NFR Requirements U2 (`npm audit`, hồ sơ `http`).
>
> Không có đăng nhập. Ba mục tiêu: không có bí mật trong frontend, chỉ chạy ở origin backend cho phép, và dữ liệu luôn hiển thị như chữ.

## 1. Bí mật (NFR2.1, NFR2.2)

- `frontend/.env.development` chỉ có một dòng `VITE_API_BASE_URL=http://localhost:5081`. Mọi biến `VITE_*` đều lộ ra trình duyệt theo thiết kế của Vite, nên **không bao giờ** đặt bí mật vào đây.
- File này không phải bí mật nên được commit; `.gitignore` gốc chỉ loại `.env` (đúng tên), không loại `.env.development`.
- `node_modules/`, `dist/` đã nằm trong `.gitignore` gốc (U1).
- **Cách kiểm:** `git grep --untracked -i -n -E "(password|pwd)\s*=" -- frontend` ra 0 dòng (chạy cùng bước quét của backend).

## 2. Origin và CORS (NFR7.1–NFR7.3)

| Cơ chế | Thiết kế |
|---|---|
| Cổng cố định | `vite.config.js`: `server` và `preview` đều `port: 5173`, `strictPort: true`. Cổng bận thì Vite báo lỗi và dừng, thay vì tự nhảy sang 5174 (khi đó CORS của U1 chặn mọi lời gọi) |
| Không gửi thông tin đăng nhập | `fetch` dùng giá trị mặc định `credentials: "same-origin"` (không gửi cookie sang backend khác origin); không đặt `include` |
| Đúng địa chỉ backend | `client.js` đọc `import.meta.env.VITE_API_BASE_URL`, thiếu thì dùng `http://localhost:5081`. Comment trong `client.js` ghi: backend phải chạy bằng `dotnet run` (hồ sơ `http`, cổng 5081); hồ sơ `https` cũng mở 5081 nhưng không cần dùng. Đây là **phụ thuộc vào U1 đã kiểm** (U1 không có `UseHttpsRedirection`), không phải điều U2 tự bảo đảm |
| Header gửi đi | Chỉ `Content-Type: application/json` khi có body (khớp `allowed_headers` của C3). Không thêm header tự đặt, để không phát sinh preflight không cần thiết cho GET |

## 3. Dữ liệu hiển thị (NFR7.4, NFR7.5)

- Mọi dữ liệu (tên, email, lời báo API) được đưa vào JSX như chữ; React tự thoát ký tự `<`, `>`, `&`.
- Cấm `dangerouslySetInnerHTML`, gán `innerHTML`, `eval`, `new Function`. **Cách kiểm:** `git grep -n -E "dangerouslySetInnerHTML|innerHTML|eval\(|new Function" -- frontend/src` ra 0 dòng.
- `ApiError` chỉ mang `kind`, `status`, `title`, `detail`, `errors`, `message`. Giao diện chỉ hiện `message` và `errors`; không bao giờ hiện đối tượng lỗi gốc, stack trace hay URL.
- Lỗi lạ trong `client.js` (không phải lỗi HTTP) được ghi `console.error` để lập trình viên xem, rồi quy về lời báo chung cho người dùng. Lưu ý: chỉ ghi khi thật sự lỗi, để không làm bẩn console lúc dùng bình thường (NFR8.4).

## 4. Gói phụ thuộc (review NFR Requirements U2)

- Sau `npm install`, chạy `npm audit` và ghi kết quả (số lỗ hổng theo mức) vào `code-summary.md`. Không phải điều kiện chặn: gói chỉ chạy trên máy dev; nếu có lỗ hổng mức high/critical ở gói chạy trong trình duyệt (`react`, `react-dom`, `react-router`) thì báo Hiệp quyết.
- Không chạy `npm audit fix --force` tự động (có thể nâng bản lớn, đổi hành vi).

## 5. Không áp dụng

- Đăng nhập, token, phân quyền (`project.md` Forbidden).
- Content Security Policy: không có máy chủ web riêng ở phạm vi này.
- Lưu dữ liệu ở trình duyệt (`localStorage`, cookie): không dùng.
