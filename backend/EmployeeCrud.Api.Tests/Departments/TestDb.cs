using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Platform.Data;

using Microsoft.EntityFrameworkCore;

namespace EmployeeCrud.Api.Tests.Departments;

/// <summary>
/// Tạo AppDbContext chạy trên database InMemory cho unit test service.
/// Mỗi lần gọi CreateOptions là một database mới (tên bằng Guid), nên các test không dính dữ liệu của nhau.
/// Giới hạn: InMemory không có chỉ mục không trùng, không có khóa ngoại, sắp xếp theo mã ký tự;
/// các điểm đó được kiểm tay trên PostgreSQL thật (xem unit-test-instructions.md).
/// </summary>
internal static class TestDb
{
    public static DbContextOptions<AppDbContext> CreateOptions() =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

    /// <summary>Nạp sẵn các phòng ban theo tên, trả về danh sách đã có id.</summary>
    public static async Task<List<Department>> SeedAsync(DbContextOptions<AppDbContext> options, params string[] names)
    {
        await using var db = new AppDbContext(options);
        var departments = names.Select(name => new Department { Name = name }).ToList();
        db.Departments.AddRange(departments);
        await db.SaveChangesAsync();
        return departments;
    }
}