using Microsoft.AspNetCore.Mvc;

namespace EmployeeCrud.Api.Employees;

/// <summary>
/// API nhân viên (hợp đồng C2). Controller chỉ nhận request và trả mã HTTP; mọi luật nằm ở EmployeeService.
/// Lỗi nghiệp vụ (DomainError) do U1 đổi sang ProblemDetails 400/404/409.
/// </summary>
[ApiController]
[Route("api/employees")]
[Produces("application/json")]
public class EmployeesController(IEmployeeService employees) : ControllerBase
{
    /// <summary>
    /// Danh sách nhân viên kèm tên phòng ban, sắp theo họ tên.
    /// Có <c>?search=</c> thì chỉ lấy người có họ tên hoặc email chứa chuỗi đó (không phân biệt hoa thường).
    /// </summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<EmployeeDto>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<EmployeeDto>> GetAll([FromQuery] string? search, CancellationToken cancellationToken) =>
        await employees.GetAllAsync(search, cancellationToken);

    /// <summary>Một nhân viên theo mã.</summary>
    // {id:int}: đường dẫn như /api/employees/abc không khớp route nào, nên trả 404.
    [HttpGet("{id:int}")]
    [ProducesResponseType<EmployeeDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<EmployeeDto> GetById(int id, CancellationToken cancellationToken) =>
        await employees.GetByIdAsync(id, cancellationToken);

    /// <summary>Thêm nhân viên. Trả 201 kèm header Location trỏ tới nhân viên mới.</summary>
    [HttpPost]
    [ProducesResponseType<EmployeeDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<ActionResult<EmployeeDto>> Create(EmployeeRequest request, CancellationToken cancellationToken)
    {
        var created = await employees.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Sửa nhân viên (họ tên, email, phòng ban).</summary>
    // Thứ tự lỗi: body thiếu trường bắt buộc hoặc sai kiểu bị ASP.NET trả 400 ngay khi nhận request,
    // trước khi vào hàm này. Body đủ hình dạng thì service tìm nhân viên trước (404) rồi mới kiểm nội dung.
    [HttpPut("{id:int}")]
    [ProducesResponseType<EmployeeDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<EmployeeDto> Update(int id, EmployeeRequest request, CancellationToken cancellationToken) =>
        await employees.UpdateAsync(id, request, cancellationToken);

    /// <summary>Xóa hẳn nhân viên.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await employees.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}