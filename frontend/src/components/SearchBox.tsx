import { useState } from "react";
import type { Ref, SubmitEvent } from "react";
import { Icon } from "./Icon";

type SearchBoxProps = {
  /** Chuỗi tìm đang có trên địa chỉ (?search=), dùng làm giá trị của ô. */
  initialValue: string;
  /** Gọi khi bấm "Tìm" hoặc Enter, nhận chuỗi đã bỏ khoảng trắng hai đầu; trả lại chuỗi thật sự được tìm (đã chuẩn hóa). */
  onSearch: (value: string) => string;
  /** Để trang đưa focus về ô, ví dụ sau khi bấm "Xóa bộ lọc". */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * Ô tìm nhân viên theo họ tên hoặc email, chỉ dùng ở trang danh sách nhân viên (nhãn, chữ mẫu và data-testid đều
 * dành cho nhân viên). Gõ chưa làm gì; chỉ tìm khi bấm "Tìm" hoặc Enter.
 *
 * Ô không bị khóa khi trang đang tải và không bị tạo lại sau mỗi lần tìm, để focus bàn phím ở lại trong ô
 * (WCAG 2.4.3). Bấm Tìm lần nữa lúc đang tải vẫn an toàn: trang hủy lời gọi cũ trước khi gọi lời mới.
 */
export function SearchBox({
  initialValue,
  onSearch,
  inputRef,
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  // Chuỗi trên địa chỉ đổi mà không do ô này (Back/Forward, "Xóa bộ lọc") thì ô lấy theo.
  // Đặt lại state ngay trong lúc vẽ là cách React khuyên dùng cho việc "đổi state theo prop", thay cho effect.
  const [syncedValue, setSyncedValue] = useState(initialValue);
  if (initialValue !== syncedValue) {
    setSyncedValue(initialValue);
    setValue(initialValue);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // Ô luôn hiện đúng chuỗi được tìm, kể cả khi chuỗi đó trùng chuỗi đang có trên địa chỉ: lúc đó initialValue
    // không đổi nên khối đồng bộ ở trên không chạy (ví dụ gõ lại "a  b" khi đang tìm "a b").
    setValue(onSearch(value.trim()));
  }

  return (
    <form role="search" className="search" onSubmit={handleSubmit}>
      {/* Nhãn ẩn khỏi mắt nhưng trình đọc màn hình vẫn đọc; icon kính lúp và chữ mờ cho người nhìn biết ô để làm gì. */}
      <label htmlFor="tim-kiem" className="sr-only">
        Tìm theo họ tên hoặc email
      </label>
      <div className="search__field">
        <Icon name="search" />
        <input
          ref={inputRef}
          id="tim-kiem"
          type="search"
          autoComplete="off"
          placeholder="Tìm theo họ tên hoặc email"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          data-testid="employee-search-input"
        />
      </div>
      <button
        type="submit"
        className="btn btn--secondary"
        data-testid="employee-search-submit"
      >
        Tìm
      </button>
    </form>
  );
}
