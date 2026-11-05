# Kế hoạch sửa code: lượt 6 và các mục rà soát

## Summary

- Builds: chặn noncharacter ở form và API, thêm `dotnet format` vào `verify`, khóa lối thoát khi đang lưu, kiểm id chặt, sửa tài liệu và comment sai, dọn code nhỏ, sửa 3 lỗi giao diện
- Touches: `TextInput.cs`, `normalizeText.ts`, hàm kiểm id mới `frontend/src/utils/parseId.ts`, 2 form, 3 trang React, 6 file C# định dạng, `frontend/package.json`, `README.md`, `docs/`, file `.http`
- Tests: khoảng 8–10 test method xUnit mới hoặc sửa (hồi quy noncharacter, biên email 254/255, test hẹn giờ), giữ 138 test cũ; React kiểm bằng trình duyệt thật

Nguồn yêu cầu: `aidlc/spaces/default/intents/261104-sua-loi-luot-6/inception/requirements-analysis/requirements.md`. Danh sách chi tiết các mã `BE-`, `FE-`, `DOC-` ở `aidlc/spaces/default/codekb/employee-crud/code-quality-assessment.md`.

## Cách xử lý các góp ý R-01 đến R-07

Hiệp đã chấp nhận các góp ý này như rủi ro ở bước duyệt yêu cầu. Kế hoạch vẫn chốt cách làm để không phải đoán khi sửa:

| Góp ý | Chốt trong kế hoạch |
|---|---|
| R-01 (FR8.3) | Lỗi xóa ở trang chi tiết phòng ban: focus về tiêu đề trang sau khi hộp thoại đóng, dùng cùng cách chờ như `DepartmentsPage.tsx`. Hiện `focus()` chạy lúc hộp thoại còn mở nên có thể vô tác dụng |
| R-02 (FR5.1) | Giữ id 99999, đổi nhãn thành đúng 404, thêm dòng ghi cách thấy 409 (xóa phòng còn nhân viên) |
| R-02 (FR6.2) | Không viết lại bản nháp học. Thêm ghi chú đầu mỗi file có lệch, nêu điểm khác bài thật và trỏ tới tài liệu đúng |
| R-03 (FR4.2) | Id hợp lệ: chữ số, không bắt đầu bằng 0, từ 1 đến 2147483647 (giới hạn `int` của API). `99999999999` coi như không tìm thấy |
| R-04 | Neo theo nội dung câu trong `code-quality-assessment.md`, không theo số dòng |
| R-05 (FR3.3) | Dùng ref đánh dấu form đã rời trang. Rời form rồi mà lưu thành công: bản ghi đã lưu, không chuyển trang. Rời form rồi mà lưu lỗi: chỉ ghi `console.error`, vì ứng dụng không có vùng thông báo toàn cục. Đây là giới hạn đã biết, ghi lại ở `code-summary.md` |
| R-06 (FR1.1) | Kiểm noncharacter trên chuỗi gốc, trong vòng lặp hiện có, trước `Normalize`. Bước 1 kiểm dữ liệu hiện có trước khi sửa |
| R-07 (FR7.2) | Mỗi màu chuyển về `tokens.css` giữ đúng mã màu cũ; mở 4 trang chính để xem lại |

## Các bước

- [x] **Step 1. Mốc trước khi sửa (NFR1, Giả định).** Xác nhận lệnh test ở `unit-test-instructions.md` chạy được. Chạy backend, đọc toàn bộ nhân viên và phòng ban qua API, kiểm không có noncharacter trong dữ liệu đang có; có thì dừng báo Hiệp. Mốc đã có ngày 04/11: 138/138 test, 8 lỗi format ở 6 file.
- [x] **Step 2. Logic: chặn noncharacter (FR1.1, FR1.2).** Sửa `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs`: trong vòng lặp, sau bước kiểm surrogate, đọc mã ký tự thật và trả false nếu thuộc U+FDD0–U+FDEF hoặc hai mã cuối của mỗi mặt phẳng. Thêm comment tiếng Việt nói vì sao. Service dùng lại `TryNormalize`, không đổi: 400 cho ô nhập, 200 `[]` cho ô tìm.
- [x] **Step 3. Test logic (FR1.4, FR9.1).** Thêm ca hồi quy vào `DepartmentServiceTests.cs`, `EmployeeServiceTests.cs`: U+FFFE, U+FFFF, U+FDD0, U+FDEF, U+1FFFE, U+10FFFF ở tên phòng, họ tên, email, ô tìm; chữ Việt và emoji vẫn nhận; email đúng 254 ký tự nhận, 255 từ chối. Chạy lệnh test.
- [x] **Step 4. Backend còn lại (FR2.1, FR6.4, FR7.1, FR7.3, FR9.2).** Sửa 8 lỗi định dạng bằng `dotnet format backend/EmployeeCrud.slnx`; sửa 4 comment lệch code (`BE-4`); đưa câu "Giá trị không đúng kiểu dữ liệu" về `ErrorTitles`, giữ nguyên câu chữ (`BE-5`); bỏ thư mục rỗng `backend/EmployeeCrud.Api/Controllers/` (`BE-10`); sửa test hủy request ở `Platform/LoggingTests.cs` chờ theo điều kiện (`BE-8`). Chạy lệnh test.
- [x] **Step 5. API: kiểm thật (FR1.1, FR1.2, NFR3).** Không đổi controller. Chạy backend, gọi API với các ký tự ở Step 3, xác nhận không còn 500. Tạo dữ liệu thử nếu có thì xóa lại.
- [x] **Step 6. Frontend: luật chung (FR1.3, FR4.1, FR4.2).** Thêm `\p{Noncharacter_Code_Point}` vào `INVALID` của `frontend/src/utils/normalizeText.ts`. Tạo `frontend/src/utils/parseId.ts` theo chốt R-03, dùng ở `EmployeeFormPage.tsx`, `DepartmentFormPage.tsx`, `DepartmentDetailPage.tsx`, `EmployeesPage.tsx`.
- [x] **Step 7. Frontend: khóa khi đang lưu (FR3.1–FR3.4).** Ở hai form, Hủy và breadcrumb dùng `aria-disabled` và chặn bấm khi đang lưu, theo mẫu `ConfirmDialog.tsx`, vẫn Tab tới được. Thêm kiểm ref ở chốt R-05 trước khi `navigate` sau lưu.
- [x] **Step 8. Frontend: lỗi nhỏ và dọn CSS (FR7.2, FR8.1–FR8.3).** Lấy chữ cái đầu theo đúng ký tự, không cắt đôi emoji (`FE-7`); chuẩn hóa chuỗi tìm đọc từ địa chỉ (`FE-8`); sửa focus theo chốt R-01 (`FE-9`); bỏ CSS thừa, đưa màu viết thẳng về `tokens.css` (`FE-10`).
- [x] **Step 9. Frontend: kiểm trên trình duyệt (FR1.3, FR3, FR4, FR8, R-07).** Không có test tự động cho React theo `team.md`. Kiểm bằng trình duyệt thật theo tiêu chí Given/When/Then trong `requirements.md`, gồm giả lập API chậm cho FR3. Không có công cụ trình duyệt thì ghi rõ trong `code-summary.md` và chuyển sang Build and Test.
- [x] **Step 10. Cấu hình kiểm (FR2.2).** Thêm `dotnet format ../backend/EmployeeCrud.slnx --verify-no-changes` vào `verify` trong `frontend/package.json`, trước `dotnet test`. Sửa `README.md` mục 10 cho đúng.
- [x] **Step 11. Tài liệu (FR5.1–FR5.3, FR6.1–FR6.3).** Sửa `backend/EmployeeCrud.Api/EmployeeCrud.Api.http`, `docs/danh-sach-api.md`, `docs/so-do-database.md`, `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`; thêm ghi chú đầu các file `00`–`05` có lệch; thống nhất xưng hô (`DOC-8`). Mỗi dòng sửa phải đối chiếu với code hoặc kết quả chạy thật.
- [x] **Step 12. Kiểm cuối (NFR1, NFR2, NFR4, NFR5).** Chạy `npm --prefix frontend run verify` và đo độ phủ bằng Microsoft Code Coverage. Không commit, không push.

## Không làm

Không thêm gói, không đổi migration, không đổi luật email, không làm `BE-3`, `FE-5`, `FE-6`. Không thêm `data-testid` vì dự án đang kiểm trình duyệt theo vai trò và nhãn; đây là khác biệt so với mẫu chung của quy trình, có chủ đích.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.",
  "scope": "bugfix",
  "test_strategy": "minimal",
  "project_type": "brownfield",
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
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Include a targeted regression for the bug or vulnerability.",
      "Keep the existing test suite green."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
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
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
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
  "input_sha256": "sha256:8bcb319442295944c09e27fabb54b1c43590577c243e4b638f4811979e3d4282",
  "contract_sha256": "sha256:580009a37d7174fd2af9c6638c5e5744b693051fb8b4413a537629712ff03450"
}
```
