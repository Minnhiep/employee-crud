# Luật — U5 `u5-handover`

> **Nguồn:** `inception/requirements-analysis/requirements.md` (FR4.3, FR4.4, FR6.1–FR6.4, FR7.1–FR7.4, NFR1–NFR3), `inception/user-stories/stories.md` (AC5.1.1–AC5.3.3), `inception/units-generation/unit-of-work.md` §U5, `inception/units-generation/unit-of-work-story-map.md`, `inception/contract-design/contract-summary.md` (C1–C3, §4), `inception/domain-design/components.md`, `functional-design-questions.md` (Q1–Q5).
>
> Đây là luật cho **nội dung tài liệu** và cho **việc đối chiếu tài liệu với code**. Luật nghiệp vụ của phòng ban, nhân viên đã nằm ở U3, U4; U5 không đặt luật nghiệp vụ mới.

## Danh sách luật (nguồn đúng)

```yaml
rules:
  # Nhóm 1: README
  - id: BR1.1
    statement: README có đủ các phần FR7.4 đòi, theo đúng thứ tự làm.
    category: validation
    applies_to: HandoverReadme
    trigger: khi viết và khi đối chiếu README
    logic: >
      IF README thiếu một trong các phần: phần mềm cần có kèm phiên bản, đặt connection string bằng user-secrets,
      khôi phục công cụ, tạo database bằng migration, chạy backend, chạy frontend, địa chỉ trang và API
      THEN README chưa đạt; bổ sung trước khi đối chiếu.
    violation: README chưa được coi là xong.
    source: [FR7.4, AC5.1.1]

  - id: BR1.2
    statement: Phiên bản phần mềm ghi trong README lấy từ dự án và máy thật, không đoán.
    category: constraint
    applies_to: HandoverReadme.prerequisites
    trigger: khi viết mục phần mềm cần có
    logic: >
      IF ghi phiên bản .NET, Node, npm, PostgreSQL, Git
      THEN lấy theo phiên bản dự án nhắm tới (file dự án backend, package.json) và phiên bản đã cài trên máy làm bài;
      ghi cả mức tối thiểu cần có.
    violation: sửa lại cho khớp nguồn thật.
    source: [FR7.4, AC5.1.1]

  - id: BR1.3
    statement: Không tài liệu nào chứa mật khẩu PostgreSQL thật.
    category: constraint
    applies_to: [HandoverReadme, DatabaseDiagramDoc, ApiListDoc]
    trigger: khi viết và trước khi Hiệp commit
    logic: >
      IF cần ví dụ connection string
      THEN dùng chữ giữ chỗ (ví dụ <mật-khẩu-của-bạn>) và chỉ cách đặt bằng user-secrets;
      rà lại bằng tìm chuỗi mật khẩu trong toàn repo trước khi commit.
    violation: xóa ngay khỏi file; nếu đã commit thì báo Hiệp trước khi làm gì tiếp.
    source: [NFR2, AC5.1.2]

  - id: BR1.4
    statement: Mọi lệnh trong README chạy được từ thư mục gốc của bản clone, theo đúng thứ tự ghi.
    category: validation
    applies_to: HandoverReadme
    trigger: khi đối chiếu bằng bản clone sạch
    logic: >
      IF một lệnh cần đứng ở thư mục con hoặc cần bước chưa ghi
      THEN README phải ghi rõ thư mục và bước đó.
    violation: sửa README, làm lại từ bước bị vướng.
    source: [NFR1, AC5.1.1]

  - id: BR1.5
    statement: Địa chỉ và cổng ghi trong tài liệu lấy từ cấu hình dự án thật.
    category: constraint
    applies_to: [HandoverReadme.addresses, ApiListDoc.conventions]
    trigger: khi viết mục địa chỉ
    logic: >
      IF ghi địa chỉ backend, frontend, OpenAPI
      THEN lấy từ cấu hình chạy của backend (launchSettings), cấu hình Vite và biến địa chỉ API của frontend;
      README và danh sách API dùng cùng một địa chỉ API.
    violation: sửa cho khớp cấu hình.
    source: [FR7.4, FR6.4]

  - id: BR1.6
    statement: Mục "Sự cố thường gặp" chỉ ghi lỗi đã gặp thật, mỗi lỗi kèm cách xử lý.
    category: policy
    applies_to: HandoverReadme.troubleshooting
    trigger: khi viết mục sự cố
    logic: >
      IF thêm một dòng sự cố
      THEN lỗi đó phải đã xảy ra khi làm U1–U5 (Smart App Control chặn file vừa build,
      chứng chỉ HTTPS localhost chưa tin cậy, psql không có trong PATH, ...); giữ 3–5 dòng.
    violation: bỏ dòng không có căn cứ.
    source: [FR7.4, AC5.1.1]

  # Nhóm 2: Sơ đồ database
  - id: BR2.1
    statement: Sơ đồ có đủ hai bảng, mọi cột, khóa chính, khóa ngoại và cột không trùng.
    category: validation
    applies_to: DatabaseDiagramDoc.erDiagram
    trigger: khi vẽ sơ đồ
    logic: >
      IF sơ đồ thiếu bảng departments hoặc employees, thiếu cột, thiếu PK, FK employees.department_id → departments.id,
      hoặc không đánh dấu tên phòng ban và email là không trùng
      THEN sơ đồ chưa đạt.
    violation: bổ sung trước khi đối chiếu.
    source: [FR7.2, AC5.3.1]

  - id: BR2.2
    statement: Tên bảng, tên cột, kiểu và ràng buộc trong tài liệu đúng như database sau khi chạy migration.
    category: validation
    applies_to: DatabaseDiagramDoc
    trigger: khi viết và khi đối chiếu bằng pgAdmin
    logic: >
      IF viết tên bảng, cột, ràng buộc
      THEN lấy từ migration và snapshot model của dự án, rồi so lại với pgAdmin;
      tên giữ đúng snake_case như trong database.
    violation: sửa tài liệu cho khớp database; không sửa migration trong U5.
    source: [FR7.2, AC5.3.2]

  - id: BR2.3
    statement: Tài liệu nêu rõ các ràng buộc database tự chặn, kèm tên ràng buộc thật.
    category: validation
    applies_to: DatabaseDiagramDoc.constraintList
    trigger: khi viết danh sách ràng buộc
    logic: >
      IF mô tả ràng buộc
      THEN ghi khóa ngoại kiểu chặn xóa phòng ban còn nhân viên, chỉ mục không trùng tên phòng ban
      và email không phân biệt hoa thường, cùng tên thật của từng ràng buộc.
    violation: bổ sung.
    source: [NFR3, AC5.3.1]

  - id: BR2.4
    statement: Tài liệu có cách thử ràng buộc bằng câu lệnh tay và lỗi PostgreSQL mong đợi.
    category: validation
    applies_to: DatabaseDiagramDoc.constraintTrial
    trigger: khi viết mục thử ràng buộc
    logic: >
      IF viết thử nghiệm
      THEN có hai ca: chèn email trùng khác hoa thường, xóa phòng ban còn nhân viên;
      mỗi ca ghi mã lỗi PostgreSQL nhận được khi chạy thật; thử xong phải trả dữ liệu về như cũ.
    violation: bổ sung hoặc sửa theo kết quả chạy thật.
    source: [NFR3, AC5.3.3]

  # Nhóm 3: Danh sách API
  - id: BR3.1
    statement: Danh sách có đủ 10 thao tác của C1, C2, mỗi thao tác đủ phương thức, đường dẫn, mô tả, request mẫu, response mẫu.
    category: validation
    applies_to: ApiListDoc
    trigger: khi viết và khi đối chiếu
    logic: >
      IF thiếu thao tác, hoặc một thao tác thiếu thành phần nào trong Operation
      THEN danh sách chưa đạt.
    violation: bổ sung.
    source: [FR7.3, FR6.1, AC5.2.1]

  - id: BR3.2
    statement: JSON mẫu là kết quả gọi thật lúc backend đang chạy, không tự viết tay.
    category: policy
    applies_to: Operation.responseExample
    trigger: khi lấy JSON mẫu (Q4 = A)
    logic: >
      IF ghi response mẫu
      THEN chép từ lần gọi thật bằng lệnh; dữ liệu thử là dữ liệu mẫu tiếng Việt, không dùng thông tin người thật;
      bản ghi tạo ra để thử phải xóa đi sau khi lấy xong.
    violation: gọi lại và chép kết quả thật.
    source: [FR7.3, AC5.2.2]

  - id: BR3.3
    statement: Mã thành công ghi đúng FR6.2 và đúng kết quả gọi thật.
    category: validation
    applies_to: Operation.successStatus
    trigger: khi viết và khi đối chiếu
    logic: >
      IF đọc hoặc sửa thì 200; tạo thì 201 kèm header Location; xóa thì 204 không body
      THEN ghi đúng như vậy; IF kết quả gọi thật khác THEN dừng lại báo Hiệp (đó là lệch giữa code và hợp đồng).
    violation: không tự sửa code; ghi lệch vào việc còn mở.
    source: [FR6.2, AC5.2.2]

  - id: BR3.4
    statement: Có ví dụ lỗi đầy đủ cho 400, 404, 409 dạng problem+json, lời báo tiếng Việt.
    category: validation
    applies_to: ApiListDoc.errorExamples
    trigger: khi viết mục ví dụ lỗi
    logic: >
      IF viết ví dụ lỗi
      THEN 400 = dữ liệu sai (có danh sách lỗi theo trường), 404 = id không tồn tại,
      409 = trùng tên/email và xóa phòng ban còn nhân viên; mỗi ví dụ ghi Content-Type application/problem+json
      và body thật.
    violation: bổ sung.
    source: [FR4.3, FR4.4, FR7.3, AC5.2.3]

  - id: BR3.5
    statement: Danh sách ghi cách mở trang OpenAPI ở môi trường Development và trang đó liệt kê đủ 10 thao tác.
    category: validation
    applies_to: ApiListDoc.openApiAccess
    trigger: khi viết và khi đối chiếu
    logic: >
      IF backend chạy ở Development
      THEN địa chỉ OpenAPI ghi trong tài liệu mở được và có đủ 10 thao tác.
    violation: sửa địa chỉ cho đúng; nếu thiếu thao tác thì báo Hiệp.
    source: [FR6.4, AC5.2.4]

  # Nhóm 4: Cách làm và đối chiếu
  - id: BR4.1
    statement: U5 không sửa code ứng dụng; chỗ lệch giữa tài liệu và code thì tài liệu ghi đúng hành vi thật.
    category: policy
    applies_to: [HandoverReadme, DatabaseDiagramDoc, ApiListDoc]
    trigger: khi phát hiện lệch
    logic: >
      IF code làm khác điều đã thiết kế hoặc khác comment
      THEN tài liệu ghi hành vi thật, và chuyển việc sửa code sang Build and Test (Q5 = A);
      ba việc đã biết: comment "200" ở EmployeeService.UpdateAsync, ErrorMapper chưa nhận 23001,
      source-manifest U4 còn 3 đường dẫn cũ.
    violation: không sửa code trong U5.
    source: [FR7.3, FR7.1]

  - id: BR4.2
    statement: Tài liệu viết tiếng Việt; tên trong code, đường dẫn, tên bảng, tên cột, tên trường JSON giữ nguyên tiếng Anh.
    category: policy
    applies_to: [HandoverReadme, DatabaseDiagramDoc, ApiListDoc]
    trigger: khi viết
    logic: IF viết lời giải thích THEN dùng tiếng Việt dễ hiểu; IF ghi định danh THEN giữ nguyên như trong code.
    violation: sửa chữ.
    source: [FR7.4, FR7.3]

  - id: BR4.3
    statement: Kiểm bản clone sạch do Hiệp tự làm theo README; chỗ README chưa rõ thì sửa rồi làm lại từ bước đó.
    category: policy
    applies_to: HandoverReadme
    trigger: sau khi ba tài liệu đã viết xong và đã đối chiếu với code
    logic: >
      IF Hiệp làm theo README trong một thư mục khác ngoài dự án (Q3 = A)
      THEN AI chỉ hướng dẫn; mỗi chỗ vướng ghi lại, sửa README, Hiệp làm lại từ bước vướng;
      kết thúc bằng một lượt thêm, sửa, xóa, tìm trên giao diện.
      Lưu ý: cùng máy thì user-secrets và employee_db đã có sẵn, ghi rõ hạn chế này trong kết quả đối chiếu.
    violation: chưa coi là xong khi Hiệp chưa chạy được.
    source: [NFR1, AC5.1.1, AC5.1.3]

  - id: BR4.4
    statement: Danh sách API được Hiệp kiểm lại bằng Postman ít nhất một thao tác mỗi loại.
    category: policy
    applies_to: ApiListDoc
    trigger: sau khi AI đã chép JSON thật vào danh sách (Q4 = A)
    logic: >
      IF đối chiếu bằng Postman
      THEN Hiệp gọi ít nhất một GET, một POST, một PUT, một DELETE và một ca lỗi;
      mã và body khớp danh sách thì đạt.
    violation: sửa danh sách theo kết quả thật.
    source: [FR6.4, AC5.2.2, AC5.2.3]
```

## Bảng tóm tắt

| ID | Luật (ngắn) | Áp cho | Nguồn |
|---|---|---|---|
| BR1.1 | README đủ các phần FR7.4 | README | FR7.4, AC5.1.1 |
| BR1.2 | Phiên bản lấy từ dự án và máy thật | README | FR7.4 |
| BR1.3 | Không mật khẩu thật trong tài liệu | Cả ba | NFR2, AC5.1.2 |
| BR1.4 | Lệnh chạy được từ gốc bản clone, đúng thứ tự | README | NFR1, AC5.1.1 |
| BR1.5 | Địa chỉ, cổng lấy từ cấu hình thật | README, API | FR7.4, FR6.4 |
| BR1.6 | Sự cố thường gặp chỉ ghi lỗi đã gặp thật | README | Q2 |
| BR2.1 | Sơ đồ đủ bảng, cột, PK, FK, cột không trùng | Sơ đồ | FR7.2, AC5.3.1 |
| BR2.2 | Tên và ràng buộc khớp database sau migration | Sơ đồ | AC5.3.2 |
| BR2.3 | Nêu ràng buộc DB tự chặn, kèm tên thật | Sơ đồ | NFR3, AC5.3.1 |
| BR2.4 | Có cách thử ràng buộc và lỗi mong đợi | Sơ đồ | NFR3, AC5.3.3 |
| BR3.1 | Đủ 10 thao tác, mỗi cái đủ 5 thành phần | API | FR7.3, AC5.2.1 |
| BR3.2 | JSON mẫu là kết quả gọi thật | API | AC5.2.2, Q4 |
| BR3.3 | Mã thành công đúng FR6.2 | API | FR6.2, AC5.2.2 |
| BR3.4 | Ví dụ lỗi 400/404/409 problem+json tiếng Việt | API | FR4.3, FR4.4, AC5.2.3 |
| BR3.5 | Cách mở OpenAPI, đủ 10 thao tác | API | FR6.4, AC5.2.4 |
| BR4.1 | U5 không sửa code; ghi hành vi thật | Cả ba | Q5 |
| BR4.2 | Viết tiếng Việt, giữ nguyên định danh | Cả ba | Code Style |
| BR4.3 | Hiệp tự kiểm bản clone sạch | README | AC5.1.1, AC5.1.3, Q3 |
| BR4.4 | Hiệp kiểm lại bằng Postman | API | AC5.2.2, AC5.2.3, Q4 |
