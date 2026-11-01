# Những gì bên ngoài các Bolt cần tới

> **Nguồn:** `practices-discovery/team-practices.md` (Deployment), `project.md` (Tech Stack, phần mềm đã cài, kiểm ngày 2026-10-30), `bolt-plan.md`, `delivery-planning-questions.md` (Q4).
>
> **Bolt** là một lượt làm trọn một phần việc, kết thúc bằng thứ chạy được. Dự án không có API bên ngoài, không có nhóm khác và không cần ai khác phê duyệt. Các phụ thuộc bên ngoài chỉ là phần mềm trên máy Hiệp, mạng để tải gói, và chính Hiệp.

| Thứ cần | Ai lo | Thời gian chờ | Chặn Bolt nào | Nếu trễ hoặc hỏng |
|---|---|---|---|---|
| PostgreSQL 18.6 đang chạy (dịch vụ `postgresql-x64-18`, cổng 5432) và pgAdmin 4 | Hiệp (đã cài) | Không | B1, B3, B4 | Hiệp bật lại dịch vụ. AI chỉ cách kiểm, không tự sửa máy |
| Database `employee_db` và mật khẩu trong user-secrets | **Hiệp tự làm** theo hướng dẫn (Q4) | Vài phút | B1 (kiểm kết nối), B3 (migration) | Hiệp dán lỗi, AI chỉ cách sửa. Chưa xong thì không sang B3 |
| .NET SDK 10.0.403 | Hiệp (đã cài) | Không | B1, B3, B4 | — |
| Node.js 24.15 và npm 11.16 | Hiệp (đã cài) | Không | B2, B3, B4 | — |
| Mạng để tải gói NuGet (Npgsql EF Core, xUnit, coverlet, `dotnet-ef`) và gói npm (React Router, ESLint, Prettier) | Kho NuGet và npm công khai | Vài phút | B1, B2 | Không có mạng thì dừng Bolt, thử lại sau. Mọi gói cài **cục bộ trong dự án**, không cài toàn máy (`project.md` Forbidden) |
| Chứng chỉ HTTPS localhost của .NET | Hiệp (đã tin cậy chứng chỉ, kiểm 30/10) | Không | B1 | Nếu trình duyệt báo lỗi chứng chỉ, AI chỉ lệnh kiểm |
| Chrome hoặc Edge, có Lighthouse trong DevTools | Hiệp | Không | B2–B4, Build and Test | — |
| Postman | Hiệp (đã cài) | Không | B1, B3, B4, B5 | — |
| Duyệt ở các gate và điểm kiểm | Hiệp | Tùy Hiệp | Mọi Bolt | Bolt đứng chờ, không có hậu quả gì |
| Đẩy lên GitHub | Hiệp tự làm sau khi xong bài | — | Không chặn Bolt nào | — |
