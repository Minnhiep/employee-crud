using EmployeeCrud.Api.Platform.Data;

using Microsoft.EntityFrameworkCore;

namespace EmployeeCrud.Api.Tests.TestSupport;

/// <summary>
/// AppDbContext giả cho trường hợp phòng ban bị xóa ở nơi khác giữa lúc service đã đọc và lúc lưu: ngay trước khi lưu,
/// nó xóa dòng qua một context khác (cùng database InMemory, như một request khác vừa ghi xong) rồi lưu bình thường.
/// </summary>
internal sealed class RemoveDepartmentBeforeSaveContext(DbContextOptions<AppDbContext> options, int departmentId)
    : AppDbContext(options)
{
    private readonly DbContextOptions<AppDbContext> _options = options;

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Dùng context riêng: chính context này đang theo dõi dòng đó, xóa ở đây sẽ không giống một request khác.
        await using var otherRequest = new AppDbContext(_options);
        var department = await otherRequest.Departments.FirstAsync(d => d.Id == departmentId, cancellationToken);
        otherRequest.Departments.Remove(department);
        await otherRequest.SaveChangesAsync(cancellationToken);

        // Lưu thật chứ không ném lỗi: tên không đổi thì không có gì để ghi, đúng đường service gặp lúc chạy thật.
        return await base.SaveChangesAsync(cancellationToken);
    }
}