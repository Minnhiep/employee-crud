# Kế hoạch sửa code: 9 nhóm phát hiện từ lượt rà 8

## Summary

- Builds: làm sạch comment, sửa 6 lỗi giao diện và logic (trạng thái trang sửa, quay về chi tiết phòng, PUT phòng ban, nạp lại phòng ban, báo hết giờ, bỏ lọc), sửa danh sách kiểm tay và các việc nhỏ
- Touches: `DepartmentService.cs`, `ErrorMapper.cs`, `client.ts`, 2 form, `DepartmentDetailPage.tsx`, `EmployeesPage.tsx`, comment trong `backend/` và `frontend/src`, `07-kiem-thu-va-demo.md`, file `.http`
- Tests: 1–3 test xUnit hồi quy cho PUT phòng ban, giữ 146 test cũ; React kiểm bằng Chromium thật

Nguồn yêu cầu: `aidlc/spaces/default/intents/261104-sua-loi-luot-8/inception/requirements-analysis/requirements.md`. Chi tiết từng mã ở `aidlc/spaces/default/codekb/employee-crud/code-quality-assessment.md`, danh sách comment và bảng đối chiếu F, V ở `aidlc/spaces/default/intents/261104-sua-loi-luot-8/inception/reverse-engineering/developer-scan.md`.

## Chốt các góp ý R-01 đến R-07

| Góp ý | Chốt trong kế hoạch |
|---|---|
| R-01 (FR2) | Rà đủ 21 mục F, V, sửa các mục lệch ở `DOC-10`. Làm SAU khi xong FR3–FR8. Thêm mục kiểm mới cho FR4, FR6, FR7, FR8 |
| R-02 (FR6) | Nhận biết lỗi theo khóa `departmentId` trong `errors`, không theo câu chữ. Phòng đã chọn còn thì giữ lựa chọn; mất thì bỏ chọn, ô Phòng ban hiện câu "Phòng ban không tồn tại" từ API. Nạp lại lỗi thì giữ họ tên, email và hiện nút "Thử lại" sẵn có |
| R-03 (FR8.2) | Nút mới đặt nhãn "Bỏ lọc phòng ban", cạnh ô lọc khi tải phòng ban lỗi, để khác nút "Xóa bộ lọc" đang có vì nó xóa cả chuỗi tìm. Đây là đổi nhãn so với câu trả lời Q5 |
| R-04 (FR1.1) | Kiểm bằng biểu thức ở Step 8. Ngoại lệ được giữ liệt kê theo `file:dòng` trong `code-summary.md` |
| R-05 (FR3) | `/employees/abc/edit` xử lý như 999999. Tải lỗi không phải 404: giữ tiêu đề "Sửa …", bỏ câu "Trường có dấu * là bắt buộc." vì form không hiện |
| R-06 (FR4.3) | Truyền `returnTo` qua `state` như form nhân viên. Chỉ nhận đúng `/departments/{id}` của phòng đang sửa, khác thì về danh sách |
| R-07 (FR7.1) | POST, PUT: "Máy chủ phản hồi quá lâu, chưa rõ đã lưu hay chưa. Hãy kiểm tra lại danh sách trước khi thử lại." DELETE: "Máy chủ phản hồi quá lâu, chưa rõ đã xóa hay chưa. Hãy kiểm tra lại danh sách trước khi thử lại." Nút bật lại sau khi báo. Hủy do rời trang không hiện câu này |

## Các bước

- [x] **Step 1. Mốc và tái hiện (NFR1, Giả định).** Chạy lệnh test ở `unit-test-instructions.md`. Tái hiện `FE-14`, `FE-15`, `FE-16` trên Chromium, `BE-11` bằng test. Mục nào không tái hiện được thì dừng, ghi rõ, không sửa mục đó.
- [x] **Step 2. Logic: PUT phòng ban (FR5.1).** Ở `DepartmentService.UpdateAsync`, cuối hàm đọc lại bằng `GetByIdAsync` thay `CountEmployeesAsync`, nên phòng đã mất ra 404.
- [x] **Step 3. Test logic (FR5.2).** Thêm test hồi quy vào `DepartmentServiceTests.cs`: phòng bị xóa giữa chừng ra 404, đường thành công vẫn đúng `employeeCount`. Chạy lệnh test.
- [x] **Step 4. Backend nhỏ (FR9.3, FR9.5).** Đưa khóa `"name"`, `"email"` về một chỗ định nghĩa chung trong `Platform/Errors`, service và `ErrorMapper.cs` cùng dùng. Sửa comment ở `Employee.cs`, `EmployeeRequest.cs`, `DepartmentRequest.cs`. Chạy lệnh test.
- [x] **Step 5. Frontend: form và quay về (FR3, FR4, FR6).** Sửa `EmployeeFormPage.tsx`, `DepartmentFormPage.tsx`, `DepartmentDetailPage.tsx`, `components/PageHeader.tsx` nếu cần, theo các chốt R-02, R-05, R-06. "Thử lại" nạp phòng ban không làm form biến mất.
- [x] **Step 6. Frontend: client và bỏ lọc (FR7, FR8, FR9.4, FR9.6).** Sửa `api/client.ts` theo chốt R-07; grep lại rồi bỏ `TimeoutError`, `ApiError.title`, `.detail`, `type`, `status` không dùng. Sửa `EmployeesPage.tsx`, `SearchBox.tsx` theo chốt R-03. Phần tử mới có `data-testid` theo mẫu sẵn có.
- [x] **Step 7. Kiểm trên Chromium (FR3, FR4, FR6, FR7, FR8).** Chạy bản build với backend thật, theo Given/When/Then trong `requirements.md`, giả lập API chậm và lỗi khi cần. Dữ liệu thử phải xóa lại.
- [x] **Step 8. Làm sạch comment (FR1, FR9.2).** Sửa comment trong `backend/EmployeeCrud.Api`, `backend/EmployeeCrud.Api.Tests`, `frontend/src`, không đổi logic. Giữ phần "vì sao". Không viết mã thoát Unicode qua công cụ sửa file. Kiểm: `(\b(BR|NFR|ADR|AC|US|FR)[-.]?[0-9])|(\b[NSAR]-[0-9]{2}\b)|(\bU[1-5]\b)|(\bC[1-9]\b)|Hiệp|Loop-back|trước đây|comment cũ|bài học|mockups?|interaction-spec|security-design|reliability-design` trên các dòng comment phải ra 0 dòng ngoài danh sách ngoại lệ. Quét lại không có noncharacter thật trong file đã sửa. Không đổi file migration sinh tự động ngoài comment.
- [x] **Step 9. Tài liệu (FR2, FR9.1).** Sửa `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`: 21 mục F, V theo hành vi cuối, F10 viết lại, thêm mục cho FR4, FR6, FR7, FR8. Sửa nhãn thao tác 2, 7 trong `backend/EmployeeCrud.Api/EmployeeCrud.Api.http`.
- [x] **Step 10. Kiểm cuối (NFR1–NFR5).** Chạy `npm --prefix frontend run verify`, đo độ phủ bằng Microsoft Code Coverage. Không commit, không push.

## Không làm

Không thêm gói, không đổi migration về cấu trúc, không đổi luật nghiệp vụ, không làm `BE-3`, `FE-5`, `FE-6`, vùng thông báo toàn cục, hook tải dữ liệu chung.

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
