using EmployeeCrud.Api.Platform.Errors;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Tests.Platform;

public class ErrorMapperTests
{
    // Dựng lỗi database giả giống lỗi thật EF Core ném ra: DbUpdateException bọc PostgresException.
    private static DbUpdateException PostgresError(string sqlState, string? constraintName) =>
        new("Lỗi lưu dữ liệu", new PostgresException(
            messageText: "duplicate key value violates unique constraint",
            severity: "ERROR",
            invariantSeverity: "ERROR",
            sqlState: sqlState,
            constraintName: constraintName));

    private static HttpValidationProblemDetails AsValidation(Microsoft.AspNetCore.Mvc.ProblemDetails problem) =>
        Assert.IsType<HttpValidationProblemDetails>(problem);

    [Fact]
    public void NotFound_Returns404WithMessageAsDetail()
    {
        var problem = ErrorMapper.Map(DomainError.NotFound("Không tìm thấy phòng ban có mã 5."));

        Assert.Equal(404, problem.Status);
        Assert.Equal("Không tìm thấy", problem.Title);
        Assert.Equal("Không tìm thấy phòng ban có mã 5.", problem.Detail);
    }

    [Fact]
    public void Validation_Returns400WithFieldError()
    {
        var problem = AsValidation(ErrorMapper.Map(DomainError.Validation("departmentId", "Phòng ban không tồn tại")));

        Assert.Equal(400, problem.Status);
        Assert.Equal("Dữ liệu không hợp lệ", problem.Title);
        Assert.Equal(["Phòng ban không tồn tại"], problem.Errors["departmentId"]);
    }

    [Fact]
    public void ConflictWithField_Returns409WithFieldError()
    {
        var problem = AsValidation(ErrorMapper.Map(DomainError.Conflict("Email đã được sử dụng", field: "email")));

        Assert.Equal(409, problem.Status);
        Assert.Equal("Dữ liệu bị trùng", problem.Title);
        Assert.Equal(["Email đã được sử dụng"], problem.Errors["email"]);
    }

    [Fact]
    public void ConflictWithoutField_Returns409WithCustomTitleAndDetail()
    {
        var problem = ErrorMapper.Map(DomainError.Conflict(
            "Không thể xóa phòng ban vì vẫn còn nhân viên.", title: "Không thể xóa phòng ban"));

        Assert.IsNotType<HttpValidationProblemDetails>(problem);
        Assert.Equal(409, problem.Status);
        Assert.Equal("Không thể xóa phòng ban", problem.Title);
        Assert.Equal("Không thể xóa phòng ban vì vẫn còn nhân viên.", problem.Detail);
    }

    [Fact]
    public void UniqueViolationOnDepartmentName_Returns409WithNameError()
    {
        var problem = AsValidation(ErrorMapper.Map(PostgresError("23505", DbConstraintNames.DepartmentNameUnique)));

        Assert.Equal(409, problem.Status);
        Assert.Equal(["Tên phòng ban đã tồn tại"], problem.Errors["name"]);
    }

    [Fact]
    public void UniqueViolationOnEmployeeEmail_Returns409WithEmailError()
    {
        var problem = AsValidation(ErrorMapper.Map(PostgresError("23505", DbConstraintNames.EmployeeEmailUnique)));

        Assert.Equal(409, problem.Status);
        Assert.Equal(["Email đã được sử dụng"], problem.Errors["email"]);
    }

    [Fact]
    public void UniqueViolationOnUnknownConstraint_Returns500()
    {
        var problem = ErrorMapper.Map(PostgresError("23505", "ux_something_else"));

        Assert.Equal(500, problem.Status);
        Assert.Equal("Lỗi máy chủ", problem.Title);
    }

    [Fact]
    public void ForeignKeyViolationNotHandledByService_Returns409Fallback()
    {
        var problem = ErrorMapper.Map(PostgresError("23503", DbConstraintNames.EmployeeDepartmentForeignKey));

        Assert.Equal(409, problem.Status);
        Assert.Equal("Không thể thực hiện", problem.Title);
        Assert.False(string.IsNullOrWhiteSpace(problem.Detail));
    }

    // Build and Test (Loop-back 1): PostgreSQL báo 23001 khi xóa phòng ban còn nhân viên (ON DELETE RESTRICT).
    [Fact]
    public void RestrictViolationNotHandledByService_Returns409Fallback()
    {
        var problem = ErrorMapper.Map(PostgresError("23001", DbConstraintNames.EmployeeDepartmentForeignKey));

        Assert.Equal(409, problem.Status);
        Assert.Equal("Không thể thực hiện", problem.Title);
        Assert.False(string.IsNullOrWhiteSpace(problem.Detail));
    }

    [Fact]
    public void BadHttpRequest400_Returns400WithBodyError()
    {
        var problem = AsValidation(ErrorMapper.Map(new BadHttpRequestException("Bad JSON", 400)));

        Assert.Equal(400, problem.Status);
        Assert.Equal("Dữ liệu không hợp lệ", problem.Title);
        Assert.Equal(["Dữ liệu gửi lên không đúng định dạng JSON"], problem.Errors["body"]);
    }

    [Fact]
    public void BadHttpRequest413_KeepsItsStatusCode()
    {
        var problem = ErrorMapper.Map(new BadHttpRequestException("Too large", 413));

        Assert.Equal(413, problem.Status);
        Assert.Equal("Dữ liệu gửi lên quá lớn", problem.Title);
    }

    [Fact]
    public void UnknownException_Returns500WithoutLeakingOriginalMessage()
    {
        var problem = ErrorMapper.Map(new InvalidOperationException("SELECT * FROM secret_table"));

        Assert.Equal(500, problem.Status);
        Assert.Equal("Lỗi máy chủ", problem.Title);
        Assert.Equal("Đã có lỗi xảy ra, vui lòng thử lại sau.", problem.Detail);
        Assert.DoesNotContain("secret_table", problem.Detail);
    }
}