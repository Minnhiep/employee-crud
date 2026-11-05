using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Employees;

using Microsoft.EntityFrameworkCore;

namespace EmployeeCrud.Api.Platform.Data;

/// <summary>
/// Ngữ cảnh database dùng chung cho cả backend.
/// Phần phòng ban và phần nhân viên tự khai DbSet và cấu hình bảng của mình.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Department> Departments => Set<Department>();

    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tự nạp mọi lớp IEntityTypeConfiguration trong project, để mỗi phần nghiệp vụ giữ cấu hình bảng
        // (tên bảng, cột snake_case, tên ràng buộc) trong thư mục của mình mà không phải sửa file này.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}