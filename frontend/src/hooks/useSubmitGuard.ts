import { useCallback, useRef, useState } from "react";

/**
 * Chặn gửi hai lần khi bấm Lưu (hoặc xác nhận Xóa) thật nhanh.
 *
 * const { isSubmitting, run } = useSubmitGuard()
 * <button disabled={isSubmitting} onClick={() => run(() => apiPost(...))}>
 *   {isSubmitting ? 'Đang lưu...' : 'Lưu'}
 * </button>
 *
 * Vì sao cần cờ useRef: useState chỉ đổi ở lần vẽ lại kế tiếp, nên hai cú bấm trong cùng
 * một nhịp vẫn lọt qua. useRef đổi ngay lập tức, chặn được lần bấm thứ hai.
 */
export function useSubmitGuard() {
  const busyRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trả về kết quả của task, hoặc undefined khi lần bấm bị chặn vì đang gửi.
  const run = useCallback(
    async <T>(task: () => Promise<T>): Promise<T | undefined> => {
      if (busyRef.current) {
        return undefined;
      }
      busyRef.current = true;
      setIsSubmitting(true);
      try {
        return await task();
      } finally {
        // Xong (thành công hay lỗi) thì mở khóa nút.
        busyRef.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { isSubmitting, run };
}
