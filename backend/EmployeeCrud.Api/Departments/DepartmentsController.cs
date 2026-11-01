using Microsoft.AspNetCore.Mvc;

namespace EmployeeCrud.Api.Departments;

/// <summary>
/// API phòng ban (hợp đồng C1). Controller chỉ nhận request và trả mã HTTP; mọi luật nằm ở DepartmentService.
/// Lỗi nghiệp vụ (DomainError) do U1 đổi sang ProblemDetails 400/404/409.
/// </summary>
[ApiController]
[Route("api/departments")]
[Produces("application/json")]
public class DepartmentsController(IDepartmentService departments) : ControllerBase
{
    /// <summary>Danh sách phòng ban, sắp theo tên A-Z.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<DepartmentDto>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<DepartmentDto>> GetAll(CancellationToken cancellationToken) =>
        await departments.GetAllAsync(cancellationToken);

    /// <summary>Một phòng ban theo mã.</summary>
    // {id:int}: đường dẫn như /api/departments/abc không khớp route nào, nên trả 404.
    [HttpGet("{id:int}")]
    [ProducesResponseType<DepartmentDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<DepartmentDto> GetById(int id, CancellationToken cancellationToken) =>
        await departments.GetByIdAsync(id, cancellationToken);

    /// <summary>Thêm phòng ban. Trả 201 kèm header Location trỏ tới phòng ban mới.</summary>
    [HttpPost]
    [ProducesResponseType<DepartmentDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<ActionResult<DepartmentDto>> Create(DepartmentRequest request, CancellationToken cancellationToken)
    {
        var created = await departments.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Sửa tên phòng ban.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType<DepartmentDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    [ProducesResponseType<HttpValidationProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<DepartmentDto> Update(int id, DepartmentRequest request, CancellationToken cancellationToken) =>
        await departments.UpdateAsync(id, request, cancellationToken);

    /// <summary>Xóa hẳn phòng ban. Không xóa được khi còn nhân viên (409).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict, "application/problem+json")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await departments.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}