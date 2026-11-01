using System.ComponentModel.DataAnnotations;

using EmployeeCrud.Api.Platform.Errors;

using Microsoft.AspNetCore.Mvc;

namespace EmployeeCrud.Api.Tests.Platform;

/// <summary>
/// Controller chỉ có trong project test (đăng ký qua AddApplicationPart), dùng để gây ra từng loại lỗi
/// và kiểm phần nền của U1 trước khi có controller thật của phòng ban / nhân viên.
/// </summary>
[ApiController]
[Route("api/test-only")]
public sealed class TestOnlyController : ControllerBase
{
    [HttpGet("throw")]
    public IActionResult Throw() => throw new InvalidOperationException("Lỗi giả lập trong test");

    [HttpGet("conflict")]
    public IActionResult ThrowConflict() => throw DomainError.Conflict("Email đã được sử dụng", field: "email");

    [HttpPost("validate")]
    public IActionResult Validate(TestRequest request) => Ok(request);

    public sealed class TestRequest
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string? FullName { get; set; }

        public int DepartmentId { get; set; }
    }
}