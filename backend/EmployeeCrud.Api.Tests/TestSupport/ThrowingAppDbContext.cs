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
    // Chỉ ghi đè SaveChangesAsync: các truy vấn đọc (AnyAsync, CountAsync...) trước bước lưu vẫn chạy thật trên InMemory.
    // Lỗi được ném ngay khi gọi hàm; service gọi kèm await bên trong try/catch nên bắt được y như lỗi thật từ database.
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        throw toThrow;
}