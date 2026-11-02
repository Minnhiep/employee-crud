import type { FieldErrors } from "../../api/client";

/** Phải khớp EmployeeConfiguration.FullNameMaxLength / EmailMaxLength ở backend. */
export const FULL_NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

/**
 * BR1.6: một luật định dạng email, chép GIỐNG HỆT EmployeeService.EmailPattern ở backend.
 * Đọc thành lời: trước "@" ít nhất một ký tự không phải khoảng trắng hay "@"; sau "@" ít nhất hai đoạn
 * ngăn bởi dấu chấm, mỗi đoạn không rỗng (nên dấu chấm không đứng đầu, cuối hay liền nhau).
 * Điều kiện: email PHẢI được trim trước khi kiểm. "$" và "\s" của JavaScript hơi khác .NET
 * (.NET cho "$" khớp trước một dấu xuống dòng cuối chuỗi), nhưng đã trim thì hai bên cho cùng kết quả.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Giá trị đang gõ trong form; departmentId là chuỗi của ô chọn ("" = chưa chọn). */
export type EmployeeFormValues = {
  fullName: string;
  email: string;
  departmentId: string;
};

export type EmployeeField = keyof EmployeeFormValues;

/**
 * Kiểm cả ba ô trên trình duyệt, cùng luật và cùng lời báo với API (BR1.1–BR1.6, BR1.8),
 * để báo lỗi ngay mà không cần gọi máy chủ. API vẫn kiểm lại, vì không được tin dữ liệu từ form.
 * Khác API: form báo đủ lỗi của mọi ô một lần (API chỉ báo lỗi đầu tiên).
 */
export function validateEmployee(values: EmployeeFormValues): FieldErrors {
  const errors: FieldErrors = {};

  const fullName = values.fullName.trim();
  if (fullName.length === 0) {
    errors.fullName = ["Vui lòng nhập họ tên"];
  } else if (fullName.length > FULL_NAME_MAX_LENGTH) {
    errors.fullName = ["Họ tên tối đa 100 ký tự"];
  }

  const email = values.email.trim();
  if (email.length === 0) {
    errors.email = ["Vui lòng nhập email"];
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = ["Email tối đa 254 ký tự"];
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = ["Email không đúng định dạng"];
  }

  const departmentId = Number(values.departmentId);
  if (!Number.isInteger(departmentId) || departmentId < 1) {
    errors.departmentId = ["Vui lòng chọn phòng ban"];
  }

  return errors;
}
