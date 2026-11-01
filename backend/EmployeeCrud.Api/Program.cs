using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Platform;
using EmployeeCrud.Api.Platform.Cors;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;

using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---- Đăng ký dịch vụ (Dependency Injection) ----

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Lỗi kiểm dữ liệu: trả 400 tiếng Việt, khóa camelCase (BR1.2).
        options.InvalidModelStateResponseFactory = ValidationResponseFactory.Create;
        // Để 404/405/415 do framework sinh ra đi qua StatusCodeProblemWriter, nhận title tiếng Việt (BR1.7).
        options.SuppressMapClientErrors = true;
    });

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ProblemDetailsExceptionHandler>();
builder.Services.AddFrontendCors(builder.Configuration);
builder.Services.AddOpenApi();

// Mỗi request một AppDbContext (vòng đời scoped, BR3.1). Chuỗi kết nối được đọc khi tạo ngữ cảnh,
// nên lệnh "dotnet ef" và test đều dựng được ứng dụng mà không cần mở kết nối lúc khởi động.
builder.Services.AddDbContext<AppDbContext>((services, options) =>
    options.UseNpgsql(services.GetRequiredService<IConfiguration>()
        .GetConnectionString(StartupChecks.ConnectionStringName)));

// Service nghiệp vụ: Scoped, cùng vòng đời với AppDbContext của request (NFR5.6).
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

var app = builder.Build();

StartupChecks.EnsureConnectionString(app);

// ---- Chuỗi xử lý request: thứ tự quan trọng ----

// 1. CORS đứng ngoài cùng, để mọi phản hồi (kể cả lỗi) đều đi qua nó.
app.UseCors(CorsSetup.PolicyName);
// 2. Bắt mọi lỗi phía sau và đổi thành ProblemDetails.
app.UseExceptionHandler();
// 3. Điền nội dung cho 404/405/415 không có nội dung.
app.UseStatusCodePages(StatusCodeProblemWriter.WriteAsync);

if (app.Environment.IsDevelopment())
{
    // Tài liệu API chỉ có ở môi trường Development (BR2.4).
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "EmployeeCrud API v1"));
}

// 4. Định tuyến, 5. Controller.
app.UseRouting();
app.MapControllers();

app.Run();

// Cho project test dùng WebApplicationFactory<Program> để dựng ứng dụng trong bộ nhớ.
public partial class Program { }