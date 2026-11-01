# Lựa chọn công nghệ: u2-web-shell

> **Nguồn:** `project.md` (Tech Stack, Forbidden), `team.md` (Code Style Q9, Way of Working Q3), `inception/refined-mockups/` (Q1 CSS thuần, Q8 không chia nhỏ code), `inception/domain-design/decisions.md` (ADR-005), `functional-design-questions.md` Q1, `requirements.md` (NFR1, NFR6, NFR8).

## 1. Lựa chọn

| ID | Hạng mục | Chọn | Vì sao | Phương án bị loại |
|---|---|---|---|---|
| NFR1.1 | Chạy trên máy | Node.js 24 + npm 11 đã cài; `npm install` rồi `npm run dev` trong `frontend/` | Đúng NFR1; máy đã có (kiểm 30/10) | Docker (bị cấm) |
| NFR6.1 | Ngôn ngữ, khung | React + **TypeScript** (`strict`, `.tsx`/`.ts`), kiểm kiểu bằng `tsc` khi build. **Hiệp đổi từ JavaScript sang TypeScript ngày 2026-11-01** (project.md Tech Stack đã cập nhật) | Chuẩn của dự án React chuyên nghiệp: trình soạn thảo bắt lỗi kiểu dữ liệu sớm, props và dữ liệu API có kiểu rõ ràng, dễ phát triển lâu dài | JavaScript thuần (ít an toàn kiểu hơn); Next.js (bị cấm) |
| NFR6.2 | Điều hướng | React Router (gói `react-router`, bản ổn định mới nhất lúc dựng), chế độ khai báo `BrowserRouter` + `Routes` | Chuyển trang không tải lại (NFR5.2); cách khai báo dễ đọc nhất cho người mới | Tự viết router; chế độ data router (thêm khái niệm loader/action chưa cần) |
| NFR6.3 | Quản lý trạng thái | `useState`/`useEffect` của React, mỗi trang tự giữ dữ liệu của mình | Hai trang đơn giản, không chia sẻ trạng thái | Redux (bị cấm), Zustand, React Query (thêm thư viện, khó giải thích) |
| NFR6.4 | Gọi API | `fetch` có sẵn của trình duyệt + `AbortController`, gói trong `src/api/client.js` | Không thêm thư viện; thấy rõ request/response khi học | axios (thêm thư viện, không cần) |
| NFR6.5 | Giao diện | CSS thuần, ba file `tokens.css`, `base.css`, `components.css`, đặt tên class kiểu BEM | Refined Mockups Q1; không thêm thư viện | Tailwind, Bootstrap, CSS-in-JS |
| NFR8.6 | Lint | ESLint 10 theo mẫu Vite cho React + `typescript-eslint` (`npm run lint`, không cho phép cảnh báo). Bản Vite mới tạo sẵn oxlint; Hiệp chọn công cụ chuẩn nhất khi đi làm nên dùng ESLint (2026-11-01) | team.md Q9; ESLint phổ biến nhất, nhiều plugin | oxlint (mới, ít dự án dùng); `eslint-plugin-jsx-a11y` (chưa hỗ trợ ESLint 10, kiểm accessibility bằng Lighthouse thay thế) |
| NFR8.7 | Định dạng | Prettier, cài **cục bộ** làm devDependency, cấu hình mặc định; thêm script `npm run format` | team.md Q9; không cài `-g` (project.md Forbidden) | Prettier toàn máy |

## 2. Không thêm

- Không thư viện test cho React (team.md: không viết test tự động cho React).
- Không thư viện biểu tượng: dùng ký tự ✓, (!) có sẵn kèm `aria-hidden`.
- Không font tải từ mạng: dùng font hệ thống (`design-system-mapping.md` mục 3), giúp NFR5.1.

## 3. Phiên bản

Phiên bản cụ thể của Vite, React, React Router, ESLint, Prettier do `npm` chọn lúc dựng (Code Generation ghi lại bản thật vào `code-summary.md`); `package-lock.json` được commit để mọi lần `npm install` ra cùng bản.
