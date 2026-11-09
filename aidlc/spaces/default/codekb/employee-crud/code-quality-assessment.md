# Code Quality Assessment: employee-crud

Đánh giá dựa trên đọc code tĩnh ngày 2026-11-09; scan không chạy test, build hay lint.

## Đầu dòng và định dạng (liên quan intent `kiem-cuoi-crlf`)

| Sự thật | Bằng chứng |
| --- | --- |
| Repo không có `.gitattributes` | Tìm `**/.gitattributes` trên toàn repo: không có file nào |
| Prettier không có cấu hình → mặc định Prettier 3, `endOfLine: "lf"` | Không có `.prettierrc*`, `prettier.config.*` trong `frontend/`; `frontend/package.json` không có khóa `"prettier"` |
| `frontend/.prettierignore` chỉ bỏ `dist`, `node_modules`, `package-lock.json` | `frontend/.prettierignore` |
| `format:check` = `prettier --check .`, là bước thứ ba của `verify`; các bước nối bằng `&&` | `frontend/package.json` dòng 15 và 17 |
| `.editorconfig` không khai `end_of_line` hay `charset`; `[*]` chỉ có `indent_style = space`; `[*.cs]` có `insert_final_newline = false` | `.editorconfig` |
| Máy này đặt `core.autocrlf=true` ở cấu hình hệ thống, không phải trong repo | `git config --show-origin`: `C:/Program Files/Git/etc/gitconfig` |
| Working tree hiện tại là LF; Git cảnh báo sẽ đổi sang CRLF lần ghi file sau | `git diff` trên hai file test đang sửa: "LF will be replaced by CRLF the next time Git touches it" |
| README không nhắc đầu dòng, `core.autocrlf` hay `.gitattributes` | `README.md` mục 1–16 |

**Hệ quả** (khớp lỗi intent đã tái hiện): clone mới trên Windows với mặc định Git for Windows ghi file văn bản dạng CRLF; `prettier --check .` thấy khác `lf` nên báo lỗi; `verify` dừng ở bước 3. Sơ đồ luồng: `architecture.md`, Interaction Diagrams mục 4.

**Điểm chưa biết, cần kiểm ở các stage sau**:

- Vì `verify` dừng ở Prettier, `npm run build`, `dotnet format ../backend/EmployeeCrud.slnx --verify-no-changes` và `dotnet test` chưa chạy trên cây CRLF. Cách `dotnet format` xử lý file `.cs` CRLF khi `.editorconfig` không có `end_of_line` chưa được kiểm.
- Intent báo 29 file frontend bị Prettier chê; đếm tĩnh có khoảng 39 file thuộc loại Prettier định dạng trong `frontend/` (34 file `.ts`/`.tsx`/`.css` trong `src/` cộng `index.html`, `package.json`, `tsconfig.json`, `eslint.config.js`, `vite.config.ts`). Chênh lệch chưa giải thích.
- Trên máy làm bài, lệnh Git ghi lại file (`checkout`, `restore`, `stash`) trước khi sửa sẽ đổi file sang CRLF và làm `verify` hỏng ngay tại chỗ.
- Repo không có file nhị phân của dự án ngoài các thư mục bị bỏ qua (`favicon.svg` là văn bản).

## Test

| Mục | Hiện trạng |
| --- | --- |
| Project test | `backend/EmployeeCrud.Api.Tests` (xUnit), một project cạnh backend |
| Số ca (đếm tĩnh) | 148 = 106 `[Fact]` + 42 bộ `[InlineData]` của 13 `[Theory]`; khớp con số 148 của intent |
| Phân bố | `EmployeeServiceTests` 75, `DepartmentServiceTests` 45, `ErrorMapperTests` 12, `PipelineTests` 9, `SecurityTests` 5, `LoggingTests` 2 |
| Phạm vi | Luật nghiệp vụ của hai service (đúng, lỗi, biên, chen nhau, ký tự lạ, chuẩn hóa), ánh xạ lỗi, chuỗi middleware (500/404/405/415/400 có CORS), header bảo mật, AllowedHosts, log một dòng Error kèm `traceId`, hủy request không ghi Error, dừng khởi động khi thiếu chuỗi kết nối |
| Giới hạn | InMemory không có chỉ mục UNIQUE, khóa ngoại, collation; các luật đó kiểm tay trên PostgreSQL (README mục 10). Controller và migration không có unit test (quy ước nhóm). Frontend không có test tự động (quy ước nhóm). |
| Độ phủ | `coverlet.collector` + `reportgenerator` qua `npm run coverage`; mức sàn 80% dòng lớp service chỉ ghi trong README/`team.md`, không có cấu hình tự chặn; không có `.runsettings` |
| Chất lượng test | Không có test luôn đạt; giả lập lỗi chen nhau bằng `DbContext` con ghi đè `SaveChangesAsync`; chờ theo điều kiện thay vì hẹn giờ cố định (`LoggingTests`) |

## Lint, định dạng, kiểm kiểu

- Frontend: ESLint flat config (mẫu Vite + `typescript-eslint` + react-hooks + react-refresh), `--max-warnings 0`; TypeScript `strict` và các cờ chặt khác; Prettier mặc định.
- Backend: `.editorconfig` đầy đủ quy ước .NET (naming, style, `dotnet_style_readonly_field = true:warning`, `csharp_prefer_static_local_function = true:warning`); `dotnet format --verify-no-changes` trong `verify`; `Nullable` bật.
- Tắt cảnh báo: 0 `eslint-disable`, 0 `@ts-ignore`/`@ts-expect-error`, 0 `any`; chỉ `#pragma warning disable 612, 618` do EF Core sinh trong 3 file migration.
- `TODO`/`FIXME`/`HACK`: 0.

## CI/CD

Không có (không `.github/`, không file pipeline) theo phạm vi đề bài. Cổng chất lượng là `npm run verify` chạy tay trong `frontend/` trước mỗi commit; độ phủ đo riêng bằng `npm run coverage`.

## Tài liệu

- `README.md` đầy đủ cho người mới: phần mềm cần có, clone, user-secrets nhập mật khẩu an toàn, `dotnet tool restore`, migration, chạy, địa chỉ, kiểm nhanh, test và độ phủ, sự cố thường gặp (Smart App Control, file bị khóa, `psql`, `127.0.0.1`), dữ liệu mẫu, tài khoản DB quyền tối thiểu, cấu hình log. Thiếu: đầu dòng/`core.autocrlf`.
- `docs/so-do-database.md` (Mermaid ER + text fallback), `docs/danh-sach-api.md` (10 thao tác, lỗi mẫu gọi thật ngày 03/11/2026), `docs/du-lieu-mau.sql` (chạy lại an toàn), `docs/ke-hoach.md` (đề bài).
- Comment trong code: tiếng Việt, giải thích "vì sao", XML doc trên lớp và hàm công khai.

## Đánh giá nhanh (tốt / khá / kém)

| Tiêu chí | Mức | Ghi chú |
| --- | --- | --- |
| Đặt tên rõ nghĩa | Tốt | Tên tiếng Anh đúng quy ước; câu báo gom hằng |
| Kích thước hàm | Khá | Hàm service ngắn; vài component trang dài (`EmployeeFormPage.tsx` 612 dòng, `EmployeesPage.tsx` 566 dòng); `components.css` 1001 dòng |
| Xử lý lỗi | Tốt | Mọi đường lỗi ra ProblemDetails; phân biệt lỗi chen nhau, 404, 409; frontend phân loại `ApiError`, bỏ qua `aborted` |
| Có test cho đường quan trọng | Tốt (backend) / không có (frontend) | Theo quy ước nhóm |
| Trùng lặp | Khá | Luật kiểm dữ liệu chép tay hai phía (cố ý); logic tải/lỗi lặp giữa các trang theo cùng một mẫu |
| Code chết | Tốt | Không thấy import thừa hay khối comment-out; `noUnused*` và ESLint chặn phía TS |

## Nợ kỹ thuật

| # | Tín hiệu | Vị trí | Mức ảnh hưởng |
| --- | --- | --- | --- |
| TD1 | Không có `.gitattributes`; đầu dòng phụ thuộc máy | gốc repo | Cao với intent hiện tại: `verify` hỏng trên clone Windows |
| TD2 | `.editorconfig` không khai `end_of_line` | `.editorconfig` | Trung bình |
| TD3 | README không hướng dẫn về đầu dòng | `README.md` | Thấp |
| TD4 | Luật kiểm dữ liệu chép tay hai phía, không có test đối chiếu | `TextInput.cs` ↔ `normalizeText.ts`; `EmployeeService.EmailPattern` ↔ `validateEmployee.ts`; độ dài 100/254/100 | Trung bình |
| TD5 | Component trang lớn | `EmployeeFormPage.tsx`, `EmployeesPage.tsx` | Thấp |
| TD6 | Request DTO tham chiếu hằng của service | `DepartmentRequest.cs`, `EmployeeRequest.cs` | Thấp |
| TD7 | Phụ thuộc hai chiều ở mức namespace `Platform.Data` ↔ tính năng | `Platform/Data/AppDbContext.cs` | Thấp |
| TD8 | Mức sàn độ phủ không được công cụ tự chặn | `frontend/package.json` `coverage` | Thấp |
| TD9 | Thay đổi chưa commit lúc quét (chỉ comment) | `PlatformWebAppFactory.cs`, `ThrowingAppDbContext.cs` trong `backend/EmployeeCrud.Api.Tests/` | Thấp; cần commit hoặc bỏ trước khi so sánh trước/sau |
