using EmployeeCrud.Api.Platform.Errors;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EmployeeCrud.Api.Employees;

/// <summary>
/// Cấu hình bảng <c>employees</c>: tên bảng và cột viết thường snake_case khai tay (team.md, không dùng gói đổi tên tự động).
/// AppDbContext tự nạp lớp này nhờ ApplyConfigurationsFromAssembly.
/// </summary>
public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public const int FullNameMaxLength = 100;
    public const int EmailMaxLength = 254;

    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");

        builder.Property(e => e.FullName)
            .HasColumnName("full_name")
            .HasMaxLength(FullNameMaxLength)
            .IsRequired();

        builder.Property(e => e.Email)
            .HasColumnName("email")
            .HasMaxLength(EmailMaxLength)
            .IsRequired();

        builder.Property(e => e.DepartmentId).HasColumnName("department_id");

        // Khóa ngoại khai ở đây để EF tự sinh câu tạo ràng buộc. Tên lấy từ hằng của U1,
        // vì ErrorMapper và DepartmentService nhận ra lỗi 23503 theo đúng tên này; gõ tay dễ lệch.
        // Restrict: database không cho xóa phòng ban còn nhân viên (BR3.3).
        builder.HasOne(e => e.Department)
            .WithMany()
            .HasForeignKey(e => e.DepartmentId)
            .HasConstraintName(DbConstraintNames.EmployeeDepartmentForeignKey)
            .OnDelete(DeleteBehavior.Restrict);

        // Chỉ mục thường cho department_id: câu kiểm "phòng ban còn nhân viên" và việc PostgreSQL
        // kiểm khóa ngoại khi xóa phòng ban dùng được chỉ mục này, không phải quét cả bảng (NFR5.8).
        builder.HasIndex(e => e.DepartmentId).HasDatabaseName("ix_employees_department_id");

        // Cố ý không khai chỉ mục email ở đây: chỉ mục không trùng nằm trên biểu thức lower(email),
        // EF Core không sinh được nên được viết tay trong migration CreateEmployees.
    }
}