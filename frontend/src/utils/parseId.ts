// Mã trong API là kiểu int của C#: số lớn hơn thì API không có bản ghi nào, khỏi gọi.
const MAX_ID = 2147483647;

/**
 * Đọc mã trên địa chỉ (đường dẫn hoặc tham số), trả null khi không hợp lệ.
 * Chỉ nhận số nguyên dương viết bằng chữ số, không có số 0 ở đầu. Không dùng Number() trực tiếp vì nó đọc
 * "2127e0" thành 2127 và "0x10" thành 16, khiến địa chỉ sai mở nhầm form của bản ghi khác.
 */
export function parseId(raw: string | null | undefined): number | null {
  if (!raw || !/^[1-9][0-9]*$/.test(raw)) {
    return null;
  }
  const id = Number(raw);
  return id <= MAX_ID ? id : null;
}
