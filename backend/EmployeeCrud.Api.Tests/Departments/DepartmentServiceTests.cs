using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;

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

        Assert.Equal(new DepartmentDto(seeded[0].Id, "Kế toán"), result);
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

        Assert.Equal(new DepartmentDto(seeded[0].Id, "Tài chính"), result);
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
        Assert.Equal("Không thể xóa phòng ban \"Kế toán\" vì vẫn còn nhân viên.", error.Message);
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
}