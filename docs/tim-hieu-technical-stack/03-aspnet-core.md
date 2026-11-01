# 03. C# và ASP.NET Core: tầng xử lý ở máy chủ

> Phần trong kế hoạch: *C# cơ bản, LINQ, async/await; Web API; Controller, Service, DTO; Dependency Injection; Entity Framework Core kết nối PostgreSQL, migration và CRUD.*
> Vị trí trong luồng: **bước 4–8** ở [00-tong-quan-luong.md](00-tong-quan-luong.md).

## 1. Nói đơn giản

ASP.NET Core là **bếp của nhà hàng**:
- **Controller** là người nhận phiếu ở cửa bếp: đọc phiếu, kiểm tra phiếu ghi đủ chưa, chuyển vào trong, rồi trả món ra.
- **Service** là đầu bếp: làm theo công thức (quy tắc nghiệp vụ), ví dụ "không nhận nhân viên trùng email".
- **EF Core** là người đi kho: đầu bếp nói "lấy nhân viên tên có chữ An", người đi kho tự viết thành câu SQL gửi cho PostgreSQL.
- **DTO** là cái đĩa: chỉ bày ra những gì khách cần thấy, không bưng cả nồi.

Dùng **.NET 10** (bản hỗ trợ dài hạn, LTS). .NET 8 và 9 hết hỗ trợ ngày 10/11/2026. Nguồn: [Chính sách hỗ trợ .NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core), đã tra ngày 30/10/2026.

## 2. C# cơ bản cần nắm

```csharp
// Class và property
public class Employee
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string? Phone { get; set; }          // dấu ? = được phép null
}

// record: kiểu gọn cho dữ liệu chỉ để truyền đi (hay dùng làm DTO)
public record DepartmentDto(int Id, string Name);

// Danh sách
List<Employee> list = [new Employee { Id = 1, FullName = "An" }];

// var: để trình biên dịch tự suy kiểu (vẫn là kiểu tĩnh, không phải "kiểu gì cũng được")
var count = list.Count;

// Interface: "hợp đồng" nói class phải có những hàm nào
public interface IEmployeeService { Task<EmployeeDto?> GetAsync(int id); }
```

**Nullable reference types:** dự án mới bật sẵn chế độ này. `string` nghĩa là không được null, `string?` nghĩa là có thể null. Trình biên dịch cảnh báo khi dùng biến có thể null mà chưa kiểm, giúp tránh lỗi `NullReferenceException`.

### LINQ: hỏi dữ liệu bằng C#

LINQ giống **bộ lọc trong Excel** nhưng viết bằng code:

```csharp
var result = employees
    .Where(e => e.DepartmentId == 2)          // lọc
    .OrderBy(e => e.FullName)                 // sắp xếp
    .Select(e => new { e.Id, e.FullName })    // chọn cột
    .ToList();                                // chạy và lấy kết quả
```

Điểm quan trọng: khi dùng LINQ trên `DbSet` của EF Core, đoạn `Where/OrderBy/Select` **không chạy trong C#**. EF Core **dịch thành SQL** và PostgreSQL chạy câu đó. Câu lệnh chỉ thực sự chạy khi gọi `ToList()` / `ToListAsync()` / `FirstOrDefaultAsync()`...

### async/await: chờ mà không giữ chân

Khi chờ database trả lời, luồng xử lý không nên **đứng im giữ chỗ**. Giống người phục vụ đưa phiếu vào bếp rồi đi phục vụ bàn khác, có món thì quay lại.

```csharp
public async Task<EmployeeDto?> GetAsync(int id)
{
    var e = await db.Employees.FindAsync(id);     // chờ DB, luồng được giải phóng
    return e is null ? null : ToDto(e);
}
```

Quy tắc: hàm có `await` thì khai báo `async` và trả `Task` hoặc `Task<T>`; đặt tên đuôi `Async`; **không dùng `.Result` hay `.Wait()`**, vì dễ gây treo và tốn tài nguyên.

## 3. Tạo dự án Web API

```bash
dotnet new webapi --use-controllers -n EmployeeApi
cd EmployeeApi
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL       # nối EF Core với PostgreSQL (bản 10.x cho .NET 10)
dotnet add package Microsoft.EntityFrameworkCore.Design         # cần cho lệnh migration
dotnet run
```

- `--use-controllers`: tạo dự án kiểu **Controller**, đúng như kế hoạch yêu cầu. Nếu thiếu cờ này, mẫu mặc định là **Minimal API** (khai báo route ngay trong `Program.cs`).
- Tutorial chính thức trong kế hoạch: [Create a controller-based web API](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0).

Cấu trúc thư mục gợi ý:

```
EmployeeApi/
├── Program.cs              (khởi động: đăng ký dịch vụ, middleware)
├── appsettings.json        (cấu hình; KHÔNG để mật khẩu DB thật ở đây)
├── Controllers/EmployeesController.cs, DepartmentsController.cs
├── Services/IEmployeeService.cs, EmployeeService.cs
├── Dtos/EmployeeDto.cs, SaveEmployeeRequest.cs
├── Data/AppDbContext.cs
├── Models/Employee.cs, Department.cs   (entity = hình dạng bảng)
└── Migrations/             (EF Core tự sinh)
```

## 4. Controller, Service, DTO: vì sao tách 3 lớp

| Lớp | Làm gì | Không làm gì |
|---|---|---|
| **Controller** | Nhận HTTP, đọc tham số, gọi service, chọn status code (200/201/404...) | Viết quy tắc nghiệp vụ, viết truy vấn |
| **Service** | Quy tắc nghiệp vụ (email không trùng, phòng ban phải tồn tại), gọi EF Core | Biết về HTTP/status code |
| **DTO** (Data Transfer Object) | Hình dạng dữ liệu vào/ra API | Chứa logic |

**Vì sao không trả thẳng entity ra API?**
1. **Lộ trường không nên lộ**: sau này entity có thể có lương hay ghi chú nội bộ.
2. **Vòng lặp JSON**: `Employee.Department.Employees[0].Department...` làm lỗi khi chuyển sang JSON.
3. **Over-posting**: người gọi gửi thêm trường như `Id` và vô tình ghi đè. DTO đầu vào chỉ nhận đúng trường cho phép.

```csharp
// Dtos
public record EmployeeDto(int Id, string FullName, string Email, int DepartmentId, string DepartmentName);

public class SaveEmployeeRequest
{
    [Required, StringLength(100)]
    public string FullName { get; set; } = "";

    [Required, EmailAddress, StringLength(255)]
    public string Email { get; set; } = "";

    [Range(1, int.MaxValue)]
    public int DepartmentId { get; set; }
}
```

Các dấu `[Required]`, `[EmailAddress]`... gọi là **Data Annotations**. Controller có `[ApiController]` sẽ **tự kiểm tra** chúng, sai thì tự trả `400` dạng Problem Details (xem [02-api-json.md](02-api-json.md) mục 6) mà không cần viết `if`.

## 5. Dependency Injection (DI)

Nói đơn giản: đầu bếp **không tự đi mua dao**, quản lý bếp phát dao cho. Trong code, `EmployeesController` cần `IEmployeeService`. Controller không tự `new EmployeeService(...)` mà **khai báo trong constructor**, ASP.NET Core tự tạo và đưa vào.

```csharp
// Program.cs: "đăng ký" ai sẽ được phát
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

// Controller: "xin" qua constructor (cú pháp primary constructor của C# 12+)
public class EmployeesController(IEmployeeService service) : ControllerBase { ... }
```

**Vì sao tốt hơn `new`?** Đổi cách làm chỉ cần sửa một dòng đăng ký. Khi kiểm thử có thể đưa vào một service giả. Ngoài ra không phải tự quản lý việc đóng kết nối database.

| Vòng đời | Ý nghĩa | Dùng cho |
|---|---|---|
| `AddTransient` | Mỗi lần xin tạo cái mới | Dịch vụ nhẹ, không giữ trạng thái |
| `AddScoped` | Một cái cho **mỗi request** | **DbContext**, service dùng DbContext |
| `AddSingleton` | Một cái cho cả ứng dụng | Cấu hình, cache. **Không** chứa DbContext |

Nguồn: [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) (link quen thuộc, hôm nay em chưa mở lại).

## 6. Entity Framework Core: nối với PostgreSQL

**EF Core** là một **ORM** (Object-Relational Mapper): nó ánh xạ class C# với bảng database, nên đọc/ghi bằng object thay vì tự viết SQL.

```csharp
// Models
public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Employee> Employees { get; set; } = [];
}

public class Employee
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public int DepartmentId { get; set; }                 // khóa ngoại
    public Department Department { get; set; } = null!;   // navigation property
}

// Data/AppDbContext.cs
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>(e =>
        {
            e.ToTable("departments");
            e.Property(d => d.Id).HasColumnName("id");
            e.Property(d => d.Name).HasColumnName("name").HasMaxLength(100);
            e.HasIndex(d => d.Name).IsUnique();
        });

        modelBuilder.Entity<Employee>(e =>
        {
            e.ToTable("employees");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.FullName).HasColumnName("full_name").HasMaxLength(100);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(255);
            e.Property(x => x.DepartmentId).HasColumnName("department_id");
            e.HasIndex(x => x.Email).IsUnique();
            e.HasOne(x => x.Department)
             .WithMany(d => d.Employees)
             .HasForeignKey(x => x.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);           // không cho xóa phòng ban còn nhân viên
        });
    }
}
```

**Vì sao phải đặt tên bảng/cột thủ công?** Mặc định EF Core đặt tên theo C# (`Employees`, `FullName`). Trong PostgreSQL, tên có chữ hoa phải luôn viết trong ngoặc kép (`SELECT "FullName" FROM "Employees"`), rất dễ quên khi viết SQL tay. Dùng tên chữ thường kiểu `snake_case` thì SQL tay gọn hơn, xem [04-postgresql.md](04-postgresql.md). Cách tự động hơn là gói `EFCore.NamingConventions` với `UseSnakeCaseNamingConvention()` (em chưa kiểm bản tương thích .NET 10).

Đăng ký trong `Program.cs`:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
```

**Connection string** (chuỗi kết nối) có mật khẩu. Không đưa lên Git; khi chạy ở máy cá nhân dùng **User Secrets**:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=employee_db;Username=postgres;Password=..."
```

Nguồn: [Npgsql EF Core provider](https://www.npgsql.org/efcore/), đã tra ngày 30/10/2026. Trang này lưu ý: với ASP.NET nên đăng ký DbContext qua DI thay vì cấu hình trong `OnConfiguring`.

## 7. Migration: "phiên bản" của cấu trúc database

**Migration** giống **sổ ghi các lần sửa nhà**: mỗi lần thêm bảng hay thêm cột thì sinh một file ghi "đã đổi gì". Nhờ vậy người khác clone code về chạy một lệnh là có database giống hệt.

```bash
# Cài công cụ dotnet-ef chỉ trong dự án (không cài toàn máy)
dotnet new tool-manifest
dotnet tool install dotnet-ef

dotnet ef migrations add InitialCreate      # sinh file trong Migrations/ từ các class entity
dotnet ef database update                   # chạy migration vào PostgreSQL thật
```

Quy tắc:
- Đã đẩy lên Git thì **không sửa file migration cũ**, muốn đổi thì tạo migration mới.
- Đọc file migration sinh ra trước khi `update`, để hiểu nó sẽ làm gì với database.
- Kế hoạch yêu cầu nộp "phần khởi tạo database hoặc migration", và thư mục `Migrations/` chính là phần đó.
- **Mỗi database chỉ dùng một cách tạo bảng.** Đã dùng migration cho `employee_db` thì đừng chạy thêm các câu `CREATE TABLE` tay ở [04-postgresql.md](04-postgresql.md) vào cùng database, vì sẽ báo lỗi bảng đã tồn tại. Ngược lại cũng vậy.

Nguồn: [EF Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/) (link quen thuộc, hôm nay em chưa mở lại).

## 8. CRUD: Service và Controller

```csharp
public class BusinessRuleException(string message) : Exception(message);

public class EmployeeService(AppDbContext db) : IEmployeeService
{
    public async Task<List<EmployeeDto>> SearchAsync(string? search)
    {
        var query = db.Employees.AsNoTracking();               // chỉ đọc, nhanh hơn
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(e => EF.Functions.ILike(e.FullName, pattern)
                                  || EF.Functions.ILike(e.Email, pattern));   // ILIKE: không phân biệt hoa thường
        }
        return await query
            .OrderBy(e => e.FullName)
            .Select(e => new EmployeeDto(e.Id, e.FullName, e.Email, e.DepartmentId, e.Department.Name))
            .ToListAsync();
    }

    public async Task<EmployeeDto?> GetAsync(int id) =>
        await db.Employees.AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new EmployeeDto(e.Id, e.FullName, e.Email, e.DepartmentId, e.Department.Name))
            .FirstOrDefaultAsync();

    public async Task<EmployeeDto> CreateAsync(SaveEmployeeRequest req)
    {
        await CheckRulesAsync(req, currentId: null);
        var employee = new Employee { FullName = req.FullName.Trim(), Email = NormalizeEmail(req.Email), DepartmentId = req.DepartmentId };
        db.Employees.Add(employee);
        await db.SaveChangesAsync();                            // INSERT chạy ở đây
        return (await GetAsync(employee.Id))!;
    }

    public async Task<bool> UpdateAsync(int id, SaveEmployeeRequest req)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return false;
        await CheckRulesAsync(req, currentId: id);
        employee.FullName = req.FullName.Trim();
        employee.Email = NormalizeEmail(req.Email);
        employee.DepartmentId = req.DepartmentId;
        await db.SaveChangesAsync();                            // EF tự biết trường nào đổi → UPDATE
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null) return false;
        db.Employees.Remove(employee);
        await db.SaveChangesAsync();                            // DELETE
        return true;
    }

    private async Task CheckRulesAsync(SaveEmployeeRequest req, int? currentId)
    {
        if (!await db.Departments.AnyAsync(d => d.Id == req.DepartmentId))
            throw new BusinessRuleException("Phòng ban không tồn tại");
        var email = NormalizeEmail(req.Email);
        if (await db.Employees.AnyAsync(e => e.Email == email && e.Id != currentId))
            throw new BusinessRuleException("Email đã được sử dụng");
    }

    // PostgreSQL so sánh chuỗi phân biệt hoa thường; lưu email chữ thường để "An@x.com" và "an@x.com" bị coi là trùng
    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
```

```csharp
[ApiController]
[Route("api/[controller]")]              // → /api/employees
public class EmployeesController(IEmployeeService service) : ControllerBase
{
    [HttpGet]
    public async Task<List<EmployeeDto>> Search([FromQuery] string? search) => await service.SearchAsync(search);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int id)
    {
        var dto = await service.GetAsync(id);
        if (dto is null) return NotFound();          // 404
        return dto;                                  // 200 + JSON
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(SaveEmployeeRequest req)
    {
        try
        {
            var created = await service.CreateAsync(req);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);   // 201 + Location
        }
        catch (BusinessRuleException ex)
        {
            return Conflict(new ProblemDetails { Title = ex.Message, Status = 409 });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveEmployeeRequest req)
    {
        try
        {
            return await service.UpdateAsync(id, req) ? NoContent() : NotFound();
        }
        catch (BusinessRuleException ex)
        {
            return Conflict(new ProblemDetails { Title = ex.Message, Status = 409 });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await service.DeleteAsync(id) ? NoContent() : NotFound();
}
```

### API phòng ban và dữ liệu phòng ban ban đầu

Form React cần danh sách phòng ban cho dropdown (`GET /api/departments`). Bài này chỉ **đọc** phòng ban, không thêm/sửa/xóa.

```csharp
[ApiController]
[Route("api/[controller]")]              // → /api/departments
public class DepartmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<DepartmentDto>> GetAll() =>
        await db.Departments.AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto(d.Id, d.Name))
            .ToListAsync();
}
```

Controller này gọi thẳng `DbContext` mà không qua Service, vì chỉ có một truy vấn đọc, không có quy tắc nghiệp vụ. Đây là một **lựa chọn có chủ ý**: khi demo nên nói được vì sao. Nếu muốn thống nhất hoàn toàn với `EmployeesController` thì tạo thêm `DepartmentService`.

**Đưa sẵn phòng ban vào database (seed data).** Bảng `departments` cần có dữ liệu thì mới chọn được trong form. Có hai cách, **chỉ chọn một**:

| Cách | Làm thế nào | Ưu | Nhược |
|---|---|---|---|
| **Seed bằng migration** (khuyên dùng) | Thêm `HasData` vào `OnModelCreating`, rồi `dotnet ef migrations add SeedDepartments` và `dotnet ef database update` | Người khác clone code, chạy `database update` là có đủ dữ liệu, README gọn | Phải ghi `Id` cố định |
| Chèn tay bằng SQL | Chạy câu `INSERT INTO departments ...` ở [04-postgresql.md](04-postgresql.md) mục 5 trong pgAdmin | Đơn giản | Mỗi máy phải tự chạy, dễ quên; phải ghi vào README |

```csharp
// Trong OnModelCreating, sau phần cấu hình Department
modelBuilder.Entity<Department>().HasData(
    new Department { Id = 1, Name = "Kế toán" },
    new Department { Id = 2, Name = "Nhân sự" },
    new Department { Id = 3, Name = "Kỹ thuật" });
```

Lưu ý khi seed với `Id` cố định: PostgreSQL **không tự đẩy bộ đếm id** khi dòng được chèn với id ghi sẵn. Sau này nếu thêm phòng ban mà không ghi id, bộ đếm bắt đầu từ 1 và có thể báo trùng khóa chính. Bài này không có chức năng thêm phòng ban nên chưa gặp; em chưa chạy thử điểm này với Npgsql 10.

Ghi chú:
- Kiểm `AnyAsync` email trước khi lưu **chưa đủ** khi hai người cùng lưu một lúc: cả hai đều thấy "chưa có", rồi cả hai cùng ghi. **Chỉ mục duy nhất** (unique index) ở database mới là chốt chặn cuối. Khi chốt này chặn, EF Core ném `DbUpdateException`. Bài 2 tuần có thể chưa xử lý trường hợp này, nhưng nên hiểu vì sao cần cả hai lớp.
- Khi các controller lặp lại nhiều `try/catch`, có thể chuyển sang xử lý lỗi tập trung bằng `IExceptionHandler`. Phần này để học thêm, không bắt buộc trong 2 tuần.

## 9. Program.cs đầy đủ (gồm CORS và OpenAPI)

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();                                     // sinh /openapi/v1.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")                 // địa chỉ React; 5173 là cổng mặc định của Vite, công cụ khác thì đổi theo
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

- **Middleware** là chuỗi trạm mà mỗi request đi qua theo thứ tự (chuyển HTTPS → CORS → phân quyền → controller). **Thứ tự có ý nghĩa**: `UseCors` phải đứng trước khi request tới controller.
- Nếu React gọi địa chỉ `http://` mà backend tự chuyển sang `https://`, trình duyệt có thể báo lỗi CORS. Cách đơn giản là để React gọi đúng địa chỉ `https://` của backend, xem cổng trong `Properties/launchSettings.json`.
- Muốn có trang bấm thử API: tutorial chính thức dùng gói `NSwag.AspNetCore` (`app.UseSwaggerUi(...)`). Nguồn: [Use the generated OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/using-openapi-documents?view=aspnetcore-10.0), đã tra ngày 30/10/2026. Hoặc import `/openapi/v1.json` vào Postman.

## 10. Lỗi hay gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Unable to resolve service for type 'IEmployeeService'` | Quên đăng ký DI | Thêm `AddScoped<...>` trong Program.cs |
| `dotnet ef` báo không tìm thấy lệnh | Chưa cài công cụ dotnet-ef | `dotnet tool install dotnet-ef` (có tool manifest) |
| Lỗi kết nối DB / sai mật khẩu | Connection string sai, PostgreSQL chưa chạy | Kiểm PostgreSQL đang chạy, kiểm user-secrets |
| `relation "Employees" does not exist` khi viết SQL tay | Tên bảng có chữ hoa | Đặt tên snake_case (mục 6) hoặc dùng ngoặc kép |
| JSON trả về lỗi vòng lặp | Trả entity có navigation 2 chiều | Trả DTO |
| Lỗi khi lưu `DateTime` vào cột `timestamp with time zone` | Npgsql yêu cầu `DateTime` dạng UTC | Dùng `DateTime.UtcNow`; ngày không có giờ thì dùng `DateOnly` |
| Mọi lỗi đều thành 500 | Không phân loại lỗi | Dữ liệu sai → 400, không thấy → 404, trùng → 409 |

## 11. Câu hỏi tự kiểm

1. Controller, Service, DTO mỗi lớp làm gì? Vì sao không gộp vào controller?
2. Vì sao không trả thẳng entity `Employee` ra API? Nêu 3 lý do.
3. DI là gì? Vì sao DbContext đăng ký `Scoped` mà không phải `Singleton`?
4. Đoạn LINQ `db.Employees.Where(...)` chạy ở đâu: trong C# hay trong PostgreSQL? Khi nào câu SQL thật sự được gửi đi?
5. `async/await` giúp gì cho server? Vì sao không dùng `.Result`?
6. Migration là gì? Người mới clone code về cần chạy lệnh gì để có database?
7. Đã kiểm email trùng bằng `AnyAsync` rồi, vì sao vẫn cần unique index ở database?
8. Vì sao `UseCors` phải đặt trước `MapControllers`?
9. Vì sao lưu email dạng chữ thường? Nếu không làm vậy thì unique index có chặn được `An@x.com` và `an@x.com` không?
10. `DepartmentsController` không dùng Service: vì sao chấp nhận được, và khi nào nên thêm Service?
11. Seed phòng ban bằng migration và bằng SQL tay khác nhau thế nào? Vì sao chỉ chọn một?

## Nguồn

- [Tutorial: Create a controller-based web API (ASP.NET Core 10)](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0), tutorial trong kế hoạch.
- [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core), [Generate OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi?view=aspnetcore-10.0), [Npgsql EF Core](https://www.npgsql.org/efcore/), [NuGet Npgsql.EntityFrameworkCore.PostgreSQL](https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL/): đã tra ngày 30/10/2026.
- [EF Core docs](https://learn.microsoft.com/en-us/ef/core/), [C# docs](https://learn.microsoft.com/en-us/dotnet/csharp/): link quen thuộc, hôm nay em chưa mở lại.
