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

    [HttpGet("ok")]
    public IActionResult Success() => Ok(new { message = "ok" });

    // Đếm số lần request chậm thật sự bị hủy phía máy chủ, để test chắc là việc hủy đã đi tới đây (không đạt giả).
    public static int SlowRequestsCancelled;

    // Chạy lâu để test kịp hủy request giữa chừng, giống trang hủy lời gọi cũ khi người dùng tìm kiếm mới.
    [HttpGet("slow")]
    public async Task<IActionResult> Slow(CancellationToken cancellationToken)
    {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            return Ok();
        }
        catch (OperationCanceledException)
        {
            Interlocked.Increment(ref SlowRequestsCancelled);
            throw;
        }
    }

    [HttpGet("conflict")]
    public IActionResult ThrowConflict() => throw DomainError.Conflict("Email đã được sử dụng", field: "email");

    [HttpPost("validate")]
    public IActionResult Validate(TestRequest request) => Ok(request);

    // Giống controller thật của U3, U4: [Produces("application/json")] là bộ lọc kết quả,
    // ghi đè loại nội dung của mọi ObjectResult (Build and Test, Loop-back 1).
    [HttpPost("validate-produces-json")]
    [Produces("application/json")]
    public IActionResult ValidateWithProducesJson(TestRequest request) => Ok(request);

    // Lời báo có ký tự HTML, để test chắc phản hồi 400 mã hóa < > (rà soát U1 R-10, S-09).
    [HttpPost("validate-html")]
    public IActionResult ValidateHtml(HtmlRequest request) => Ok(request);

    public sealed class HtmlRequest
    {
        [Required(ErrorMessage = "Ghi chú <b> là bắt buộc")]
        public string? Note { get; set; }
    }

    public sealed class TestRequest
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string? FullName { get; set; }

        public int DepartmentId { get; set; }
    }
}