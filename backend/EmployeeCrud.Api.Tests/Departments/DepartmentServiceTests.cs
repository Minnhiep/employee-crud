using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;
using EmployeeCrud.Api.Tests.TestSupport;

using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Tests.Departments;

/// <summary>
/// Unit test cho luật nghiệp vụ phòng ban (BR1, BR2, NFR3.3). Số thứ tự (#) khớp bảng ca test trong unit-test-instructions.md.
/// </summary>
public class DepartmentServiceTests
{
    private readonly DbContextOptions<AppDbContext> _options = TestDb.CreateOptions();

    // Mỗi lần gọi là một AppDbContext mới trên cùng database InMemory, giống mỗi request một ngữ cảnh.
    private DepartmentService CreateService() => new(new AppDbContext(_options));

    private DepartmentService CreateServiceThatFailsOnSave(Exception toThrow) =>
        new(new ThrowingAppDbContext(_options, toThrow));

    private async Task<List<string>> NamesInDatabaseAsync()
    {
        await using var db = new AppDbContext(_options);
        return await db.Departments.Select(d => d.Name).ToListAsync();
    }

    private static DbUpdateException PostgresError(string sqlState, string constraintName) =>
        new("Lỗi lưu dữ liệu", new PostgresException(
            messageText: "update or delete violates foreign key constraint",
            severity: "ERROR",
            invariantSeverity: "ERROR",
            sqlState: sqlState,
            constraintName: constraintName));

    private static DomainError AssertDomainError(Exception exception, DomainErrorKind kind)
    {
        var error = Assert.IsType<DomainError>(exception);
        Assert.Equal(kind, error.Kind);
        return error;
    }

    // ---- Đọc danh sách ----

    [Fact] // #1. Dùng tên ASCII: InMemory sắp theo mã ký tự, thứ tự tiếng Việt có dấu chỉ kiểm được trên PostgreSQL thật.
    public async Task GetAll_ReturnsAllDepartmentsSortedByName()
    {
        await TestDb.SeedAsync(_options, "Gamma", "Alpha", "Beta");

        var result = await CreateService().GetAllAsync();

        Assert.Equal(["Alpha", "Beta", "Gamma"], result.Select(d => d.Name));
    }

    [Fact] // #2
    public async Task GetAll_WhenEmpty_ReturnsEmptyList()
    {
        var result = await CreateService().GetAllAsync();

        Assert.Empty(result);
    }

    // ---- Đọc một phòng ban ----

    [Fact] // #3
    public async Task GetById_WhenExists_ReturnsDto()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");

        var result = await CreateService().GetByIdAsync(seeded[0].Id);

        Assert.Equal(new DepartmentDto(seeded[0].Id, "Kế toán", 0), result);
    }

    [Fact] // #4
    public async Task GetById_WhenMissing_ThrowsNotFoundWithId()
    {
        var exception = await Record.ExceptionAsync(() => CreateService().GetByIdAsync(99));

        var error = AssertDomainError(exception!, DomainErrorKind.NotFound);
        Assert.Equal("Không tìm thấy phòng ban có mã 99.", error.Message);
    }

    // ---- Thêm ----

    [Fact] // #5
    public async Task Create_TrimsNameAndSaves()
    {
        var result = await CreateService().CreateAsync(new DepartmentRequest { Name = "  Marketing  " });

        Assert.True(result.Id > 0);
        Assert.Equal("Marketing", result.Name);
        Assert.Equal(["Marketing"], await NamesInDatabaseAsync());
    }

    [Theory] // #6
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task Create_WithBlankName_ThrowsValidationAndSavesNothing(string? name)
    {
        var exception = await Record.ExceptionAsync(() => CreateService().CreateAsync(new DepartmentRequest { Name = name }));

        var error = AssertDomainError(exception!, DomainErrorKind.Validation);
        Assert.Equal("name", error.Field);
        Assert.Equal("Vui lòng nhập tên phòng ban", error.Message);
        Assert.Empty(await NamesInDatabaseAsync());
    }

    [Fact] // #7
    public async Task Create_WithNameLongerThan100_ThrowsValidation()
    {
        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(new DepartmentRequest { Name = new string('a', 101) }));

        var error = AssertDomainError(exception!, DomainErrorKind.Validation);
        Assert.Equal("name", error.Field);
        Assert.Equal("Tên phòng ban tối đa 100 ký tự", error.Message);
    }

    [Fact] // #8. Biên: 100 ký tự sau khi bỏ khoảng trắng vẫn hợp lệ, dù chuỗi gửi lên dài hơn.
    public async Task Create_WithExactly100CharsAfterTrim_Saves()
    {
        var hundred = new string('a', 100);

        var result = await CreateService().CreateAsync(new DepartmentRequest { Name = $"  {hundred}  " });

        Assert.Equal(hundred, result.Name);
    }

    [Fact] // #9
    public async Task Create_WithSameNameDifferentCase_ThrowsConflictOnNameField()
    {
        await TestDb.SeedAsync(_options, "Kế toán");

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(new DepartmentRequest { Name = "KẾ TOÁN" }));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal("name", error.Field);
        Assert.Equal("Tên phòng ban đã tồn tại", error.Message);
        Assert.Equal(["Kế toán"], await NamesInDatabaseAsync());
    }

    // ---- Sửa ----

    [Fact] // #10
    public async Task Update_ChangesName()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");

        var result = await CreateService().UpdateAsync(seeded[0].Id, new DepartmentRequest { Name = " Tài chính " });

        Assert.Equal(new DepartmentDto(seeded[0].Id, "Tài chính", 0), result);
        Assert.Equal(["Tài chính"], await NamesInDatabaseAsync());
    }

    [Theory] // #11. Giữ tên của chính nó, hoặc chỉ đổi hoa thường, không bị coi là trùng.
    [InlineData("Kế toán")]
    [InlineData("KẾ TOÁN")]
    public async Task Update_WithOwnNameOrOnlyCaseChange_Saves(string newName)
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán", "Kinh doanh");

        var result = await CreateService().UpdateAsync(seeded[0].Id, new DepartmentRequest { Name = newName });

        Assert.Equal(newName, result.Name);
    }

    [Fact] // #12
    public async Task Update_WithNameOfAnotherDepartment_ThrowsConflict()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán", "Kinh doanh");

        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(seeded[0].Id, new DepartmentRequest { Name = "kinh DOANH" }));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal("name", error.Field);
    }

    [Fact] // #13
    public async Task Update_WhenMissing_ThrowsNotFound()
    {
        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(99, new DepartmentRequest { Name = "Tài chính" }));

        AssertDomainError(exception!, DomainErrorKind.NotFound);
    }

    [Fact] // #14
    public async Task Update_WithBlankName_ThrowsValidationAndKeepsOldName()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");

        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(seeded[0].Id, new DepartmentRequest { Name = "  " }));

        AssertDomainError(exception!, DomainErrorKind.Validation);
        Assert.Equal(["Kế toán"], await NamesInDatabaseAsync());
    }

    [Fact] // #15. Phòng ban bị xóa ở tab khác ngay trước khi lưu.
    public async Task Update_WhenRowDisappearsBeforeSave_ThrowsNotFound()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var service = CreateServiceThatFailsOnSave(new DbUpdateConcurrencyException("0 dòng bị tác động"));

        var exception = await Record.ExceptionAsync(
            () => service.UpdateAsync(seeded[0].Id, new DepartmentRequest { Name = "Tài chính" }));

        AssertDomainError(exception!, DomainErrorKind.NotFound);
    }

    // ---- Xóa ----

    [Fact] // #16
    public async Task Delete_RemovesDepartment()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán", "Kinh doanh");

        await CreateService().DeleteAsync(seeded[0].Id);

        Assert.Equal(["Kinh doanh"], await NamesInDatabaseAsync());
    }

    [Fact] // #17
    public async Task Delete_WhenMissing_ThrowsNotFound()
    {
        var exception = await Record.ExceptionAsync(() => CreateService().DeleteAsync(99));

        AssertDomainError(exception!, DomainErrorKind.NotFound);
    }

    [Fact] // #18. Còn nhân viên: PostgreSQL báo 23503 trên khóa ngoại fk_employees_department (U4 tạo).
    public async Task Delete_WhenEmployeesStillReferToIt_ThrowsConflictWithDepartmentName()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var service = CreateServiceThatFailsOnSave(
            PostgresError(PostgresErrorCodes.ForeignKeyViolation, DbConstraintNames.EmployeeDepartmentForeignKey));

        var exception = await Record.ExceptionAsync(() => service.DeleteAsync(seeded[0].Id));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Null(error.Field);
        Assert.Equal("Không thể xóa phòng ban", error.Title);
        Assert.Equal("Không thể xóa phòng ban \"Kế toán\" vì còn 1 nhân viên.", error.Message);
    }

    [Fact] // #19
    public async Task Delete_WhenRowDisappearsBeforeSave_ThrowsNotFound()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var service = CreateServiceThatFailsOnSave(new DbUpdateConcurrencyException("0 dòng bị tác động"));

        var exception = await Record.ExceptionAsync(() => service.DeleteAsync(seeded[0].Id));

        AssertDomainError(exception!, DomainErrorKind.NotFound);
    }

    [Fact] // #20. Lỗi database khác: không nuốt, ném nguyên để U1 trả 500 và ghi log.
    public async Task Delete_WhenOtherDatabaseError_RethrowsOriginalException()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var original = PostgresError(PostgresErrorCodes.ForeignKeyViolation, "fk_khac");
        var service = CreateServiceThatFailsOnSave(original);

        var exception = await Record.ExceptionAsync(() => service.DeleteAsync(seeded[0].Id));

        Assert.Same(original, exception);
    }

    [Fact] // D1 (U4, BR2.7). Còn nhân viên thì service chặn TRƯỚC khi xóa, phòng ban vẫn còn.
    public async Task Delete_WhenDepartmentHasEmployees_ThrowsConflict_AndKeepsDepartment()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", seeded[0].Id);

        var exception = await Record.ExceptionAsync(() => CreateService().DeleteAsync(seeded[0].Id));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal("Không thể xóa phòng ban", error.Title);
        Assert.Equal("Không thể xóa phòng ban \"Kế toán\" vì còn 1 nhân viên.", error.Message);
        Assert.Equal(["Kế toán"], await NamesInDatabaseAsync());
    }

    [Fact] // D2 (U4, NFR3.5). Bước kiểm trước và nhánh dự phòng 23503 ra cùng title và cùng câu.
    public async Task Delete_PreCheckAndForeignKeyFallback_ReturnTheSameError()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var fallbackService = CreateServiceThatFailsOnSave(
            PostgresError(PostgresErrorCodes.ForeignKeyViolation, DbConstraintNames.EmployeeDepartmentForeignKey));
        var fallback = AssertDomainError(
            (await Record.ExceptionAsync(() => fallbackService.DeleteAsync(seeded[0].Id)))!, DomainErrorKind.Conflict);

        await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", seeded[0].Id);
        var preCheck = AssertDomainError(
            (await Record.ExceptionAsync(() => CreateService().DeleteAsync(seeded[0].Id)))!, DomainErrorKind.Conflict);

        Assert.Equal(fallback.Title, preCheck.Title);
        Assert.Equal(fallback.Message, preCheck.Message);
    }

    [Fact] // D3 (U4). PostgreSQL thật báo 23001 cho khóa ngoại RESTRICT (thấy khi chạy trên pgAdmin): vẫn ra 409, không 500.
    public async Task Delete_WhenRestrictViolationOnSave_ThrowsConflictWithDepartmentName()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var service = CreateServiceThatFailsOnSave(
            PostgresError(PostgresErrorCodes.RestrictViolation, DbConstraintNames.EmployeeDepartmentForeignKey));

        var exception = await Record.ExceptionAsync(() => service.DeleteAsync(seeded[0].Id));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal("Không thể xóa phòng ban", error.Title);
        Assert.Equal("Không thể xóa phòng ban \"Kế toán\" vì còn 1 nhân viên.", error.Message);
    }

    // ---- Số nhân viên theo phòng ban (Change Request FR8, U4: BR5.1, BR5.2) ----

    [Fact] // D4. Danh sách có employeeCount đúng từng phòng, kể cả phòng 0 người.
    public async Task GetAll_ReturnsEmployeeCountPerDepartment()
    {
        var seeded = await TestDb.SeedAsync(_options, "Alpha", "Beta");
        await TestDb.SeedEmployeeAsync(_options, "An Le", "an@congty.vn", seeded[0].Id);
        await TestDb.SeedEmployeeAsync(_options, "Binh Tran", "binh@congty.vn", seeded[0].Id);

        var result = await CreateService().GetAllAsync();

        Assert.Equal([("Alpha", 2), ("Beta", 0)], result.Select(d => (d.Name, d.EmployeeCount)));
    }

    [Fact] // D5. Một phòng ban (trang chi tiết) có số người.
    public async Task GetById_ReturnsEmployeeCount()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        await TestDb.SeedEmployeeAsync(_options, "An Le", "an@congty.vn", seeded[0].Id);

        var result = await CreateService().GetByIdAsync(seeded[0].Id);

        Assert.Equal(new DepartmentDto(seeded[0].Id, "Kế toán", 1), result);
    }

    [Fact] // D6. Thêm mới trả 0; đổi tên trả số người hiện có (phản hồi POST/PUT cùng hình dạng GET).
    public async Task CreateAndUpdate_ReturnEmployeeCount()
    {
        var created = await CreateService().CreateAsync(new DepartmentRequest { Name = "Kế toán" });
        await TestDb.SeedEmployeeAsync(_options, "An Le", "an@congty.vn", created.Id);
        await TestDb.SeedEmployeeAsync(_options, "Binh Tran", "binh@congty.vn", created.Id);

        var updated = await CreateService().UpdateAsync(created.Id, new DepartmentRequest { Name = "Tài chính" });

        Assert.Equal(0, created.EmployeeCount);
        Assert.Equal(new DepartmentDto(created.Id, "Tài chính", 2), updated);
    }

    [Fact] // D7. Còn 2 người thì câu 409 nói đúng "còn 2 nhân viên", phòng ban vẫn còn.
    public async Task Delete_WhenTwoEmployees_MessageHasCount()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        await TestDb.SeedEmployeeAsync(_options, "An Le", "an@congty.vn", seeded[0].Id);
        await TestDb.SeedEmployeeAsync(_options, "Binh Tran", "binh@congty.vn", seeded[0].Id);

        var exception = await Record.ExceptionAsync(() => CreateService().DeleteAsync(seeded[0].Id));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal(DepartmentService.HasEmployeesMessage("Kế toán", 2), error.Message);
        Assert.Equal("Không thể xóa phòng ban \"Kế toán\" vì còn 2 nhân viên.", error.Message);
        Assert.Equal(["Kế toán"], await NamesInDatabaseAsync());
    }

    [Fact] // D8. Chen nhau: bước kiểm thấy 0 người, lúc lưu khóa ngoại chặn; đếm lại thấy 2 thì báo 2.
    public async Task Delete_WhenForeignKeyBlocksAfterRecount_ReportsCountNow()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        // Context giả thêm 2 nhân viên NGAY TRƯỚC lúc lưu (sau bước kiểm thấy 0 người) rồi ném lỗi khóa ngoại,
        // đúng như có người khác thêm nhân viên chen vào giữa hai bước.
        var service = new DepartmentService(new SeedBeforeSaveThenFailContext(
            _options,
            seeded[0].Id,
            PostgresError(PostgresErrorCodes.RestrictViolation, DbConstraintNames.EmployeeDepartmentForeignKey)));

        var exception = await Record.ExceptionAsync(() => service.DeleteAsync(seeded[0].Id));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal("Không thể xóa phòng ban \"Kế toán\" vì còn 2 nhân viên.", error.Message);
    }

    [Fact] // D9. Chen nhau mà đếm lại ra 0 (người đó vừa bị xóa tiếp): vẫn báo 1, không ra câu "còn 0 nhân viên".
    public async Task Delete_WhenForeignKeyBlocksButRecountIsZero_ReportsOne()
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var service = CreateServiceThatFailsOnSave(
            PostgresError(PostgresErrorCodes.ForeignKeyViolation, DbConstraintNames.EmployeeDepartmentForeignKey));

        var exception = await Record.ExceptionAsync(() => service.DeleteAsync(seeded[0].Id));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal("Không thể xóa phòng ban \"Kế toán\" vì còn 1 nhân viên.", error.Message);
    }

    // ---- Kiểm tồn tại (cho U4) ----

    [Theory] // #21
    [InlineData(true)]
    [InlineData(false)]
    public async Task Exists_ReturnsWhetherDepartmentExists(bool exists)
    {
        var seeded = await TestDb.SeedAsync(_options, "Kế toán");
        var id = exists ? seeded[0].Id : seeded[0].Id + 1000;

        var result = await CreateService().ExistsAsync(id);

        Assert.Equal(exists, result);
    }

    // ---- Chuẩn hóa tên (Step 11, rà soát N-04, S-04) ----
    // Viết bằng mã \u cho chữ có dấu và ký tự vô hình, để người đọc thấy rõ từng ký tự (ký tự vô hình gõ thẳng thì không nhìn thấy).
    private const string KeToanNfc = "K\u1EBF to\u00E1n"; // "Kế toán": ế, á là một ký tự dựng sẵn (NFC)
    private const string KeToanNfd = "Ke\u0302\u0301 toa\u0301n"; // trông y hệt, nhưng là e + dấu mũ + dấu sắc (NFD)

    [Fact] // #22. Gồm dấu cách, tab, khoảng trắng không ngắt (U+00A0).
    public async Task Create_CollapsesWhitespaceInsideName_AndSaves()
    {
        var result = await CreateService().CreateAsync(
            new DepartmentRequest { Name = " Kinh \t doanh\u00A0  mi\u1EC1n   B\u1EAFc " });

        Assert.Equal("Kinh doanh mi\u1EC1n B\u1EAFc", result.Name);
        Assert.Equal(["Kinh doanh mi\u1EC1n B\u1EAFc"], await NamesInDatabaseAsync());
    }

    [Fact] // #23. Hai dấu cách ở giữa không còn lách được luật không trùng.
    public async Task Create_WithExtraSpacesInsideExistingName_ThrowsConflict()
    {
        await TestDb.SeedAsync(_options, KeToanNfc);

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(new DepartmentRequest { Name = "K\u1EBF  to\u00E1n" }));

        var error = AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal("name", error.Field);
        Assert.Equal([KeToanNfc], await NamesInDatabaseAsync());
    }

    [Fact] // #24. Gõ kiểu tổ hợp thì lưu về dạng dựng sẵn, và lần gõ dựng sẵn sau đó bị coi là trùng.
    public async Task Create_WithDecomposedName_SavesComposedForm_AndDetectsDuplicate()
    {
        var created = await CreateService().CreateAsync(new DepartmentRequest { Name = KeToanNfd });

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(new DepartmentRequest { Name = KeToanNfc }));

        Assert.Equal(KeToanNfc, created.Name);
        AssertDomainError(exception!, DomainErrorKind.Conflict);
        Assert.Equal([KeToanNfc], await NamesInDatabaseAsync());
    }

    [Fact] // #25. Không dùng [InlineData]: nửa cặp surrogate không ghi được vào thuộc tính của test.
    public async Task Create_WithControlInvisibleOrBrokenCharacters_ThrowsValidationAndSavesNothing()
    {
        string[] names =
        [
            "\0", // ký tự NUL: trước đây PostgreSQL từ chối, API trả 500
            "K\u1EBF\u001Bto\u00E1n", // ESC
            "K\u1EBF\u200Bto\u00E1n", // dấu cách rộng 0
            "\u202Eto\u00E1n", // đảo chiều chữ (CVE-2021-42574)
            "\uFEFFK\u1EBF to\u00E1n", // BOM ở đầu
            "K\u1EBF\uD800to\u00E1n", // nửa cao đứng một mình
            "K\u1EBF\uDC00to\u00E1n", // nửa thấp đứng một mình
        ];

        foreach (var name in names)
        {
            var exception = await Record.ExceptionAsync(
                () => CreateService().CreateAsync(new DepartmentRequest { Name = name }));

            var error = AssertDomainError(exception!, DomainErrorKind.Validation);
            Assert.Equal("name", error.Field);
            Assert.Equal("Tên phòng ban chứa ký tự không hợp lệ", error.Message);
        }

        Assert.Empty(await NamesInDatabaseAsync());
    }

    [Fact] // #26. Ký tự đủ hai nửa surrogate (ví dụ emoji) là chữ hợp lệ, giữ nguyên.
    public async Task Create_WithCompleteSurrogatePair_Saves()
    {
        var result = await CreateService().CreateAsync(new DepartmentRequest { Name = "Ph\u00F2ng IT \U0001F680" });

        Assert.Equal("Ph\u00F2ng IT \U0001F680", result.Name);
    }

    [Fact] // #27
    public async Task Update_WithInvalidCharacter_ThrowsValidationAndKeepsOldName()
    {
        var seeded = await TestDb.SeedAsync(_options, KeToanNfc);

        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(seeded[0].Id, new DepartmentRequest { Name = "T\u00E0i\0ch\u00EDnh" }));

        var error = AssertDomainError(exception!, DomainErrorKind.Validation);
        Assert.Equal("Tên phòng ban chứa ký tự không hợp lệ", error.Message);
        Assert.Equal([KeToanNfc], await NamesInDatabaseAsync());
    }
}
