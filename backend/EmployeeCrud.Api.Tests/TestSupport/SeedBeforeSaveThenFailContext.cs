using EmployeeCrud.Api.Platform.Data;

using Microsoft.EntityFrameworkCore;

namespace EmployeeCrud.Api.Tests.TestSupport;

/// <summary>
/// AppDbContext giả cho trường hợp chen nhau khi xóa phòng ban (BR5.2): ngay lúc lưu, nó thêm 2 nhân viên vào phòng
/// qua một context khác (cùng database InMemory, như một request khác vừa ghi xong) rồi mới ném lỗi khóa ngoại.
/// Nhờ vậy bước kiểm trước lúc xóa thấy 0 người, còn bước đếm lại trong nhánh bắt lỗi thấy 2 người.
/// </summary>
internal sealed class SeedBeforeSaveThenFailContext(
    DbContextOptions<AppDbContext> options, int departmentId, Exception toThrow)
    : AppDbContext(options)
{
    private readonly DbContextOptions<AppDbContext> _options = options;

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await TestDb.SeedEmployeeAsync(_options, "Chen Vao Mot", "chen1@congty.vn", departmentId);
        await TestDb.SeedEmployeeAsync(_options, "Chen Vao Hai", "chen2@congty.vn", departmentId);
        throw toThrow;
    }
}
