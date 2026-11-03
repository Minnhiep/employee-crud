/**
 * Mọi lời gọi API của giao diện đều đi qua file này (hợp đồng C3).
 *
 * Cách chạy đúng:
 * - Backend chạy bằng `dotnet run --project backend/EmployeeCrud.Api` (hồ sơ "http", cổng 5081).
 * - Giao diện phải mở đúng http://localhost:5173 (không dùng 127.0.0.1), vì backend chỉ cho phép
 *   (CORS) đúng origin đó và trình duyệt so sánh nguyên văn.
 *
 * Lỗi ném ra luôn là ApiError, trang chỉ cần đọc `kind`, `status`, `message`, `errors`.
 */

// Bản build không đọc .env.development, nên giá trị mặc định này phải khớp với file đó.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5081";

const TIMEOUT_MS = 10_000;
// Chỉ dùng khi thật sự không nói chuyện được với máy chủ: mất mạng, sai cổng, CORS chặn, quá 10 giây.
const NETWORK_MESSAGE = "Không kết nối được máy chủ, vui lòng thử lại";
// Câu chung khi máy chủ vẫn trả lời nhưng lỗi (5xx không có lời báo, dữ liệu hỏng) hoặc lỗi ngoài dự kiến.
// Xuất ra để các trang dùng chung một câu, sửa một chỗ là đổi khắp nơi.
export const GENERIC_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại sau.";

/**
 * - "network": không gọi được máy chủ hoặc quá 10 giây.
 * - "server": máy chủ lỗi (5xx) hoặc trả về dữ liệu không đọc được.
 * - "client": dữ liệu gửi lên sai (400), không tìm thấy (404), trùng (409)... giữ nguyên lời báo của API.
 * - "aborted": chính trang hủy lời gọi (rời trang, tìm kiếm mới thay tìm kiếm cũ). Trang bỏ qua lỗi này.
 */
export type ApiErrorKind = "network" | "server" | "client" | "aborted";

/** Lỗi theo từng trường: { tênTrường: [lời báo tiếng Việt] } (khóa camelCase, hợp đồng C3). */
export type FieldErrors = Record<string, string[]>;

/** Phần thân lỗi ProblemDetails mà backend trả về (RFC 9457). */
type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: FieldErrors;
};

type ApiErrorInit = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  title?: string;
  detail?: string;
  errors?: FieldErrors;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly errors: FieldErrors;

  constructor({
    kind,
    message,
    status = 0,
    title = "",
    detail = "",
    errors = {},
  }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.errors = errors;
  }
}

/** Tùy chọn cho mỗi lời gọi: `signal` để trang hủy lời gọi khi không cần nữa. */
export type RequestOptions = {
  signal?: AbortSignal;
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>("GET", path, undefined, options);
}

export function apiPost<T>(
  path: string,
  body: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("POST", path, body, options);
}

export function apiPut<T>(
  path: string,
  body: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("PUT", path, body, options);
}

export function apiDelete(
  path: string,
  options?: RequestOptions,
): Promise<void> {
  return request<void>("DELETE", path, undefined, options);
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body: unknown,
  { signal }: RequestOptions = {},
): Promise<T> {
  // Đổi body sang JSON trước khối try của fetch: JSON.stringify hỏng (ví dụ dữ liệu có vòng tham chiếu)
  // cũng ném TypeError, nếu nằm trong khối đó sẽ bị báo nhầm thành lỗi mạng.
  let payload: string | undefined;
  try {
    payload = body === undefined ? undefined : JSON.stringify(body);
  } catch (error) {
    throw unexpectedError(error);
  }

  // Hai lý do để dừng một lời gọi: quá 10 giây (lỗi mạng), hoặc trang tự hủy (không phải lỗi).
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(BASE_URL + path, {
      method,
      // Chỉ gửi Content-Type khi có body: GET không cần, và tránh lời hỏi trước (preflight) thừa.
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: payload,
      signal: combinedSignal,
    });

    // Đọc body vẫn nằm trong hạn 10 giây: hẹn giờ chỉ bị hủy ở khối finally.
    if (response.ok) {
      return await readSuccess<T>(response);
    }
    throw await toHttpError(response);
  } catch (error) {
    throw toApiError(error, signal);
  } finally {
    clearTimeout(timer);
  }
}

async function readSuccess<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    // 204 không có nội dung (ví dụ xóa thành công); hàm gọi khai báo kiểu void.
    return undefined as T;
  }
  try {
    return (await response.json()) as T;
  } catch (error) {
    // Chỉ lỗi "body không phải JSON hợp lệ" mới là lỗi máy chủ. Lỗi hủy (trang rời đi, quá 10 giây)
    // được ném lại nguyên vẹn để toApiError phân loại đúng thành "aborted" hoặc "network".
    // Máy chủ vẫn trả lời được nên báo câu chung, không báo "không kết nối được" (sai nguyên nhân).
    if (error instanceof SyntaxError) {
      throw new ApiError({
        kind: "server",
        status: response.status,
        message: GENERIC_MESSAGE,
      });
    }
    throw error;
  }
}

async function toHttpError(response: Response): Promise<ApiError> {
  const problem = await readProblem(response);
  const kind: ApiErrorKind = response.status >= 500 ? "server" : "client";

  if (!problem) {
    // Có phản hồi (kể cả 5xx) tức là máy chủ vẫn kết nối được: dùng câu chung, không báo lỗi mạng.
    return new ApiError({
      kind,
      status: response.status,
      message: GENERIC_MESSAGE,
    });
  }

  // Giữ nguyên lời báo tiếng Việt của API, giao diện không tự viết lại.
  return new ApiError({
    kind,
    status: response.status,
    title: problem.title ?? "",
    detail: problem.detail ?? "",
    errors: problem.errors ?? {},
    message: problem.detail || problem.title || GENERIC_MESSAGE,
  });
}

// Trả về ProblemDetails nếu phản hồi đúng dạng application/problem+json, ngược lại trả null.
async function readProblem(response: Response): Promise<ProblemDetails | null> {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/problem+json")) {
    return null;
  }
  try {
    return (await response.json()) as ProblemDetails;
  } catch (error) {
    // Body hỏng thì coi như không có ProblemDetails; lỗi hủy thì ném lại để phân loại đúng.
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

function toApiError(
  error: unknown,
  pageSignal: AbortSignal | undefined,
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    // Trang tự hủy thì báo "aborted"; còn lại là quá hạn 10 giây.
    return pageSignal?.aborted
      ? new ApiError({ kind: "aborted", message: "" })
      : new ApiError({ kind: "network", message: NETWORK_MESSAGE });
  }
  if (error instanceof TypeError) {
    // fetch bị từ chối: backend tắt, sai cổng, hoặc trình duyệt chặn vì CORS.
    return new ApiError({ kind: "network", message: NETWORK_MESSAGE });
  }
  return unexpectedError(error);
}

// Lỗi lập trình ngoài dự kiến: ghi ra console cho người phát triển, người dùng chỉ thấy câu chung.
function unexpectedError(error: unknown): ApiError {
  console.error(error);
  return new ApiError({ kind: "server", message: GENERIC_MESSAGE });
}

/** Trang tự hủy lời gọi (rời trang, có lần tải mới hơn): không phải lỗi, trang bỏ qua. */
export function isAborted(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "aborted";
}

/** Lời báo để hiện cho người dùng: lời báo tiếng Việt của API nếu có, không thì câu chung. */
export function messageOf(error: unknown): string {
  return error instanceof ApiError && error.message
    ? error.message
    : GENERIC_MESSAGE;
}
