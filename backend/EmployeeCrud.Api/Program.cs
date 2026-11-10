using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Employees;
using EmployeeCrud.Api.Platform;
using EmployeeCrud.Api.Platform.Cors;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;
using EmployeeCrud.Api.Platform.Security;

using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    // Không gửi header "Server: Kestrel": không cần cho người dùng, chỉ giúp người dò tìm biết máy chủ là gì.
    options.AddServerHeader = false;
    // Giới hạn body 64 KB. Request hợp lệ lớn nhất (thêm, sửa nhân viên) chỉ vài trăm byte; mặc định của Kestrel
    // khoảng 30 MB, tức máy chủ phải nhận hết một body rất lớn rồi mới báo "tối đa 100 ký tự".
    // Vượt giới hạn thì Kestrel báo 413, ErrorMapper đổi thành ProblemDetails "Dữ liệu gửi lên quá lớn".
    options.Limits.MaxRequestBodySize = 64 * 1024;
});

// ---- Đăng ký dịch vụ (Dependency Injection) ----

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Lỗi kiểm dữ liệu: trả 400 tiếng Việt, khóa camelCase.
        options.InvalidModelStateResponseFactory = ValidationResponseFactory.Create;
        // Để 404/405/415 do framework sinh ra đi qua StatusCodeProblemWriter, nhận title tiếng Việt.
        options.SuppressMapClientErrors = true;
    });

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ProblemDetailsExceptionHandler>();
builder.Services.AddFrontendCors(builder.Configuration);
builder.Services.AddOpenApi();

// Mỗi request một AppDbContext (vòng đời scoped). Chuỗi kết nối được đọc khi tạo ngữ cảnh, không mở kết nối lúc
// khởi động, nên lệnh "dotnet ef" và test đều dựng được ứng dụng khi PostgreSQL chưa chạy.
// Nhưng việc nào chạm database vẫn cần CÓ chuỗi kết nối: thiếu nó thì "dotnet ef migrations list" báo
// "The ConnectionString property has not been initialized" (và "dotnet ef database update" không chạy được).
// "dotnet ef" dừng ứng dụng ngay sau builder.Build(), nên không tới bước StartupChecks ở dưới để in câu hướng dẫn.
builder.Services.AddDbContext<AppDbContext>((services, options) =>
    options.UseNpgsql(services.GetRequiredService<IConfiguration>()
        .GetConnectionString(StartupChecks.ConnectionStringName)));

// Service nghiệp vụ: Scoped, cùng vòng đời với AppDbContext của request.
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

var app = builder.Build();

StartupChecks.EnsureConnectionString(app);

// ---- Chuỗi xử lý request: thứ tự quan trọng ----

// 0. Header bảo mật, gắn vào mọi phản hồi kể cả lỗi (xem SecurityHeaders).
app.UseSecurityHeaders();
// 1. CORS đứng ngay sau header bảo mật, ngoài bộ bắt lỗi, để mọi phản hồi (kể cả lỗi) đều đi qua nó.
app.UseCors(CorsSetup.PolicyName);
// 2. Bắt mọi lỗi phía sau và đổi thành ProblemDetails.
app.UseExceptionHandler();
// 3. Điền nội dung cho 404/405/415 không có nội dung.
app.UseStatusCodePages(StatusCodeProblemWriter.WriteAsync);

if (app.Environment.IsDevelopment())
{
    // Tài liệu API chỉ có ở môi trường Development.
    // Swagger UI không tự sinh đặc tả: nó đọc file JSON do MapOpenApi() phát ở /openapi/v1.json.
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "EmployeeCrud API v1"));
}

// 4. Định tuyến, 5. Controller.
app.UseRouting();
app.MapControllers();

app.Run();

// Cho project test dùng WebApplicationFactory<Program> để dựng ứng dụng trong bộ nhớ.
public partial class Program { }