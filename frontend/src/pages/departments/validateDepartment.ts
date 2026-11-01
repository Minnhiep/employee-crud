import type { FieldErrors } from "../../api/client";

/** Phải khớp DepartmentConfiguration.NameMaxLength ở backend. */
export const DEPARTMENT_NAME_MAX_LENGTH = 100;

/**
 * Kiểm tên phòng ban trên trình duyệt, cùng luật với API (BR1.1–BR1.3), để báo lỗi ngay mà không cần gọi máy chủ.
 * API vẫn kiểm lại, vì không được tin dữ liệu từ form.
 */
export function validateDepartment(name: string): FieldErrors {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { name: ["Vui lòng nhập tên phòng ban"] };
  }
  if (trimmed.length > DEPARTMENT_NAME_MAX_LENGTH) {
    return { name: ["Tên phòng ban tối đa 100 ký tự"] };
  }
  return {};
}
