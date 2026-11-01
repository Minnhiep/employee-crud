# Đặc tả hạ tầng: u2-web-shell

> **Nguồn:** `nfr-design/` (performance, security, logical-components) của U2, `functional-design/functional-spec.md`, `inception/domain-design/components.md`, `inception/contract-design/contract-summary.md` (C3), `team.md` Deployment (Q8), `project.md` (không Docker, không CI/CD), hạ tầng U1 (`u1-backend-platform/infrastructure-design`, chỉ phần chung đã nêu trong contract C3).
>
> "Hạ tầng" của frontend chỉ là **Node.js trên máy của Hiệp**: dev server của Vite phục vụ giao diện, trình duyệt gọi thẳng backend U1. Không đám mây, không máy chủ web, không CDN.

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Compute model | Dev server của Vite (`npm run dev`) chạy trên Node.js 24 trong `frontend/` | `team.md` Deployment: chạy trên máy; NFR1.1 |
| Networking | Giao diện ở `http://localhost:5173` (`strictPort`); trình duyệt gọi backend `http://localhost:5081` (CORS của U1 chỉ cho đúng origin 5173). Mở đúng `localhost`, không dùng `127.0.0.1` vì CORS so sánh nguyên văn | NFR7.1, NFR7.3, review NFR Design U2 |
| Bản build | `npm run build` ra `frontend/dist/` (không commit); chỉ dùng để đo chất lượng bằng `npm run preview` ở cổng 5173 | NFR5.1, NFR8.3–NFR8.5 |
| Storage | Không lưu gì ở máy chủ hay trình duyệt | Mọi dữ liệu nằm ở PostgreSQL của U1 |
| Environments | Chỉ môi trường dev trên máy; bản build cùng địa chỉ API mặc định | `team.md` Deployment |
| IaC | Không áp dụng. Cấu hình nằm trong `vite.config.js`, `.env.development`, `package.json` | Không có tài nguyên đám mây |
| Resource sizing | Không đặt | Một người dùng |
| Chi phí | 0 đồng | Phần mềm miễn phí đã cài |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| Vite dev server | phục vụ giao diện (dev) | `server: { port: 5173, strictPort: true }` | Cổng bận thì báo lỗi, không tự đổi cổng |
| Vite preview | phục vụ bản build để đo | `preview: { port: 5173, strictPort: true }` | Phải dừng `npm run dev` trước |
| npm registry | tải gói khi `npm install` | Mặc định `registry.npmjs.org`; gói nằm trong `frontend/node_modules/` (cục bộ) | `package-lock.json` được commit để cài lại ra cùng bản; không `npm install -g` |
| Backend U1 | API JSON | `VITE_API_BASE_URL=http://localhost:5081` trong `.env.development`; cùng giá trị làm mặc định trong `client.js` (hai nơi phải giữ khớp) | Backend chạy bằng `dotnet run` (hồ sơ `http`) |
| Cache, CDN, DNS, load balancer | không có | — | Chạy trên máy |

## Shared Infrastructure

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| Origin `http://localhost:5173` | U2 (cấu hình Vite) | U1 (danh sách CORS cho phép) | Hai bên phải khớp nguyên văn |
| `src/api/client.js`, component, hook, CSS | U2 | U3, U4 | U3, U4 chỉ import; sửa phần chung thì làm trong U2 |
| `App.jsx` (bảng đường dẫn) | U2 | U3, U4 | U3, U4 thêm đường dẫn của mình |
| `.gitignore` gốc (`node_modules/`, `dist/`) | U1 (đã có) | U2 | Không cần sửa |
