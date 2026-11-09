using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Employees;
using EmployeeCrud.Api.Platform;
using EmployeeCrud.Api.Platform.Cors;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;
using EmployeeCrud.Api.Platform.Security;

using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Không gửi header "Server: Kestrel": không cần cho người dùng, chỉ giúp người dò tìm biết máy chủ là gì.
builder.WebHost.ConfigureKestrel(options => options.AddServerHeader = false);

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

// Mỗi request một AppDbContext (vòng đời scoped). Chuỗi kết nối được đọc khi tạo ngữ cảnh,
// nên lệnh "dotnet ef" và test đều dựng được ứng dụng mà không cần mở kết nối lúc khởi động.
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