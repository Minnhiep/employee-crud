# Kế hoạch sinh code: u2-web-shell

## Summary

- Builds: khung giao diện React (Vite, **TypeScript strict**): menu, liên kết bỏ qua, router với trang 404, component dùng chung có kiểu props, `client.ts` gọi API, CSS chung
- Touches: thư mục mới `frontend/` (src/api, components, hooks, pages, styles; tsconfig, vite.config.ts, eslint.config.js, .env.development, package.json); không sửa backend
- Tests: không có test tự động cho React (team.md); kiểm bằng `npm run lint` (ESLint + typescript-eslint), `npm run format:check`, `npm run build` (gồm kiểm kiểu `tsc`) và 8 bước kiểm tay trên trình duyệt

> **Nguồn:** `functional-design/` (functional-spec, rules BR1.1–BR4.2, frontend-components, Q1 = A), `nfr-requirements/`, `nfr-design/` (performance, security, logical-components), `infrastructure-design/` của U2; `inception/refined-mockups/` (mockups, interaction-spec, design-system-mapping, accessibility-checklist); `contract-summary.md` C3; `team.md`, `project.md`.

## Story → bước code

| Story / AC | Phần U2 làm | Bước |
|---|---|---|
| US4.1: AC4.1.1, AC4.1.3 | `ErrorSummary`, `FormField`, `splitErrors`; `client.js` giữ lời báo API | 4, 5 |
| US4.2: AC4.2.1–AC4.2.3 | `StatusMessage`; lỗi mạng trong `client.js` | 4, 5 |
| US4.3: AC4.3.1, AC4.3.3 | `AppLayout`, `NavMenu`, router, trang 404, chữ tiếng Việt | 3, 6 |
| US4.4: AC4.4.1, AC4.4.2 | `useSubmitGuard`, kiểu `btn[disabled]` | 2, 5 |
| US4.5: AC4.5.1 | `Toast` | 5 |
| US4.6: AC4.6.1, AC4.6.2 | CSS nhãn, dấu *, dòng lỗi; `FormField` | 2, 5 |

## Những điều anh cần biết trước khi duyệt

0. **Bản sửa ngày 2026-11-01 (anh yêu cầu giữa lúc làm):**
   - **TypeScript thay JavaScript** (anh chọn; `project.md`, `team.md` đã sửa luật): file `.tsx`/`.ts`, `tsconfig.json` bật `strict`, `npm run build` chạy `tsc -b` để kiểm kiểu trước khi build, ESLint thêm `typescript-eslint`. Các file `.jsx`/`.js` em đã viết theo kế hoạch cũ sẽ được chuyển sang `.tsx`/`.ts` và khai báo kiểu.
   - **ESLint thay oxlint:** bản Vite mới tạo sẵn oxlint; anh bảo chọn công cụ chuẩn nhất khi đi làm, nên em dùng ESLint 10 (bản đang được hỗ trợ). Không dùng `eslint-plugin-jsx-a11y` vì chưa hỗ trợ ESLint 10; accessibility vẫn kiểm bằng Lighthouse và danh sách WCAG ở Build and Test.
   - Gói đã cài thật: React 19.3, React Router 8.5, Vite 8.3, Prettier 3.9, ESLint 10.14. `npm audit`: 0 lỗ hổng ở gói chạy trong trình duyệt; 6 mức "moderate" trong công cụ ESLint (thư viện `minimatch`, chỉ chạy trên máy dev), không sửa bằng `--force`.
1. **Lệnh chạy ở phiên chính, anh duyệt từng lệnh** (như anh chọn ở U1).
2. **`npm create vite@latest` tải bộ tạo dự án vào bộ đệm npm** của máy để chạy một lần; không cài công cụ toàn máy. Mọi gói của dự án vào `frontend/node_modules/` (cục bộ).
3. **Gói thêm:** `react-router` (điều hướng); khi phát triển: `prettier`, `typescript`, `typescript-eslint`, `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`. Ngoài ra chỉ có gói Vite tạo sẵn (React, React DOM, kiểu `@types/react`).
4. **Không có test tự động cho React.** `team.md` ghi rõ "không viết test tự động cho React"; luật này hẹp hơn và được ưu tiên hơn mức "5–8 test mỗi component" mặc định. U2 được kiểm bằng lint, build và 8 bước kiểm tay (mục "Kiểm tay" trong `unit-test-instructions.md`).
5. **Lệnh kiểm chung sau mỗi Unit** (`dotnet test backend/EmployeeCrud.slnx`) không kiểm gì ở frontend. Ở bước kiểm cuối U2, em sẽ đề xuất anh đổi sang một lệnh kiểm cả frontend (lint, định dạng, build) lẫn backend. Anh duyệt hoặc giữ lệnh cũ.
6. **Không sửa file nào có sẵn** (`.gitignore` gốc đã loại `node_modules/`, `dist/`).

## Các bước

### Step 1: Dựng dự án Vite và cấu hình chạy thật

- [x] `npm create vite@latest frontend -- --template react` ở thư mục gốc. Trả lời "không" nếu bộ tạo hỏi cài đặt và chạy luôn.
- [x] `npm install` trong `frontend/`, rồi `npm install react-router` và `npm install -D prettier`; thay oxlint bằng ESLint 10 (`eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`) với `eslint.config.js`.
- [x] **TypeScript:** `npm install -D typescript typescript-eslint`; `tsconfig.json` (strict, `noUncheckedIndexedAccess`, `jsx: react-jsx`, `moduleResolution: bundler`, `noEmit`, kèm `vite-env.d.ts` khai báo `VITE_API_BASE_URL`); script `build` = `tsc -b && vite build`, thêm `typecheck` = `tsc -b`; `eslint.config.js` dùng cấu hình `typescript-eslint` cho `**/*.{ts,tsx}`.
- [x] `vite.config.ts`: `server` và `preview` đều `port: 5173`, `strictPort: true` (NFR7.1).
- [x] `.env.development`: `VITE_API_BASE_URL=http://localhost:5081`, kèm comment: giá trị này phải khớp giá trị mặc định trong `src/api/client.js` (Q1 = A, NFR7.3).
- [x] `package.json`: thêm script `format` (`prettier --write .`) và `format:check` (`prettier --check .`); thêm `"engines": { "node": ">=24" }`. File `.prettierignore` loại `dist`.
- [x] `index.html`: `<html lang="vi">`, `<meta charset>`, `viewport`, `<meta name="description">`, `<title>Quản lý nhân sự</title>`; giữ favicon của Vite (NFR8.4, BR1.5).
- [x] Bỏ file mẫu của template (`App.css`, `index.css`, logo trong `src/assets`, nội dung đếm số trong `App.jsx`).

### Step 2: CSS chung (design tokens)

- [x] `src/styles/tokens.css`: toàn bộ biến trong `design-system-mapping.md` mục 2–3 (màu, chữ, khoảng cách, viền, focus, chiều rộng tối đa 1100px, chiều cao tối thiểu 44px).
- [x] `src/styles/base.css`: `body`, tiêu đề, liên kết, `:focus-visible` (viền 3px, không bao giờ `outline: none`), `.sr-only`, `.skip-link` (chỉ hiện khi focus), `prefers-reduced-motion`.
- [x] `src/styles/components.css`: `layout`, `nav`, `btn` (`--primary`, `--secondary`, `--danger`, `[disabled]`), `table-wrap`, `table`, `search`, `form`, `field` (`__hint`, `__error`, `--invalid`), `alert` (`--error`, `--success`), `status` (`--loading`, `--error`, `--empty`), co dãn ở màn hình từ 1023px trở xuống (`design-system-mapping.md` mục 4–5).
- [x] `main.jsx` nạp ba file theo thứ tự tokens → base → components.

> **Tên file từ Step 2 trở đi:** file có JSX là `.tsx`, file chỉ có logic là `.ts` (ví dụ `main.tsx`, `App.tsx`, `AppLayout.tsx`, `client.ts`, `usePageTitle.ts`, `splitErrors.ts`). Mỗi component khai báo kiểu props (`type ...Props`); `ApiError` và hàm API có kiểu rõ ràng; không dùng `any`.

### Step 3: Khung trang và điều hướng (implement)

- [x] `src/components/AppLayout.jsx`: liên kết bỏ qua `a.skip-link[href="#noi-dung"]` "Bỏ qua, tới nội dung chính" → `header` ("Quản lý nhân sự" + `NavMenu`) → `main#noi-dung[tabindex="-1"]` chứa `<Outlet />` (BR1.3).
- [x] `src/components/NavMenu.jsx`: `nav[aria-label="Chính"] > ul > li > NavLink` "Nhân viên", "Phòng ban"; `NavLink` tự đặt `aria-current="page"` và class `nav__link--active` (BR1.4).
- [x] `src/hooks/usePageTitle.js`: đặt `document.title = "<tên> – Quản lý nhân sự"`; focus `h1` khi đổi trang nhưng không ở lần mở đầu tiên (BR1.2).
- [x] `src/pages/EmployeesPage.jsx`, `DepartmentsPage.jsx`: chỉ `h1` "Nhân viên", "Phòng ban" (U4, U3 thay nội dung).
- [x] `src/pages/NotFoundPage.jsx`: `h1` "Không tìm thấy trang", câu "Địa chỉ bạn mở không có trong ứng dụng.", `Link` "Về trang Nhân viên".
- [x] `src/App.jsx`: `BrowserRouter` + `Routes`: `/` → `Navigate replace` tới `/employees`; `/employees`, `/departments` trong `AppLayout`; `*` → `NotFoundPage` (BR1.1). Comment chỗ U3, U4 thêm đường dẫn form.

### Step 4: Gọi API (implement)

- [x] `src/api/client.js`: `apiGet`, `apiPost`, `apiPut`, `apiDelete`, mỗi hàm nhận thêm `{ signal }` tùy chọn; lớp `ApiError` (`kind`: `network` \| `server` \| `client` \| `aborted`; `status`; `title`; `detail`; `errors`; `message`).
  - Địa chỉ gốc `import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5081"`; comment: backend chạy bằng `dotnet run` (hồ sơ `http`), giao diện phải mở đúng `http://localhost:5173` (không `127.0.0.1`) vì CORS so nguyên văn.
  - Hạn 10 giây bằng `AbortController`, chỉ hủy hẹn giờ sau khi đọc xong body; gộp với `signal` của trang. Hủy do trang → `ApiError` `kind: "aborted"` (trang bỏ qua, không hiện lỗi); quá hạn hoặc fetch bị từ chối → `network` "Không kết nối được máy chủ, vui lòng thử lại" (BR2.2, BR2.3).
  - 2xx: 200/201 đọc JSON, 204 trả `null`; body không đọc được → `server` với câu lỗi mạng.
  - 4xx `application/problem+json` → `client`, giữ `title`, `detail`, `errors`, `message = detail ?? title`; không phải ProblemDetails → "Đã có lỗi xảy ra, vui lòng thử lại sau." (BR2.4).
  - 5xx → `server`, `message = detail` nếu có, ngược lại câu lỗi mạng.
  - Gửi `Content-Type: application/json` chỉ khi có body; không đặt `credentials` (NFR7.2). Không bao giờ tự gọi lại.
  - Lỗi không phải HTTP (lỗi lập trình) → `console.error` một lần rồi quy về `server`.

### Step 5: Component dùng chung (implement)

- [x] `StatusMessage.jsx`: `kind` loading (`role="status"`, biểu tượng xoay `aria-hidden`) / error (`role="alert"`, (!) + chữ) / empty; `action` là nút (`onClick`) hoặc `Link` (`to`) (BR3.1).
- [x] `Toast.jsx`: vùng `div.alert.alert--success[role="status"]` **luôn có trong trang**, chỉ điền "✓ lời báo" khi `location.state.message` có; sau khi hiện thì `navigate(location.pathname + location.search, { replace: true, state: null })` để F5 không hiện lại; tự ẩn sau 5 giây, hủy hẹn giờ khi rời trang (BR3.2). Comment hướng dẫn U3, U4: sau khi xóa, **gọi lại hàm tải danh sách** và dùng `navigate(... , { replace: true, state: { message } })` chỉ để mang lời báo; hiệu ứng tải không phụ thuộc `location.state`.
- [x] `DataTable.jsx`: `caption`, `columns` (`key`, `header`, `render`), `rows`, `renderActions`; `div.table-wrap[role="region"][aria-label][tabindex="0"] > table > caption, th[scope="col"]`; rỗng thì không vẽ (BR4.1).
- [x] `ErrorSummary.jsx` (dùng `forwardRef` để form focus vào): `role="alert"`, `tabindex="-1"`, "Vui lòng sửa các lỗi sau:", lỗi gắn ô là liên kết `#id-ô`; `src/components/splitErrors.js`: `splitErrors(errors, fieldNames)` → `{ fieldErrors, otherMessages }` (BR3.3).
- [x] `FormField.jsx`: nhãn trên ô, dấu * `aria-hidden` + `aria-required`, gợi ý, dòng lỗi `(!)` + chữ; gắn `aria-invalid`, `aria-describedby` vào ô con (BR3.3, BR4.2).
- [x] `src/hooks/useSubmitGuard.js`: cờ `useRef` chặn lần gọi thứ hai ngay lập tức, `isSubmitting` để vẽ nút khóa, mở lại khi xong (BR3.4).

### Step 6: Kiểm tầng giao diện (sau khi code; không có test tự động theo team.md)

- [x] `npm run lint`: 0 lỗi, 0 cảnh báo.
- [x] `npm run typecheck`: 0 lỗi kiểu.
- [x] `npm run format` rồi `npm run format:check`: sạch.
- [x] `npm run build`: xong, không lỗi.
- [x] Chạy `npm run dev`, em mở trình duyệt kiểm 8 bước trong `unit-test-instructions.md` mục "Kiểm tay" (không cần backend; U2 chưa gọi API), ghi kết quả vào `code-summary.md`.

### Step 7: Cấu hình môi trường, quét và gói phụ thuộc

- [x] `npm audit` trong `frontend/`, ghi kết quả (không `audit fix --force`).
- [x] Quét ở thư mục gốc: `git grep --untracked -i -n -E "(password|pwd)\s*=" -- frontend` → 0 dòng; `git grep --untracked -n -E "dangerouslySetInnerHTML|innerHTML|eval\(|new Function" -- frontend/src` → 0 dòng; `git grep --untracked -n "5081" -- frontend` → đúng hai nơi (`.env.development`, `client.js`).
- [x] Kiểm backend không bị ảnh hưởng: `dotnet test backend/EmployeeCrud.slnx` vẫn 19/19.

### Step 8: Tài liệu và truy vết

- [x] Viết `code-summary.md`: file đã tạo, phiên bản gói thật, quyết định chính, kết quả lint/build/kiểm tay/audit, phần "cài đặt frontend" làm nháp cho README (U5), và các việc chuyển cho U3/U4 (kiểm CORS thật từ 5173 bằng một POST; kiểm bấm đúp chỉ một request; kiểm xóa xong dòng biến mất không cần F5; hạn 10 giây; đo lại Lighthouse).
- [x] Ghi `source-manifest.json` và `traceability.json`.

## Không làm trong U2

- Không màn hình nghiệp vụ, không gọi API thật (U3, U4).
- Không Redux, không thư viện CSS hay thư viện test React.
- Không README (U5).

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.",
  "scope": "classic",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Methodology evidence**: Hiệp chọn viết code trước, rồi viết test cho phần đó và chạy ngay, vì người mới dễ theo dõi hơn (Q5). Lựa chọn này cũng khớp mặc định của org.md và quyết định trong project.md chỉ viết unit test cho logic nghiệp vụ chính.\n- **Ordering**: Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.\n- Phạm vi test tự động: chỉ unit test cho các service, tập trung vào luật nghiệp vụ. Ví dụ: email trùng (không phân biệt hoa thường) trả 409, phòng ban không tồn tại, không xóa được phòng ban còn nhân viên, tìm theo họ tên và email không phân biệt hoa thường, không tìm thấy trả 404. Mỗi service có ít nhất một trường hợp đúng và hai trường hợp lỗi hoặc biên. Không viết E2E, không viết test tự động cho React, không làm bộ test tích hợp lớn.\n- Độ phủ: ít nhất 80% số dòng (line coverage) của các lớp service, đo bằng coverlet (`dotnet test --collect:\"XPlat Code Coverage\"`). Hiệp chạy `dotnet test` trên máy trước mỗi commit, thay cho bước CI mà dự án không có (Q6). Build and Test kiểm mức sàn này và không được hạ nó xuống để cho qua.\n- Công cụ: xUnit, đặt trong một project test riêng cạnh backend (ví dụ `EmployeeCrud.Api.Tests`). Test service dùng database giả lập trong bộ nhớ (Q7). Chọn cụ thể provider nào thì để Code Generation quyết, vì việc hàm `ILike` của Npgsql có chạy được trên provider giả lập hay không vẫn chưa kiểm (xem `evidence.md`).\n- Kiểm thủ công cả luồng: theo các danh sách F, V, A, D, R trong `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`, kiểm từ dưới lên: database → API → giao diện → cả luồng.\n- Khối lượng và loại test theo Test Strategy `Standard` của workflow; mức sàn của scope chỉ cộng thêm, không thay thế."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:b6b872fd21e0c58c5bf1fd46fdd8da37894b85fe9b7d7660b7e84c38818ce401",
  "contract_sha256": "sha256:dfce3d5b6be371bd60bc264d51eb2b2a5627226310edfc05af4c94d5234aa0cb"
}
```

Áp dụng hợp đồng cho U2: chỉ có tầng "Frontend behavior". Theo `team.md` ("giao diện React được kiểm thủ công bằng trình duyệt"; "không viết test tự động cho React"), bước "write and run its tests" của tầng này là bước 6: lint, build và kiểm tay. Không có tầng dữ liệu, truy cập dữ liệu, nghiệp vụ hay API trong U2. Lệnh chạy được trước bước kiểm đầu tiên (runner) là `npm --prefix frontend run lint`, có từ bước 1.
