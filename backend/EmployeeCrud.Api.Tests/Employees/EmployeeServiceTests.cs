using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Employees;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;
using EmployeeCrud.Api.Tests.TestSupport;

using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Tests.Employees;

/// <summary>
/// Unit test cho luật nghiệp vụ nhân viên (BR1, BR2.1–BR2.6, NFR3.6). Số thứ tự (#) khớp bảng ca test
/// trong unit-test-instructions.md §5.1.
/// </summary>
public class EmployeeServiceTests
{
    private readonly DbContextOptions<AppDbContext> _options = TestDb.CreateOptions();

    // EmployeeService hỏi phòng ban qua DepartmentService thật trên cùng database InMemory (đường gọi C4),
    // mỗi service một AppDbContext riêng, giống mỗi request một ngữ cảnh.
    private EmployeeService CreateService() =>
        new(new AppDbContext(_options), new DepartmentService(new AppDbContext(_options)));

    // Giả lập lỗi lúc lưu mà InMemory không tự sinh ra (khóa ngoại 23503, dòng vừa bị xóa ở nơi khác...):
    // đọc vẫn chạy bình thường, chỉ SaveChangesAsync ném đúng lỗi được truyền vào.
    private EmployeeService CreateServiceThatFailsOnSave(Exception toThrow) =>
        new(new ThrowingAppDbContext(_options, toThrow), new DepartmentService(new AppDbContext(_options)));

    private async Task<int> SeedDepartmentAsync(string name = "Kế toán") =>
        (await TestDb.SeedAsync(_options, name))[0].Id;

    private async Task<List<Employee>> EmployeesInDatabaseAsync()
    {
        await using var db = new AppDbContext(_options);
        return await db.Employees.AsNoTracking().ToListAsync();
    }

    private static EmployeeRequest Request(string? fullName, string? email, int? departmentId) =>
        new() { FullName = fullName, Email = email, DepartmentId = departmentId };

    private static DbUpdateException PostgresError(string sqlState, string constraintName) =>
        new("Lỗi lưu dữ liệu", new PostgresException(
            messageText: "insert or update violates foreign key constraint",
            severity: "ERROR",
            invariantSeverity: "ERROR",
            sqlState: sqlState,
            constraintName: constraintName));

    private static DomainError AssertDomainError(Exception? exception, DomainErrorKind kind)
    {
        var error = Assert.IsType<DomainError>(exception);
        Assert.Equal(kind, error.Kind);
        return error;
    }

    private static void AssertValidation(Exception? exception, string field, string message)
    {
        var error = AssertDomainError(exception, DomainErrorKind.Validation);
        Assert.Equal(field, error.Field);
        Assert.Equal(message, error.Message);
    }

    // Ba nhân viên dùng cho các ca tìm kiếm: chỉ "Minh Le" có "minh"; "congty" nằm trong email của Minh và Hoa;
    // "Trần Bình" có dấu để thử "binh" không khớp.
    private async Task SeedSearchDataAsync()
    {
        var departmentId = await SeedDepartmentAsync();
        await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);
        await TestDb.SeedEmployeeAsync(_options, "Hoa Pham", "hoa@congty.vn", departmentId);
        await TestDb.SeedEmployeeAsync(_options, "Trần Bình", "tb@khac.vn", departmentId);
    }

    // ---- Đọc danh sách ----

    [Fact] // #1. Dùng tên ASCII: InMemory sắp theo mã ký tự, thứ tự tiếng Việt có dấu chỉ kiểm được trên PostgreSQL thật.
    public async Task GetAll_ReturnsEmployeesSortedByNameThenId_WithDepartmentName()
    {
        var departmentId = await SeedDepartmentAsync("Kỹ thuật");
        await TestDb.SeedEmployeeAsync(_options, "Cuong", "cuong@congty.vn", departmentId);
        var firstDung = await TestDb.SeedEmployeeAsync(_options, "Dung", "dung1@congty.vn", departmentId);
        await TestDb.SeedEmployeeAsync(_options, "An", "an@congty.vn", departmentId);
        var secondDung = await TestDb.SeedEmployeeAsync(_options, "Dung", "dung2@congty.vn", departmentId);
        await TestDb.SeedEmployeeAsync(_options, "Binh", "binh@congty.vn", departmentId);

        var result = await CreateService().GetAllAsync(search: null);

        Assert.Equal(["An", "Binh", "Cuong", "Dung", "Dung"], result.Select(e => e.FullName));
        Assert.Equal([firstDung.Id, secondDung.Id], result.Where(e => e.FullName == "Dung").Select(e => e.Id));
        Assert.All(result, e => Assert.Equal("Kỹ thuật", e.DepartmentName));
    }

    [Fact] // #2
    public async Task GetAll_WhenEmpty_ReturnsEmptyList()
    {
        var result = await CreateService().GetAllAsync(search: null);

        Assert.Empty(result);
    }

    // ---- Tìm kiếm ----

    [Fact] // #3. Không phân biệt hoa thường.
    public async Task Search_IsCaseInsensitive()
    {
        await SeedSearchDataAsync();

        var result = await CreateService().GetAllAsync("MINH");

        Assert.Equal(["Minh Le"], result.Select(e => e.FullName));
    }

    [Fact] // #4. Tìm cả trong email.
    public async Task Search_MatchesEmail()
    {
        await SeedSearchDataAsync();

        var result = await CreateService().GetAllAsync("congty");

        Assert.Equal(["Hoa Pham", "Minh Le"], result.Select(e => e.FullName));
    }

    [Fact] // #5
    public async Task Search_TrimsTerm()
    {
        await SeedSearchDataAsync();

        var result = await CreateService().GetAllAsync("  hoa  ");

        Assert.Equal(["Hoa Pham"], result.Select(e => e.FullName));
    }

    [Fact] // #6
    public async Task Search_WhenNothingMatches_ReturnsEmptyList()
    {
        await SeedSearchDataAsync();

        var result = await CreateService().GetAllAsync("zzz");

        Assert.Empty(result);
    }

    [Theory] // #7. Chuỗi tìm rỗng hoặc chỉ toàn khoảng trắng thì không lọc.
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task Search_WhenTermIsBlank_ReturnsEveryone(string? search)
    {
        await SeedSearchDataAsync();

        var result = await CreateService().GetAllAsync(search);

        Assert.Equal(3, result.Count);
    }

    [Fact] // #8. Có phân biệt dấu: "binh" không khớp "Bình", còn "bình" thì khớp.
    public async Task Search_IsAccentSensitive()
    {
        await SeedSearchDataAsync();
        var service = CreateService();

        var withoutAccent = await service.GetAllAsync("binh");
        var withAccent = await service.GetAllAsync("bình");

        Assert.Empty(withoutAccent);
        Assert.Equal(["Trần Bình"], withAccent.Select(e => e.FullName));
    }

    // ---- Đọc một nhân viên ----

    [Fact] // #9
    public async Task GetById_WhenExists_ReturnsDtoWithDepartmentName()
    {
        var departmentId = await SeedDepartmentAsync("Kế toán");
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);

        var result = await CreateService().GetByIdAsync(seeded.Id);

        Assert.Equal(new EmployeeDto(seeded.Id, "Minh Le", "minh@congty.vn", departmentId, "Kế toán"), result);
    }

    [Fact] // #10
    public async Task GetById_WhenMissing_ThrowsNotFound()
    {
        var exception = await Record.ExceptionAsync(() => CreateService().GetByIdAsync(99));

        var error = AssertDomainError(exception, DomainErrorKind.NotFound);
        Assert.Equal("Không tìm thấy nhân viên có mã 99.", error.Message);
    }

    // ---- Thêm ----

    [Fact] // #11. Bỏ khoảng trắng hai đầu; email giữ nguyên chữ hoa như đã gõ (Q1).
    public async Task Create_TrimsValues_AndKeepsEmailCaseAsTyped()
    {
        var departmentId = await SeedDepartmentAsync("Kế toán");

        var result = await CreateService().CreateAsync(Request("  Đỗ Văn An  ", "  Do.An@CongTy.vn  ", departmentId));

        Assert.True(result.Id > 0);
        Assert.Equal("Đỗ Văn An", result.FullName);
        Assert.Equal("Do.An@CongTy.vn", result.Email);
        Assert.Equal("Kế toán", result.DepartmentName);
        var saved = Assert.Single(await EmployeesInDatabaseAsync());
        Assert.Equal("Do.An@CongTy.vn", saved.Email);
    }

    [Theory] // #12
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task Create_WhenFullNameBlank_ThrowsValidation_AndSavesNothing(string? fullName)
    {
        var departmentId = await SeedDepartmentAsync();

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request(fullName, "a@congty.vn", departmentId)));

        AssertValidation(exception, "fullName", "Vui lòng nhập họ tên");
        Assert.Empty(await EmployeesInDatabaseAsync());
    }

    [Theory] // #13. 101 ký tự thì lỗi; đúng 100 ký tự kèm khoảng trắng hai đầu thì lưu được (đo sau khi trim).
    [InlineData(101, false)]
    [InlineData(100, true)]
    public async Task Create_ChecksFullNameLengthAfterTrim(int length, bool accepted)
    {
        var departmentId = await SeedDepartmentAsync();
        var fullName = "  " + new string('a', length) + "  ";

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request(fullName, "a@congty.vn", departmentId)));

        if (accepted)
        {
            Assert.Null(exception);
        }
        else
        {
            AssertValidation(exception, "fullName", "Họ tên tối đa 100 ký tự");
        }
    }

    [Fact] // #14
    public async Task Create_WhenEmailBlank_ThrowsValidation()
    {
        var departmentId = await SeedDepartmentAsync();

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("Minh Le", "  ", departmentId)));

        AssertValidation(exception, "email", "Vui lòng nhập email");
    }

    [Fact] // #15
    public async Task Create_WhenEmailTooLong_ThrowsValidation()
    {
        var departmentId = await SeedDepartmentAsync();
        var email = new string('a', 245) + "@congty.vn"; // 245 + 10 = 255 ký tự

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("Minh Le", email, departmentId)));

        AssertValidation(exception, "email", "Email tối đa 254 ký tự");
    }

    [Theory] // #16. Bộ ví dụ hợp lệ của BR1.6 (giống form). "a@b.vn\n" hợp lệ vì được trim trước khi kiểm.
    [InlineData("a@congty.vn")]
    [InlineData("an.nguyen@cong-ty.com.vn")]
    [InlineData("a@b.vn\n")]
    public async Task Create_AcceptsValidEmailFormats(string email)
    {
        var departmentId = await SeedDepartmentAsync();

        var result = await CreateService().CreateAsync(Request("Minh Le", email, departmentId));

        Assert.Equal(email.Trim(), result.Email);
    }

    [Theory] // #17. Bộ ví dụ không hợp lệ của BR1.6 (giống form).
    [InlineData("abc")]
    [InlineData("a@b")]
    [InlineData("a @b.vn")]
    [InlineData("a@b.")]
    [InlineData("a@@b.vn")]
    [InlineData("a@.b.vn")]
    [InlineData("a@b..vn")]
    public async Task Create_RejectsInvalidEmailFormats(string email)
    {
        var departmentId = await SeedDepartmentAsync();

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("Minh Le", email, departmentId)));

        AssertValidation(exception, "email", "Email không đúng định dạng");
    }

    [Theory] // #18
    [InlineData(null)]
    [InlineData(0)]
    public async Task Create_WhenDepartmentNotChosen_ThrowsValidation(int? departmentId)
    {
        await SeedDepartmentAsync();

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("Minh Le", "minh@congty.vn", departmentId)));

        AssertValidation(exception, "departmentId", "Vui lòng chọn phòng ban");
    }

    [Fact] // #19
    public async Task Create_WhenDepartmentDoesNotExist_ThrowsValidation()
    {
        await SeedDepartmentAsync();

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("Minh Le", "minh@congty.vn", 999)));

        AssertValidation(exception, "departmentId", "Phòng ban không tồn tại");
    }

    [Fact] // #20. Trùng email khác hoa thường.
    public async Task Create_WhenEmailTakenIgnoringCase_ThrowsConflict()
    {
        var departmentId = await SeedDepartmentAsync();
        await TestDb.SeedEmployeeAsync(_options, "Minh Le", "a@congty.vn", departmentId);

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("Hoa Pham", "A@CongTy.VN", departmentId)));

        var error = AssertDomainError(exception, DomainErrorKind.Conflict);
        Assert.Equal("email", error.Field);
        Assert.Equal("Email đã được sử dụng", error.Message);
    }

    [Fact] // #21. Thứ tự kiểm: phòng ban sai (400) được báo trước email trùng (409).
    public async Task Create_ChecksDepartmentBeforeEmailConflict()
    {
        var departmentId = await SeedDepartmentAsync();
        await TestDb.SeedEmployeeAsync(_options, "Minh Le", "a@congty.vn", departmentId);

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("Hoa Pham", "a@congty.vn", 999)));

        AssertValidation(exception, "departmentId", "Phòng ban không tồn tại");
    }

    [Fact] // #22. Phòng ban bị xóa giữa lúc kiểm và lúc lưu: khóa ngoại báo 23503.
    public async Task Create_WhenDepartmentForeignKeyFailsOnSave_ThrowsValidation()
    {
        var departmentId = await SeedDepartmentAsync();
        var service = CreateServiceThatFailsOnSave(
            PostgresError(PostgresErrorCodes.ForeignKeyViolation, DbConstraintNames.EmployeeDepartmentForeignKey));

        var exception = await Record.ExceptionAsync(
            () => service.CreateAsync(Request("Minh Le", "minh@congty.vn", departmentId)));

        AssertValidation(exception, "departmentId", "Phòng ban không tồn tại");
    }

    // ---- Sửa ----

    [Fact] // #23
    public async Task Update_ChangesDepartment()
    {
        var oldDepartmentId = await SeedDepartmentAsync("Kế toán");
        var newDepartmentId = await SeedDepartmentAsync("Kỹ thuật");
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", oldDepartmentId);

        var result = await CreateService().UpdateAsync(
            seeded.Id, Request("Minh Le", "minh@congty.vn", newDepartmentId));

        Assert.Equal("Kỹ thuật", result.DepartmentName);
        var saved = Assert.Single(await EmployeesInDatabaseAsync());
        Assert.Equal(newDepartmentId, saved.DepartmentId);
    }

    [Theory] // #24. Giữ email của mình, hoặc chỉ đổi hoa thường email của mình: không coi là trùng.
    [InlineData("minh@congty.vn")]
    [InlineData("Minh@CongTy.VN")]
    public async Task Update_AllowsOwnEmail(string email)
    {
        var departmentId = await SeedDepartmentAsync();
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);

        var result = await CreateService().UpdateAsync(seeded.Id, Request("Minh Le", email, departmentId));

        Assert.Equal(email, result.Email);
    }

    [Fact] // #25
    public async Task Update_WhenEmailBelongsToSomeoneElse_ThrowsConflict()
    {
        var departmentId = await SeedDepartmentAsync();
        await TestDb.SeedEmployeeAsync(_options, "Hoa Pham", "hoa@congty.vn", departmentId);
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);

        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(seeded.Id, Request("Minh Le", "HOA@congty.vn", departmentId)));

        var error = AssertDomainError(exception, DomainErrorKind.Conflict);
        Assert.Equal("email", error.Field);
    }

    [Fact] // #26. Tìm nhân viên trước khi kiểm dữ liệu: id không có thì 404, dù body cũng sai.
    public async Task Update_WhenMissing_ThrowsNotFound_EvenIfBodyInvalid()
    {
        await SeedDepartmentAsync();

        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(999, Request("", "abc", null)));

        var error = AssertDomainError(exception, DomainErrorKind.NotFound);
        Assert.Equal("Không tìm thấy nhân viên có mã 999.", error.Message);
    }

    [Fact] // #27. Dòng vừa bị xóa ở nơi khác sau khi đọc.
    public async Task Update_WhenRowDisappearsBeforeSave_ThrowsNotFound()
    {
        var departmentId = await SeedDepartmentAsync();
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);
        var service = CreateServiceThatFailsOnSave(new DbUpdateConcurrencyException("0 dòng bị tác động"));

        var exception = await Record.ExceptionAsync(
            () => service.UpdateAsync(seeded.Id, Request("Minh Le Van", "minh@congty.vn", departmentId)));

        AssertDomainError(exception, DomainErrorKind.NotFound);
    }

    [Fact] // #28
    public async Task Update_WhenDepartmentForeignKeyFailsOnSave_ThrowsValidation()
    {
        var departmentId = await SeedDepartmentAsync();
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);
        var service = CreateServiceThatFailsOnSave(
            PostgresError(PostgresErrorCodes.ForeignKeyViolation, DbConstraintNames.EmployeeDepartmentForeignKey));

        var exception = await Record.ExceptionAsync(
            () => service.UpdateAsync(seeded.Id, Request("Minh Le Van", "minh@congty.vn", departmentId)));

        AssertValidation(exception, "departmentId", "Phòng ban không tồn tại");
    }

    // ---- Xóa ----

    [Fact] // #29. Xóa hẳn khỏi database.
    public async Task Delete_RemovesEmployee()
    {
        var departmentId = await SeedDepartmentAsync();
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);

        await CreateService().DeleteAsync(seeded.Id);

        Assert.Empty(await EmployeesInDatabaseAsync());
    }

    [Fact] // #30
    public async Task Delete_WhenMissing_ThrowsNotFound()
    {
        var exception = await Record.ExceptionAsync(() => CreateService().DeleteAsync(99));

        AssertDomainError(exception, DomainErrorKind.NotFound);
    }

    [Fact] // #31
    public async Task Delete_WhenRowDisappearsBeforeSave_ThrowsNotFound()
    {
        var departmentId = await SeedDepartmentAsync();
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);
        var service = CreateServiceThatFailsOnSave(new DbUpdateConcurrencyException("0 dòng bị tác động"));

        var exception = await Record.ExceptionAsync(() => service.DeleteAsync(seeded.Id));

        AssertDomainError(exception, DomainErrorKind.NotFound);
    }

    [Fact] // #32. Lỗi database khác: không nuốt, ném nguyên để U1 trả 500 và ghi log.
    public async Task Create_WhenOtherDatabaseError_RethrowsOriginalException()
    {
        var departmentId = await SeedDepartmentAsync();
        var original = PostgresError(PostgresErrorCodes.ForeignKeyViolation, "fk_khac");
        var service = CreateServiceThatFailsOnSave(original);

        var exception = await Record.ExceptionAsync(
            () => service.CreateAsync(Request("Minh Le", "minh@congty.vn", departmentId)));

        Assert.Same(original, exception);
    }

    // ---- Chuẩn hóa họ tên, email và chuỗi tìm (Step 11, rà soát N-04, S-04, A-08) ----
    // Viết bằng mã \u cho chữ có dấu và ký tự vô hình, để người đọc thấy rõ từng ký tự (ký tự vô hình gõ thẳng thì không nhìn thấy).

    [Fact] // #33. Gồm tab, khoảng trắng không ngắt (U+00A0) và chữ gõ kiểu tổ hợp (ễ = e + dấu mũ + dấu ngã).
    public async Task Create_NormalizesFullNameWhitespaceAndComposedForm()
    {
        var departmentId = await SeedDepartmentAsync();

        var result = await CreateService().CreateAsync(
            Request(" Nguye\u0302\u0303n \t V\u0103n\u00A0  An ", "an@congty.vn", departmentId));

        Assert.Equal("Nguy\u1EC5n V\u0103n An", result.FullName);
        Assert.Equal("Nguy\u1EC5n V\u0103n An", Assert.Single(await EmployeesInDatabaseAsync()).FullName);
    }

    [Fact] // #34. Không dùng [InlineData]: nửa cặp surrogate không ghi được vào thuộc tính của test.
    public async Task Create_WithInvalidCharacterInFullName_ThrowsValidationAndSavesNothing()
    {
        var departmentId = await SeedDepartmentAsync();
        string[] names =
        [
            "Minh\0Le", // NUL
            "Minh\u200BLe", // dấu cách rộng 0
            "\u202ELe Minh", // đảo chiều chữ (CVE-2021-42574)
            "Minh\uD800Le", // nửa cặp surrogate đứng một mình
        ];

        foreach (var name in names)
        {
            var exception = await Record.ExceptionAsync(
                () => CreateService().CreateAsync(Request(name, "minh@congty.vn", departmentId)));

            AssertValidation(exception, "fullName", "Họ tên chứa ký tự không hợp lệ");
        }

        Assert.Empty(await EmployeesInDatabaseAsync());
    }

    [Fact] // #35. U+200B không phải khoảng trắng nên trước Step 11 lọt qua luật định dạng email.
    public async Task Create_WithInvalidCharacterInEmail_ThrowsValidationAndSavesNothing()
    {
        var departmentId = await SeedDepartmentAsync();
        string[] emails = ["minh\u200B@congty.vn", "minh\0@congty.vn"];

        foreach (var email in emails)
        {
            var exception = await Record.ExceptionAsync(
                () => CreateService().CreateAsync(Request("Minh Le", email, departmentId)));

            AssertValidation(exception, "email", "Email chứa ký tự không hợp lệ");
        }

        Assert.Empty(await EmployeesInDatabaseAsync());
    }

    [Fact] // #36. Email có chữ có dấu gõ kiểu tổ hợp, trùng email dạng dựng sẵn đã có: không lách được BR1.7.
    public async Task Create_WithDecomposedFormOfExistingEmail_ThrowsConflict()
    {
        var departmentId = await SeedDepartmentAsync();
        await TestDb.SeedEmployeeAsync(_options, "Minh Le", "nguy\u1EC5n@congty.vn", departmentId);

        var exception = await Record.ExceptionAsync(
            () => CreateService().CreateAsync(Request("An Tran", "nguye\u0302\u0303n@congty.vn", departmentId)));

        var error = AssertDomainError(exception, DomainErrorKind.Conflict);
        Assert.Equal("email", error.Field);
        Assert.Single(await EmployeesInDatabaseAsync());
    }

    [Fact] // #37. Dùng ngữ cảnh database đã đóng: nếu service còn gửi câu truy vấn thì test ném lỗi. Vậy test chứng minh
    // chuỗi có ký tự lạ không bao giờ xuống tới database (PostgreSQL thật từ chối U+0000, trước đây API trả 500).
    public async Task GetAll_WithInvalidCharacterInSearch_ReturnsEmptyWithoutQueryingDatabase()
    {
        var closedDb = new AppDbContext(_options);
        await closedDb.DisposeAsync();
        var service = new EmployeeService(closedDb, new DepartmentService(new AppDbContext(_options)));

        Assert.Empty(await service.GetAllAsync("minh\0"));
        Assert.Empty(await service.GetAllAsync("\u200Bminh"));
    }

    [Fact] // #38. Chuỗi tìm được chuẩn hóa như dữ liệu đã lưu: hai dấu cách, hoặc gõ kiểu tổ hợp, vẫn tìm ra.
    public async Task GetAll_NormalizesSearchTermBeforeMatching()
    {
        var departmentId = await SeedDepartmentAsync();
        await TestDb.SeedEmployeeAsync(_options, "Nguy\u1EC5n V\u0103n An", "an@congty.vn", departmentId);
        await TestDb.SeedEmployeeAsync(_options, "Hoa Pham", "hoa@congty.vn", departmentId);

        var withTwoSpaces = await CreateService().GetAllAsync("nguy\u1EC5n  v\u0103n");
        var decomposed = await CreateService().GetAllAsync("nguye\u0302\u0303n");

        Assert.Equal(["Nguy\u1EC5n V\u0103n An"], withTwoSpaces.Select(e => e.FullName));
        Assert.Equal(["Nguy\u1EC5n V\u0103n An"], decomposed.Select(e => e.FullName));
    }

    [Fact] // #39 (A-08). Lỗi tranh chấp khi THÊM MỚI là bất thường: ném nguyên, không báo "Không tìm thấy nhân viên có mã 0".
    public async Task Create_WhenConcurrencyErrorOnSave_RethrowsOriginalException()
    {
        var departmentId = await SeedDepartmentAsync();
        var original = new DbUpdateConcurrencyException("0 dòng bị tác động");
        var service = CreateServiceThatFailsOnSave(original);

        var exception = await Record.ExceptionAsync(
            () => service.CreateAsync(Request("Minh Le", "minh@congty.vn", departmentId)));

        Assert.Same(original, exception);
    }

    [Fact] // #40
    public async Task Update_WithInvalidCharacterInFullName_ThrowsValidationAndKeepsOldData()
    {
        var departmentId = await SeedDepartmentAsync();
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);

        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(seeded.Id, Request("Minh\0Le", "minh@congty.vn", departmentId)));

        AssertValidation(exception, "fullName", "Họ tên chứa ký tự không hợp lệ");
        Assert.Equal("Minh Le", Assert.Single(await EmployeesInDatabaseAsync()).FullName);
    }

    [Fact] // #41 (rà soát U4 R-08). Sửa với email chứa ký tự vô hình: báo đúng ô email, dữ liệu cũ giữ nguyên.
    public async Task Update_WithInvalidCharacterInEmail_ThrowsValidationAndKeepsOldData()
    {
        var departmentId = await SeedDepartmentAsync();
        var seeded = await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departmentId);

        var exception = await Record.ExceptionAsync(
            () => CreateService().UpdateAsync(seeded.Id, Request("Minh Le", "minh\u200B@congty.vn", departmentId)));

        AssertValidation(exception, "email", "Email chứa ký tự không hợp lệ");
        Assert.Equal("minh@congty.vn", Assert.Single(await EmployeesInDatabaseAsync()).Email);
    }

    // ---- Lọc theo phòng ban (Change Request FR8.3, BR5.3) ----

    // Hai phòng: Kế toán có Minh, Hoa; Kỹ thuật có An. Trả về id của hai phòng.
    private async Task<(int Accounting, int Engineering)> SeedTwoDepartmentsAsync()
    {
        var departments = await TestDb.SeedAsync(_options, "Kế toán", "Kỹ thuật");
        await TestDb.SeedEmployeeAsync(_options, "Minh Le", "minh@congty.vn", departments[0].Id);
        await TestDb.SeedEmployeeAsync(_options, "Hoa Pham", "hoa@congty.vn", departments[0].Id);
        await TestDb.SeedEmployeeAsync(_options, "An Tran", "an@congty.vn", departments[1].Id);
        return (departments[0].Id, departments[1].Id);
    }

    [Fact] // #42. Chỉ lấy người của phòng được chọn, vẫn sắp theo họ tên.
    public async Task GetAll_WithDepartmentId_ReturnsOnlyThatDepartment()
    {
        var (accounting, _) = await SeedTwoDepartmentsAsync();

        var result = await CreateService().GetAllAsync(search: null, departmentId: accounting.ToString());

        Assert.Equal(["Hoa Pham", "Minh Le"], result.Select(e => e.FullName));
    }

    [Fact] // #43. Lọc và tìm cùng lúc: phải thỏa cả hai (AND).
    public async Task GetAll_WithDepartmentIdAndSearch_AppliesBoth()
    {
        var (accounting, engineering) = await SeedTwoDepartmentsAsync();

        var inAccounting = await CreateService().GetAllAsync("minh", accounting.ToString());
        var inEngineering = await CreateService().GetAllAsync("minh", engineering.ToString());

        Assert.Equal(["Minh Le"], inAccounting.Select(e => e.FullName));
        Assert.Empty(inEngineering);
    }

    [Theory] // #44. Rỗng hoặc chỉ khoảng trắng nghĩa là không lọc.
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetAll_WithEmptyDepartmentId_ReturnsEveryone(string? departmentId)
    {
        await SeedTwoDepartmentsAsync();

        var result = await CreateService().GetAllAsync(search: null, departmentId);

        Assert.Equal(3, result.Count);
    }

    [Theory] // #45–#48. Không phải số nguyên dương viết bằng chữ số 0-9 trong phạm vi int: 400 tiếng Việt ở ô departmentId.
    [InlineData("abc")] // #45
    [InlineData("0")] // #46
    [InlineData("-1")] // #46
    [InlineData("99999999999")] // #47: vượt int
    [InlineData(" 5")] // #48: có khoảng trắng
    [InlineData("+5")] // #48: có dấu
    [InlineData("1.5")]
    public async Task GetAll_WithInvalidDepartmentId_ThrowsValidation(string departmentId)
    {
        await SeedTwoDepartmentsAsync();

        var exception = await Record.ExceptionAsync(() => CreateService().GetAllAsync(search: null, departmentId));

        AssertValidation(exception, "departmentId", "Phòng ban lọc không hợp lệ");
    }

    [Fact] // #49. Số hợp lệ nhưng không có phòng đó: lọc không ra ai, trả rỗng (không phải 404).
    public async Task GetAll_WithUnknownDepartmentId_ReturnsEmptyList()
    {
        var (accounting, engineering) = await SeedTwoDepartmentsAsync();
        var unknown = Math.Max(accounting, engineering) + 1000;

        var result = await CreateService().GetAllAsync(search: null, unknown.ToString());

        Assert.Empty(result);
    }

    [Fact] // #50. Phòng lọc sai được báo trước, kể cả khi chuỗi tìm cũng có ký tự lạ (bình thường trả rỗng).
    public async Task GetAll_WithInvalidDepartmentIdAndInvalidSearch_ThrowsValidationFirst()
    {
        await SeedTwoDepartmentsAsync();
        var searchWithControlCharacter = "minh" + (char)0;

        var exception = await Record.ExceptionAsync(
            () => CreateService().GetAllAsync(searchWithControlCharacter, "abc"));

        AssertValidation(exception, "departmentId", "Phòng ban lọc không hợp lệ");
    }
}
