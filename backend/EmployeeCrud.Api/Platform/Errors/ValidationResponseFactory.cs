using System.Diagnostics;
using System.Text.Encodings.Web;
using System.Text.Json;

using Microsoft.AspNetCore.Mvc;

namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>
/// Thay phản hồi 400 mặc định của ASP.NET Core (title tiếng Anh, khóa PascalCase như "Name")
/// bằng phản hồi theo phong bì C3: title tiếng Việt, khóa camelCase khớp tên trường JSON (BR1.2, BR1.7).
/// </summary>
public static class ValidationResponseFactory
{
    // Ghi chữ tiếng Việt nguyên dạng, như bộ ghi JSON của MVC và lỗi 404/409 vẫn làm. Thiếu dòng này,
    // JsonResult mã thoát mọi ký tự ngoài ASCII ("Dữ" thành "Dữ"). Chỉ đọc, không giữ dữ liệu.
    private static readonly JsonSerializerOptions ProblemJsonOptions = new(JsonSerializerDefaults.Web)
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public static IActionResult Create(ActionContext context)
    {
        var errors = new Dictionary<string, List<string>>();

        // Tên tham số của action (ví dụ "request"). Khi body hỏng hoặc thiếu,
        // framework báo lỗi dưới tên này: đó là lỗi của cả body, không phải của một trường.
        var parameterNames = context.ActionDescriptor.Parameters
            .Select(parameter => parameter.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var (key, entry) in context.ModelState)
        {
            if (entry.Errors.Count == 0)
            {
                continue;
            }

            var isJsonError = key == "$" || key.StartsWith("$.", StringComparison.Ordinal);
            var field = ToFieldKey(key, parameterNames);

            foreach (var error in entry.Errors)
            {
                var message = field == ErrorTitles.BodyKey
                    ? ErrorTitles.InvalidJsonMessage
                    // Lỗi đọc JSON của framework là câu tiếng Anh kỹ thuật, nên thay bằng câu tiếng Việt.
                    : isJsonError
                        ? "Giá trị không đúng kiểu dữ liệu"
                        : error.ErrorMessage;

                if (!errors.TryGetValue(field, out var messages))
                {
                    messages = [];
                    errors[field] = messages;
                }

                if (!messages.Contains(message))
                {
                    messages.Add(message);
                }
            }
        }

        var problem = new ValidationProblemDetails(errors.ToDictionary(pair => pair.Key, pair => pair.Value.ToArray()))
        {
            // Cùng type và traceId như lỗi 404/409 do AddProblemDetails ghi (phong bì C3).
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            Status = StatusCodes.Status400BadRequest,
            Title = ErrorTitles.Invalid,
        };
        problem.Extensions["traceId"] = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;

        // Dùng JsonResult, không dùng BadRequestObjectResult: [Produces("application/json")] trên controller
        // là bộ lọc kết quả, nó ghi đè loại nội dung của mọi ObjectResult, làm 400 thành application/json.
        // JsonResult không phải ObjectResult nên giữ đúng application/problem+json.
        return new JsonResult(problem, ProblemJsonOptions)
        {
            StatusCode = StatusCodes.Status400BadRequest,
            ContentType = "application/problem+json",
        };
    }

    // "$.departmentId" -> "departmentId", "FullName" -> "fullName", "$" hoặc tên tham số -> "body".
    private static string ToFieldKey(string key, HashSet<string> parameterNames)
    {
        var path = key.TrimStart('$').TrimStart('.');
        if (path.Length == 0 || parameterNames.Contains(path))
        {
            return ErrorTitles.BodyKey;
        }

        return string.Join('.', path.Split('.').Select(JsonNamingPolicy.CamelCase.ConvertName));
    }
}