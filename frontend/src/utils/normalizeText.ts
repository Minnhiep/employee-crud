/**
 * Chuẩn hóa chữ người dùng nhập, cùng luật với TextInput.TryNormalize ở backend:
 * gộp mọi chuỗi khoảng trắng thành một dấu cách, bỏ khoảng trắng hai đầu, đưa chữ có dấu về dạng dựng sẵn (NFC).
 * Trả null khi có ký tự điều khiển, ký tự định dạng vô hình, nửa cặp surrogate hoặc noncharacter.
 * Form dùng hàm này để báo lỗi sớm; API vẫn kiểm lại vì không được tin dữ liệu từ trình duyệt.
 */

// Cùng tập với char.IsWhiteSpace của .NET. Không dùng \s của JavaScript vì nó khác ở hai chỗ:
// thiếu U+0085, và có thêm U+FEFF (BOM, backend coi là ký tự vô hình không hợp lệ).
const WHITESPACE =
  /[\t-\r \u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/u;

// Cc: ký tự điều khiển (ví dụ \0). Cf: ký tự định dạng vô hình (U+200B, U+202E...). Cs: nửa cặp surrogate đứng một mình.
// Noncharacter_Code_Point: 66 mã dành riêng cho nội bộ phần mềm (ví dụ U+FFFE), không phải chữ để trao đổi.
const INVALID = /[\p{Cc}\p{Cf}\p{Cs}\p{Noncharacter_Code_Point}]/u;

export function normalizeText(raw: string): string | null {
  let result = "";
  let pendingSpace = false;
  // for...of đi theo từng ký tự thật: emoji gồm hai nửa surrogate được lấy nguyên một lần.
  for (const char of raw) {
    if (WHITESPACE.test(char)) {
      // Chỉ nhớ là "cần một dấu cách", ghi ra khi gặp chữ kế tiếp: khoảng trắng đầu và cuối tự bị bỏ.
      pendingSpace = result.length > 0;
      continue;
    }
    if (INVALID.test(char)) {
      return null;
    }
    if (pendingSpace) {
      result += " ";
      pendingSpace = false;
    }
    result += char;
  }
  return result.normalize("NFC");
}
