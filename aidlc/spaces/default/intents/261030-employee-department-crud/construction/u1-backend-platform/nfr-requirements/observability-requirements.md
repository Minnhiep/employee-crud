# Yêu cầu quan sát (log): u1-backend-platform

> **Nguồn:** `functional-design/rules.md` (BR1.6, BR3.2), `inception/requirements-analysis/requirements.md` (NFR2, NFR6), `team-practices.md` (không có môi trường production).
>
> Chỉ chạy trên máy cá nhân, nên **không cần** dashboard, cảnh báo, truy vết phân tán hay SLO. Mục tiêu duy nhất: khi có lỗi, Hiệp đọc log ở cửa sổ `dotnet run` là biết lỗi gì, ở đâu.

| ID | Yêu cầu | Đo / kiểm | Luật |
|---|---|---|---|
| NFR6.1 | Log ra cửa sổ console bằng logger có sẵn của ASP.NET Core. Mức mặc định Information; riêng EF Core để Warning, để không ngập câu SQL | Chạy `dotnet run`, nhìn console | BR3.2 |
| NFR6.2 | Mỗi lỗi 500 ghi đúng một dòng mức Error gồm: phương thức, đường dẫn, loại lỗi, thông điệp. Ở Development có kèm stack trace **trong log** (không bao giờ trong phản hồi) | Gây lỗi 500 trong test, đọc log | BR1.6 |
| NFR6.3 | Lỗi 4xx (400/404/409) **không** ghi mức Error, vì đó là lỗi của người dùng, không phải lỗi hệ thống; ghi mức Information hoặc không ghi | Rà code | BR1.1–BR1.3 |
| NFR2.5 | Log không chứa chuỗi kết nối, mật khẩu hay toàn bộ body request | Rà code; `git grep` | BR3.2 |
