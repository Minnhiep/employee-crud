using System.Globalization;
using System.Text;

namespace EmployeeCrud.Api.Platform.Text;

/// <summary>
/// Chuẩn hóa chữ người dùng nhập (tên phòng ban ở U3, họ tên và email ở U4) trước khi kiểm và lưu,
/// để mọi nơi cùng một luật (rà soát tổng thể N-04, S-04). Form React có bản tương ứng: utils/normalizeText.ts.
/// Căn cứ: RFC 8264 §4.3.3 (cấm ký tự điều khiển và ký tự vô hình), RFC 8266 §2.1 (gộp khoảng trắng),
/// W3C Character Model §2.2.1 (dùng NFC, không dùng NFKC vì làm đổi nghĩa chữ).
/// </summary>
public static class TextInput
{
    /// <summary>
    /// Gộp mọi chuỗi khoảng trắng thành một dấu cách, bỏ khoảng trắng hai đầu, đưa chữ có dấu về dạng dựng sẵn (NFC).
    /// Trả false khi còn ký tự điều khiển (ví dụ \0), ký tự định dạng vô hình (ví dụ U+200B, U+202E)
    /// hoặc ký tự Unicode hỏng (nửa cặp surrogate).
    /// </summary>
    public static bool TryNormalize(string? raw, out string normalized)
    {
        normalized = "";
        if (string.IsNullOrEmpty(raw))
        {
            return true;
        }

        var builder = new StringBuilder(raw.Length);
        var pendingSpace = false;
        for (var i = 0; i < raw.Length; i++)
        {
            var c = raw[i];
            // char.IsWhiteSpace gồm cả tab, xuống dòng và khoảng trắng không ngắt (U+00A0, hay gặp khi dán từ Word):
            // tất cả coi như một dấu cách, giống RFC 8266 §2.1 đổi khoảng trắng Unicode thành dấu cách thường.
            if (char.IsWhiteSpace(c))
            {
                // Chỉ nhớ là "cần một dấu cách", ghi ra khi gặp chữ kế tiếp: khoảng trắng đầu và cuối tự bị bỏ.
                pendingSpace = builder.Length > 0;
                continue;
            }

            // Kiểm sau khoảng trắng: tab, xuống dòng cũng là ký tự điều khiển nhưng đã được gộp ở trên.
            // Còn lại như \0 thì PostgreSQL từ chối lưu, để lọt xuống sẽ thành lỗi 500.
            if (char.IsControl(c))
            {
                return false;
            }

            // Ký tự ngoài bảng cơ bản (ví dụ emoji) gồm đúng hai nửa: nửa cao rồi nửa thấp. Thiếu một nửa là chữ hỏng,
            // và string.Normalize sẽ ném lỗi nếu để lọt.
            var isPair = char.IsSurrogate(c);
            if (isPair && !char.IsSurrogatePair(raw, i))
            {
                return false;
            }

            // Ký tự định dạng vô hình (Unicode loại Cf): dấu cách rộng 0 làm "Kế\u200Btoán" trông như "Kếtoán"
            // mà lách được luật không trùng; ký tự đảo chiều U+202E làm chữ hiện ra khác chữ thật (CVE-2021-42574).
            // Đọc theo (raw, i) để ký tự gồm hai nửa surrogate được xét đúng một lần.
            if (CharUnicodeInfo.GetUnicodeCategory(raw, i) == UnicodeCategory.Format)
            {
                return false;
            }

            if (pendingSpace)
            {
                builder.Append(' ');
                pendingSpace = false;
            }

            builder.Append(c);
            if (isPair)
            {
                i++;
                builder.Append(raw[i]);
            }
        }

        // "ế" gõ kiểu tổ hợp (e + dấu mũ + dấu sắc) trông giống hệt "ế" dựng sẵn nhưng là chuỗi khác:
        // đưa về một dạng để so trùng tên và đếm độ dài cho đúng.
        normalized = builder.ToString().Normalize(NormalizationForm.FormC);
        return true;
    }
}
