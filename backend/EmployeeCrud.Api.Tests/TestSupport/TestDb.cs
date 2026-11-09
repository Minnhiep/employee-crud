using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Employees;
using EmployeeCrud.Api.Platform.Data;

using Microsoft.EntityFrameworkCore;

namespace EmployeeCrud.Api.Tests.TestSupport;

/// <summary>
/// Tạo AppDbContext chạy trên database InMemory cho unit test service.
/// Mỗi lần gọi CreateOptions là một database mới (tên bằng Guid), nên các test không dính dữ liệu của nhau.
/// Giới hạn: InMemory không có chỉ mục không trùng, không có khóa ngoại, sắp xếp theo mã ký tự;
/// các điểm đó được kiểm tay trên PostgreSQL thật.
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
        // Nạp bằng context riêng rồi đóng ngay: service trong test mở context khác, nên phải đọc lại
        // từ database, không lấy được đối tượng còn nhớ sẵn trong context nạp dữ liệu.
        await using var db = new AppDbContext(options);
        var departments = names.Select(name => new Department { Name = name }).ToList();
        db.Departments.AddRange(departments);
        await db.SaveChangesAsync();
        return departments;
    }

    /// <summary>Nạp sẵn một nhân viên thuộc phòng ban đã có, trả về nhân viên đã có id.</summary>
    public static async Task<Employee> SeedEmployeeAsync(
        DbContextOptions<AppDbContext> options, string fullName, string email, int departmentId)
    {
        await using var db = new AppDbContext(options);
        var employee = new Employee { FullName = fullName, Email = email, DepartmentId = departmentId };
        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        return employee;
    }
}