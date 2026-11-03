# Tóm tắt code: u2-web-shell

> **Nguồn:** `code-generation-plan.md` (đã duyệt, sửa ngày 2026-11-01 theo yêu cầu TypeScript của Hiệp), `unit-test-instructions.md`, kết quả chạy lệnh ngày 2026-11-01.

## 1. File đã tạo

Tất cả nằm trong `frontend/` (thư mục mới). Không sửa backend và không sửa file có sẵn nào ở thư mục gốc.

| File | Việc |
|---|---|
| `package.json`, `package-lock.json` | Gói, script `dev`, `build` (`tsc` rồi `vite build`), `typecheck`, `lint`, `format`, `format:check`, `preview`; `engines.node >= 24` |
| `tsconfig.json`, `src/vite-env.d.ts` | TypeScript `strict` + `noUncheckedIndexedAccess`, chỉ kiểm kiểu (`noEmit`); kiểu cho `VITE_API_BASE_URL` |
| `vite.config.ts` | Cổng 5173 `strictPort` cho dev và preview |
| `eslint.config.js` | ESLint 10 + `typescript-eslint` + luật React Hooks + React Refresh |
| `.prettierignore`, `.env.development`, `.gitignore` (của Vite), `index.html`, `public/favicon.svg` | Cấu hình, địa chỉ API, trang HTML `lang="vi"` |
| `src/main.tsx`, `src/App.tsx` | Gắn ứng dụng, nạp CSS, bảng đường dẫn |
| `src/api/client.ts` | Gọi API: hạn 10 giây, `signal`, `ApiError` có kiểu (`network`/`server`/`client`/`aborted`) |
| `src/components/` | `AppLayout`, `NavMenu`, `StatusMessage`, `Toast`, `DataTable` (generic theo kiểu dòng), `ErrorSummary`, `FormField`, `splitErrors` |
| `src/hooks/` | `usePageTitle`, `useSubmitGuard` |
| `src/pages/` | `EmployeesPage`, `DepartmentsPage` (chỉ tiêu đề), `NotFoundPage` |
| `src/styles/` | `tokens.css`, `base.css`, `components.css` |
| Đã xóa (file mẫu của Vite) | `App.css`, `index.css`, `src/assets/*`, `public/icons.svg`, `README.md`, `.oxlintrc.json` |

**Gói (bản thật):** React 19.3.1, React DOM 19.3.1, React Router 8.5.1; khi phát triển: Vite 8.3.5, TypeScript 6.0.3, ESLint 10.14.0, typescript-eslint 8.72.1, Prettier 3.9.10, `@vitejs/plugin-react` 6.1.2. Bộ tạo dự án: create-vite 9.3.3.

## 2. Quyết định chính

| Quyết định | Vì sao |
|---|---|
| **TypeScript strict** | Hiệp chọn giữa lúc làm (2026-11-01), để code chuẩn, dễ phát triển lâu dài. Đã sửa `project.md` (Tech Stack, Forbidden) và `team.md` (Code Style) |
| **ESLint thay oxlint** | Vite mới tạo sẵn oxlint; Hiệp bảo chọn công cụ chuẩn nhất khi đi làm. ESLint 10 là bản đang được hỗ trợ. Đã thử `eslint-plugin-jsx-a11y` nhưng plugin chưa hỗ trợ ESLint 10 (bản ESLint 9 thì đã hết hỗ trợ), nên bỏ; accessibility kiểm bằng Lighthouse và danh sách WCAG |
| `FormField` nhận "hàm vẽ ô" (`children: (props) => ReactNode`) | Thay cách sao chép phần tử con (`cloneElement`) để TypeScript kiểm được `id`, `aria-*` truyền vào ô |
| `ErrorSummary` nhận `ref` như prop | React 19 cho phép, không cần `forwardRef` |
| `Toast` cập nhật state trong lúc vẽ khi có lời báo mới | ESLint (luật React Hooks mới) bắt lỗi `setState` trong effect; sửa theo cách React khuyên |
| `usePageTitle` dựa vào `location.key === "default"` | Phân biệt lần mở đầu (giữ focus đầu trang cho liên kết bỏ qua) với lần chuyển trang (focus `h1`); đúng cả khi StrictMode chạy effect hai lần |
| `client.ts` gộp `signal` của trang với hạn 10 giây (`AbortSignal.any`) | Hủy do trang → `aborted` (bỏ qua); quá hạn → `network` |
| Lệnh kiểm kiểu dùng `tsc -p tsconfig.json` thay `tsc -b` | Không sinh file `.tsbuildinfo` thừa trong repo |
| Prettier cấu hình mặc định | Theo `team.md`: nháy kép, có dấu chấm phẩy |

## 3. Khác kế hoạch ban đầu (anh đã chọn)

1. JavaScript → **TypeScript** (anh yêu cầu; kế hoạch và tài liệu U2 đã cập nhật).
2. oxlint → **ESLint 10** (anh bảo chọn cái chuẩn nhất).
3. Lệnh chạy ở phiên chính, anh duyệt từng lệnh.

## 4. Kết quả kiểm

| Kiểm | Lệnh | Kết quả |
|---|---|---|
| Kiểm kiểu | `npm --prefix frontend run typecheck` | 0 lỗi |
| Lint | `npm --prefix frontend run lint` | 0 lỗi, 0 cảnh báo |
| Định dạng | `npm --prefix frontend run format:check` | Sạch |
| Build | `npm --prefix frontend run build` | Xong: JS 258,8 KB (nén 82,3 KB), CSS 6,3 KB (nén 1,7 KB) |
| Gói chạy trong trình duyệt | `npm --prefix frontend audit --omit=dev` | 0 lỗ hổng |
| Toàn bộ gói | `npm --prefix frontend audit` | 12 mức "moderate", đều trong công cụ phát triển (ESLint, typescript-eslint qua thư viện `minimatch`); không chạy `--force` |
| Quét mật khẩu | `git grep --untracked -i -n -E "(password\|pwd)\s*=" -- frontend` | 0 dòng |
| Quét mã nguy hiểm | `git grep ... "dangerouslySetInnerHTML\|innerHTML\|eval\(\|new Function" -- frontend/src` | 0 dòng |
| Địa chỉ API | `git grep -n "5081" -- frontend` | Khớp ở `.env.development` và `client.ts` (một dòng nữa là comment) |
| Backend không bị ảnh hưởng | `dotnet test backend/EmployeeCrud.slnx` | 19/19 đạt |

**Kiểm tay (trình duyệt tự động hóa bằng Playwright, trên `npm run dev`):**

| # | Kết quả |
|---|---|
| K1 | `/` → `/employees`, tab "Nhân viên – Quản lý nhân sự" ✓ |
| K2 | Tab đầu tiên tới "Bỏ qua, tới nội dung chính" (viền 3px); Enter → focus `main#noi-dung` ✓ |
| K3 | Bấm "Phòng ban": `/departments`, không tải lại trang, tab đổi tiêu đề, mục menu `aria-current="page"`, đậm + gạch dưới ✓ |
| K4 | Focus ở `h1` "Phòng ban" ✓ |
| K5 | `/abc` → "Không tìm thấy trang"; liên kết về `/employees` ✓ |
| K6 | Quay lại → `/employees`, menu đánh dấu "Nhân viên", không tải lại ✓ |
| K7 | Tab tới mục menu: viền 3px `#1d4ed8` ✓ |
| K8 | Console: 0 lỗi, 0 cảnh báo (chỉ thông tin của chế độ dev) ✓ |

Thêm: mỗi trang đúng một `h1`, `lang="vi"`, không trùng `id`.

**Chưa kiểm ở U2 (chưa có API):** hành vi `client.ts` khi gọi thật, `StatusMessage`, `Toast`, `DataTable`, `ErrorSummary`, `FormField`, `useSubmitGuard` (đã kiểm kiểu). Lighthouse và W3C Validator đo ở Build and Test.

## 4b. Sửa sau rà soát (Hiệp chọn "Sửa ngay", 2026-11-01)

| Lỗi (rà soát, Major) | Sửa | Kiểm lại |
|---|---|---|
| `client.ts` đổi lỗi hủy/quá hạn lúc đọc body thành `server` | `readSuccess`, `readProblem` chỉ bắt `SyntaxError` (body không phải JSON); lỗi hủy được ném lại để `toApiError` phân loại `aborted` / `network` | typecheck, lint, build sạch; hành vi gọi thật kiểm ở U3 |
| Focus bị kéo về `h1` khi cùng trang đổi state/#hash | `usePageTitle` chỉ chạy lại khi `pathname` đổi; `ErrorSummary` bấm lỗi thì `preventDefault` và focus thẳng vào ô | Trình duyệt: đổi trang → focus `h1` "Phòng ban"; đổi `#hash` → focus giữ nguyên ở mục menu |

Thêm `.playwright-mcp/` (log công cụ kiểm trình duyệt) vào cuối `.gitignore` gốc (Hiệp chọn).

Điểm Minor chuyển cho U3/U4: đặt tên các bước kiểm tay K9+ cho component dùng chung (gọi API thật, hủy giữa chừng không hiện lỗi, bấm lỗi tóm tắt → focus vào ô, xóa xong focus không bị giật); số liệu `npm audit` trong kế hoạch (6) là lúc mới cài ESLint, số cuối cùng là 12 (mục 4).

## 4c. Step 9: làm lại giao diện chuẩn doanh nghiệp (03/11/2026)

Hiệp yêu cầu ở Build and Test (giao diện "như con nít, như AI làm"), chọn bố cục admin có thanh bên, tự viết CSS, chỉ đổi giao diện; khi duyệt kế hoạch dặn thêm: "chuẩn chỉnh, chuyên nghiệp như của công ty nhưng vẫn phải đúng hoàn toàn `docs/ke-hoach.md`", "như các doanh nghiệp lớn đang sử dụng".

**File:** mới `components/Icon.tsx` (13 icon SVG tự vẽ + dấu logo), `components/PageHeader.tsx` (đường dẫn trang + `h1` + mô tả + nút chính, gọi `usePageTitle`), `components/ConfirmDialog.tsx` (thẻ `<dialog>` gốc, `showModal()`); sửa `AppLayout`, `NavMenu`, `StatusMessage`, `Toast`, `ErrorSummary`, `FormField`, `DataTable`, `NotFoundPage`, ba file CSS, `index.html` (thêm `theme-color`), `public/favicon.svg`.

| Hạng mục | Trước | Sau |
|---|---|---|
| Khung | Menu ngang trên nền xám, nội dung trên nền trắng | Thanh bên trái xanh đậm `#12304A` (logo + menu có icon, mục đang mở có nền + vạch trái); nội dung trên nền `#F3F5F8`, mỗi khối là tấm trắng viền mảnh |
| Biểu tượng | Ký tự "(!)", "✓" | Icon SVG nét 1.75px, `aria-hidden`, luôn đi kèm chữ |
| Thông báo thành công | Dải xanh trong trang | Thẻ nổi góc trên phải, có icon và nút "Đóng thông báo", vẫn tự ẩn sau 5 giây, vẫn `role="status"` |
| Trạng thái tải/lỗi/trống | Dòng chữ có nền | Khối giữa tấm: icon tròn, câu chính, câu hướng dẫn, nút hành động |
| Ô nhập | Gợi ý trên ô, lỗi dưới ô | Nhãn, ô, rồi gợi ý dưới ô; khi có lỗi thì lỗi thay chỗ gợi ý (gợi ý vẫn đọc được bằng trình đọc màn hình) |
| Câu chữ | "Vui lòng sửa các lỗi sau:" | "Chưa lưu được. Kiểm tra lại các trường sau:" |
| Màu, chữ | Xanh `#1d4ed8`, chữ 16px, điều khiển cao 44px | Một màu hành động `#0F62C5`, xám trung tính; chữ 15px (bảng 14px), điều khiển 40px (32px trong dòng bảng); mọi cặp màu đã tính tương phản đạt WCAG AA |

**Khác kế hoạch:**

1. **Thay `favicon.svg` (logo Vite mặc định) bằng dấu logo mới**, thêm `<meta name="theme-color">`: kế hoạch chưa ghi; logo của công cụ tạo dự án là dấu hiệu "làm từ mẫu" Hiệp muốn bỏ.
2. **Bỏ khung viền khi `h1`, `main` nhận focus bằng code** (trước chỉ bỏ khi không phải focus bàn phím, nên ảnh chụp vẫn thấy khung xanh quanh "Nhân viên"): hai phần tử này không bấm được, không nằm trong thứ tự Tab, nên không thuộc WCAG 2.4.7.
3. **K9 (hộp xác nhận) chuyển sang kiểm ở U3**: chưa trang nào dùng `ConfirmDialog` cho tới khi U3, U4 làm lại trang.
4. **Thanh bên dùng thẻ `<header>`** (không dùng `<aside>`): đó là phần đầu trang chứa logo và menu chính, giữ đủ landmark `header`/`nav`/`main` như danh sách WCAG.

**Kiểm:** `npm --prefix frontend run verify` xanh (typecheck, lint 0 cảnh báo, Prettier, build JS 286,70 KB / nén 89,54 KB, CSS 14,87 KB; 96/96 test backend); `audit --omit=dev` 0 lỗ hổng; `package.json` vẫn chỉ 3 gói chạy. Playwright (Chromium, `npm run dev`): K1 đạt; K2 đạt khi mở thẳng `/employees` (mở bằng `/` thì trang tự chuyển và focus ở `h1`, hành vi có từ trước, `usePageTitle` không đổi); K3 đạt (0 lần tải lại HTML, `aria-current`); K4 focus `h1`; K5 đường dẫn "Nhân sự > Không tìm thấy trang" + nút về; K6 đạt; K7 viền focus 3px `#8ec5ff` trên thanh bên; K10 320px: thanh bên thành thanh trên cao 104px, không cuộn ngang (lần đầu cao 221px vì lưới kéo dãn hàng, đã sửa bằng `grid-template-rows`). Ảnh: `.playwright-mcp/u2-404.png`, `u2-form-old-page.png`, `u2-320b.png`.

**Chuyển cho U3, U4:** trang dùng `PageHeader` (đường dẫn gốc "Nhân sự"), tấm `panel` + `toolbar` (đếm kết quả), `DataTable` (caption ẩn), nút dòng `btn btn--sm btn--ghost` / `btn--ghost-danger` có icon, `ConfirmDialog` thay `window.confirm`; form trong `panel` với `panel__header`, `form__grid` 2 cột, `form__actions` (Hủy rồi Lưu); ô họ tên dùng `person` + `avatar`, tên phòng ban dùng `badge`; `SearchBox` (U4) dùng `search__field` có icon kính lúp và nhãn ẩn. Giữ nguyên `data-testid`.

## 4d. Sửa sau rà soát Step 9 (Hiệp duyệt U2 và yêu cầu sửa R-03, R-05, R-06, R-07, R-08; "chi tiết đến từng cái nhỏ nhất", 03/11/2026)

| Điểm | Sửa | Kiểm lại |
|---|---|---|
| R-07 | `ConfirmDialog`: khi đang xóa, hai nút dùng `aria-disabled` thay cho `disabled` (nút giữ được focus), hàm xử lý tự bỏ qua khi `busy`; CSS `.btn[aria-disabled="true"]` mờ như nút khóa | typecheck, lint sạch; bấm bằng bàn phím kiểm ở K9 (U3) |
| R-08 | `usePageTitle`: quyết định có đưa focus vào `h1` hay không **một lần** lúc trang mở (`useState` khởi tạo), bỏ qua lần mở đầu (`key = "default"`) và lần tự chuyển hướng kiểu thay thế (`REPLACE`, ví dụ `/` → `/employees`). Không tính lại mỗi lần vẽ, vì trong cùng trang Toast và nút Xóa cũng điều hướng kiểu thay thế; tính lại thì lần tìm kiếm sau đó sẽ kéo focus khỏi ô tìm (lỗi này cũng có ở bản cũ: lần tìm đầu tiên sau khi mở ứng dụng làm focus nhảy về `h1`) | Playwright: mở `/`, Tab đầu tiên tới "Bỏ qua, tới nội dung chính"; bấm "Phòng ban" thì focus ở `h1` "Phòng ban" |
| R-06 | Kế hoạch Step 9: bỏ K9 khỏi dòng Playwright đã tick, thêm dòng K9 chưa tick ghi rõ kiểm ở U3 | Đọc lại hai tài liệu khớp nhau |
| R-03 | Kế hoạch: `client.js` → `client.ts` (5 chỗ); số "moderate" ghi rõ 6 lúc mới cài ESLint, 12 sau `typescript-eslint`; "5081 đúng hai nơi" ghi rõ thêm một dòng comment | Đọc lại |
| R-05 | `unit-test-instructions.md`: thêm K11 (gọi API thật), K12 (hủy giữa chừng không báo lỗi), K13 (bấm lỗi tóm tắt → focus vào ô), K14 (xóa xong focus về tiêu đề đúng một lần) cho U3, U4 chạy | Đọc lại |
| R-09 | Đo tương phản bằng công thức WCAG trong trình duyệt (đọc biến CSS thật): **17/17 cặp đạt**; thấp nhất: viền ô nhập 3,66:1 (cần 3), chữ phụ trên nền ứng dụng 5,49:1 (cần 4,5), chữ phụ trên đầu cột bảng 5,65:1; viền focus trên thanh bên 7,48:1 | Kết quả Playwright ngày 03/11 |

R-04 (địa chỉ API ở hai nơi) giữ nguyên như rà soát chấp nhận. Console trong lúc kiểm: 0 lỗi, 0 cảnh báo.

## 5. Cài đặt frontend (nháp cho README của U5)

```
cd frontend
npm install
npm run dev
```

Mở **đúng** `http://localhost:5173` (không dùng `127.0.0.1`). Backend phải đang chạy bằng `dotnet run --project backend/EmployeeCrud.Api` (cổng 5081). Cần Node.js 24 trở lên. Kiểm trước khi commit: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`.

## 6. Chuyển cho U3, U4

- Gọi API qua `apiGet<T>`, `apiPost<T>`... trong `src/api/client.ts`; khai báo kiểu DTO (`Department`, `Employee`) trong `src/api/departments.ts`, `src/api/employees.ts`. Bắt `ApiError`, bỏ qua `kind === "aborted"`.
- Trang danh sách: `StatusMessage` (tải / lỗi + "Thử lại" / rỗng), `DataTable`, `Toast` ở đầu `<main>`. Sau khi xóa: **gọi lại hàm tải danh sách**, rồi `navigate(..., { replace: true, state: { message } })` chỉ để mang lời báo.
- Form: `FormField` (hàm vẽ ô), `ErrorSummary` + `splitErrors`, `useSubmitGuard` cho nút Lưu và nút xác nhận Xóa.
- Thêm đường dẫn form vào `src/App.tsx`.
- Kiểm tay ở U3: một POST thật từ `http://localhost:5173` không lỗi CORS; bấm đúp nút Lưu chỉ một request; xóa xong dòng biến mất không cần F5; tắt backend → "Không kết nối được máy chủ, vui lòng thử lại"; hạn 10 giây.
- Đo lại Lighthouse khi U3, U4 xong (`npm run build` rồi `npm run preview`, cổng 5173).
