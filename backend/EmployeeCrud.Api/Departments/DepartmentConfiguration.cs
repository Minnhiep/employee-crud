using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Cấu hình bảng <c>departments</c>: tên bảng và cột viết thường snake_case khai tay (không dùng gói đổi tên tự động).
/// AppDbContext tự nạp lớp này nhờ ApplyConfigurationsFromAssembly.
/// </summary>
public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public const int NameMaxLength = 100;

    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("departments");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Id).HasColumnName("id");

        builder.Property(d => d.Name)
            .HasColumnName("name")
            .HasMaxLength(NameMaxLength)
            .IsRequired();

        // Cố ý không khai chỉ mục ở đây: chỉ mục không trùng nằm trên biểu thức lower(name),
        // EF Core không sinh được nên được viết tay trong migration CreateDepartments.
        // Cũng không dùng HasData: dữ liệu mẫu chèn bằng InsertData không kèm id (xem migration).
    }
}