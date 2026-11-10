import type { FieldErrors } from "../../api/client";
import { normalizeText } from "../../utils/normalizeText";

/**
 * Phải khớp EmployeeConfiguration.FullNameMaxLength / EmailMaxLength ở backend.
 * FULL_NAME_MAX_LENGTH xuất ra vì form dùng trong dòng gợi ý dưới ô Họ tên; EMAIL_MAX_LENGTH chỉ dùng trong file này.
 */
export const FULL_NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;

/**
 * Một luật định dạng email, chép GIỐNG HỆT EmployeeService.EmailPattern ở backend.
 * Đọc thành lời: trước "@" ít nhất một ký tự không phải khoảng trắng hay "@"; sau "@" ít nhất hai đoạn
 * ngăn bởi dấu chấm, mỗi đoạn không rỗng (nên dấu chấm không đứng đầu, cuối hay liền nhau).
 * Điều kiện: email PHẢI được chuẩn hóa (normalizeText: bỏ hai đầu, gộp khoảng trắng) trước khi kiểm. "$" và "\s"
 * của JavaScript hơi khác .NET (.NET cho "$" khớp trước một dấu xuống dòng cuối chuỗi), nhưng đã chuẩn hóa thì
 * không còn dấu xuống dòng nào, hai bên cho cùng kết quả.
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
 * Kiểm cả ba ô trên trình duyệt, cùng luật, cùng thứ tự trong từng ô và cùng lời báo với API,
 * để báo lỗi ngay mà không cần gọi máy chủ. API vẫn kiểm lại, vì không được tin dữ liệu từ form.
 * Khác API:
 * - form báo lỗi của mọi ô cùng lúc; API dừng ở lỗi đầu tiên service gặp (họ tên → email → phòng ban), trừ khi họ
 *   tên, email bị thiếu hẳn hoặc bỏ trống: [Required] của EmployeeRequest chặn trước và báo cùng lúc cả hai ô;
 * - chỉ API kiểm được những gì cần database: phòng ban còn tồn tại không, email đã có người dùng chưa.
 */
export function validateEmployee(values: EmployeeFormValues): FieldErrors {
  const errors: FieldErrors = {};

  // Độ dài, định dạng tính trên giá trị đã chuẩn hóa: đúng thứ API sẽ lưu.
  const fullName = normalizeText(values.fullName);
  if (fullName === null) {
    errors.fullName = ["Họ tên chứa ký tự không hợp lệ"];
  } else if (fullName.length === 0) {
    errors.fullName = ["Vui lòng nhập họ tên"];
  } else if (fullName.length > FULL_NAME_MAX_LENGTH) {
    errors.fullName = [`Họ tên tối đa ${FULL_NAME_MAX_LENGTH} ký tự`];
  }

  const email = normalizeText(values.email);
  if (email === null) {
    errors.email = ["Email chứa ký tự không hợp lệ"];
  } else if (email.length === 0) {
    errors.email = ["Vui lòng nhập email"];
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = [`Email tối đa ${EMAIL_MAX_LENGTH} ký tự`];
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = ["Email không đúng định dạng"];
  }

  const departmentId = Number(values.departmentId);
  if (!Number.isInteger(departmentId) || departmentId < 1) {
    errors.departmentId = ["Vui lòng chọn phòng ban"];
  }

  return errors;
}
