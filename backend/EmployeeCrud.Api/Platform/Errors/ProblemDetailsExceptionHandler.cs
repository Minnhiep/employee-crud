using System.Diagnostics;

using EmployeeCrud.Api.Platform.Cors;

using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Net.Http.Headers;

namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>
/// Bộ bắt lỗi toàn cục: mọi exception chưa được xử lý trong controller/service đều đi qua đây
/// và được đổi thành ProblemDetails (application/problem+json) theo phong bì C3.
/// </summary>
public sealed class ProblemDetailsExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ICorsService corsService,
    ICorsPolicyProvider corsPolicyProvider,
    ILogger<ProblemDetailsExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var problem = ErrorMapper.Map(exception);
        var status = problem.Status ?? StatusCodes.Status500InternalServerError;
        var request = httpContext.Request;
        // Cùng giá trị với "traceId" mà AddProblemDetails ghi vào phản hồi, để từ phản hồi lỗi tìm được đúng dòng log.
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

        // Log đặt ở đây (không thêm middleware log riêng) để chuỗi xử lý gọn.
        // Không ghi body hay chuỗi kết nối (BR3.2).
        if (status >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Lỗi không xử lý: {Method} {Path} (traceId {TraceId})",
                request.Method, request.Path, traceId);
        }
        else
        {
            logger.LogInformation("{Status} {Method} {Path} (traceId {TraceId})",
                status, request.Method, request.Path, traceId);
        }

        // Trước khi gọi tới đây, bộ bắt lỗi đã xóa sạch header của phản hồi, kể cả header CORS.
        // Thiếu header CORS thì trình duyệt chặn đọc phản hồi và chỉ báo "lỗi mạng",
        // nên phải áp lại chính sách CORS (NFR7.2).
        await ApplyCorsAsync(httpContext);

        httpContext.Response.StatusCode = status;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
        });
    }

    private async Task ApplyCorsAsync(HttpContext httpContext)
    {
        if (!httpContext.Request.Headers.ContainsKey(HeaderNames.Origin))
        {
            return;
        }

        var policy = await corsPolicyProvider.GetPolicyAsync(httpContext, CorsSetup.PolicyName);
        if (policy is null)
        {
            return;
        }

        // Origin lạ thì kết quả đánh giá không cho phép, ApplyResult sẽ không thêm header nào.
        var result = corsService.EvaluatePolicy(httpContext, policy);
        corsService.ApplyResult(result, httpContext.Response);
    }
}