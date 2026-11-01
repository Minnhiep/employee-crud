import type { FieldErrors } from "../api/client";

/**
 * Chia lỗi { tênÔ: [lời báo] } (từ kiểm dữ liệu trên form hoặc từ errors của API) thành hai phần:
 * - fieldErrors: lỗi của các ô có trên form, để hiện ngay dưới ô đó;
 * - otherMessages: lỗi có khóa không trùng ô nào, để hiện ở khung tóm tắt (hợp đồng C3).
 */
export function splitErrors(
  errors: FieldErrors | undefined,
  fieldNames: readonly string[],
): { fieldErrors: FieldErrors; otherMessages: string[] } {
  const fieldErrors: FieldErrors = {};
  const otherMessages: string[] = [];

  for (const [key, messages] of Object.entries(errors ?? {})) {
    if (fieldNames.includes(key)) {
      fieldErrors[key] = messages;
    } else {
      otherMessages.push(...messages);
    }
  }

  return { fieldErrors, otherMessages };
}
