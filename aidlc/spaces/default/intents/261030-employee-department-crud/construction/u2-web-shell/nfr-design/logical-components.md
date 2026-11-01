# Các thành phần logic: u2-web-shell

> **Nguồn:** `functional-design/frontend-components.md`, `nfr-design/performance-design.md`, `nfr-design/security-design.md`, `nfr-requirements/tech-stack-decisions.md`.
>
> **Cập nhật 2026-11-01:** frontend dùng TypeScript (Hiệp chọn). Tên file `.jsx` dưới đây là `.tsx`, `.js` trong `src/` là `.ts`; thêm `tsconfig.json`; `vite.config.js` đổi thành `vite.config.ts`; `eslint.config.js` giữ đuôi `.js` (ESLint đọc trực tiếp, không cần thêm gói).

## 1. Bố cục thư mục `frontend/` (chốt từ U2 để U3, U4 theo)

```
frontend/
  index.html                 (lang="vi", meta, title "Quản lý nhân sự")
  vite.config.js             (cổng 5173 strictPort cho dev và preview)
  eslint.config.js           (của Vite)
  .prettierignore
  .env.development           (VITE_API_BASE_URL=http://localhost:5081)
  package.json, package-lock.json
  public/                    (favicon)
  src/
    main.jsx, App.jsx
    api/client.js
    components/              (AppLayout, NavMenu, StatusMessage, Toast, DataTable, ErrorSummary, FormField)
    hooks/                   (usePageTitle, useSubmitGuard)
    pages/                   (EmployeesPage, DepartmentsPage, NotFoundPage)
    styles/                  (tokens.css, base.css, components.css)
```

## 2. Thành phần

| Thành phần | Trách nhiệm | Mẫu NFR áp dụng | Khi hỏng thì ảnh hưởng |
|---|---|---|---|
| `client.js` | Mọi lời gọi API: địa chỉ gốc, JSON, hạn 10 giây, đọc ProblemDetails, đổi lỗi thành `ApiError` | Hạn giờ + hủy (NFR5.3), không gọi lại, không lộ chi tiết (NFR7.5) | Mọi trang không lấy được dữ liệu; trang hiện `StatusMessage error`, không trắng trang |
| Router (`App.jsx`) | Bảng đường dẫn, chuyển hướng `/`, trang 404 | Điều hướng phía trình duyệt (NFR5.2) | Gõ sai địa chỉ thì vào 404, không trắng trang |
| `AppLayout`, `NavMenu` | Khung, liên kết bỏ qua, menu | WCAG 2.4.1, 1.4.1 (NFR8.2) | Ảnh hưởng mọi trang (lỗi hiển thị) |
| `usePageTitle` | Tiêu đề tab, focus `h1` | WCAG 2.4.2, 2.4.3 | Mất tiêu đề tab / focus, không mất dữ liệu |
| `useSubmitGuard` | Chặn gửi đôi | Cờ đồng bộ `useRef` (AC4.4.1) | Có thể tạo bản ghi trùng (backend vẫn chặn trùng email / tên ở mức database) |
| `StatusMessage`, `Toast`, `ErrorSummary`, `FormField`, `DataTable` | Hiện trạng thái, thông báo, lỗi, bảng | Vai trò ARIA đúng (WCAG 4.1.3) | Chỉ ảnh hưởng phần hiển thị đó |
| CSS (`tokens`, `base`, `components`) | Một bộ biến chung | Tương phản, focus, `rem` (NFR8.2) | Giao diện lệch chuẩn ở mọi trang |

## 3. Ranh giới hỏng

- **Backend tắt hoặc chậm:** chỉ phần dữ liệu của trang báo lỗi kèm "Thử lại"; khung trang, menu vẫn dùng được.
- **Lỗi JavaScript khi vẽ một trang:** React gỡ cả cây và trang trắng. Phạm vi này **không** thêm Error Boundary (không có trong thiết kế, thêm khái niệm mới); console sẽ có lỗi và Build and Test bắt được qua NFR8.4.

## 4. Tài nguyên dùng chung với unit khác

| Tài nguyên | Chủ | Dùng bởi |
|---|---|---|
| Backend `http://localhost:5081` (CORS cho `http://localhost:5173`) | U1 | `client.js` |
| `client.js`, component, hook, CSS | U2 | U3, U4 |
| `App.jsx` (bảng đường dẫn) | U2 | U3, U4 thêm đường dẫn form và thay trang danh sách |

## 5. Chuyển tiếp sang Infrastructure Design

Không có hạ tầng: frontend chạy bằng `npm run dev` (dev server của Vite) trên máy; bản build chỉ dùng để đo chất lượng (`npm run preview`).
