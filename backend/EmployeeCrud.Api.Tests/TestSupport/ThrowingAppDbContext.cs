using EmployeeCrud.Api.Platform.Data;

using Microsoft.EntityFrameworkCore;

namespace EmployeeCrud.Api.Tests.TestSupport;

/// <summary>
/// AppDbContext giả: đọc dữ liệu bình thường từ InMemory, nhưng khi lưu thì ném sẵn lỗi được truyền vào.
/// Dùng để thử các đường lỗi mà InMemory không tự sinh ra được: tranh chấp (DbUpdateConcurrencyException)
/// và vi phạm khóa ngoại 23503 của PostgreSQL.
/// </summary>
internal sealed class ThrowingAppDbContext(DbContextOptions<AppDbContext> options, Exception toThrow)
    : AppDbContext(options)
{
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        throw toThrow;
}