import type { FieldErrors } from "../../api/client";
import { normalizeText } from "../../utils/normalizeText";

/** Phải khớp DepartmentConfiguration.NameMaxLength ở backend. Xuất ra vì form dùng trong dòng gợi ý dưới ô tên. */
export const DEPARTMENT_NAME_MAX_LENGTH = 100;

/**
 * Kiểm tên phòng ban trên trình duyệt, cùng luật và cùng thứ tự với API, để báo lỗi ngay
 * mà không cần gọi máy chủ. API vẫn kiểm lại, vì không được tin dữ liệu từ form.
 */
export function validateDepartment(name: string): FieldErrors {
  const normalized = normalizeText(name);

  if (normalized === null) {
    return { name: ["Tên phòng ban chứa ký tự không hợp lệ"] };
  }
  if (normalized.length === 0) {
    return { name: ["Vui lòng nhập tên phòng ban"] };
  }
  // Đếm trên tên đã chuẩn hóa, đúng thứ API sẽ lưu (khoảng trắng thừa không bị tính).
  if (normalized.length > DEPARTMENT_NAME_MAX_LENGTH) {
    return {
      name: [`Tên phòng ban tối đa ${DEPARTMENT_NAME_MAX_LENGTH} ký tự`],
    };
  }
  return {};
}
