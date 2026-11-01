using Microsoft.EntityFrameworkCore;

namespace EmployeeCrud.Api.Platform.Data;

/// <summary>
/// Ngữ cảnh database dùng chung cho cả backend (hợp đồng C5).
/// U1 chỉ dựng khung; phòng ban (U3) và nhân viên (U4) thêm DbSet và cấu hình bảng của mình.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tự nạp mọi lớp IEntityTypeConfiguration trong project, để mỗi unit giữ cấu hình bảng
        // (tên bảng, cột snake_case, tên ràng buộc) trong thư mục của mình mà không phải sửa file này.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}