import { useState } from "react";
import type { Ref, SubmitEvent } from "react";
import { Icon } from "./Icon";

type SearchBoxProps = {
  /** Chuỗi tìm đang có trên địa chỉ (?search=), dùng làm giá trị của ô. */
  initialValue: string;
  /** Gọi khi bấm "Tìm" hoặc Enter, nhận chuỗi đã bỏ khoảng trắng hai đầu. */
  onSearch: (value: string) => void;
  /** Để trang đưa focus về ô, ví dụ sau khi bấm "Xóa tìm kiếm". */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * Form tìm kiếm dùng chung (interaction-spec 2.4). Gõ chưa làm gì; chỉ tìm khi bấm "Tìm" hoặc Enter.
 *
 * Ô không bị khóa khi trang đang tải và không bị tạo lại sau mỗi lần tìm, để focus bàn phím ở lại trong ô
 * (WCAG 2.4.3). Bấm Tìm lần nữa lúc đang tải vẫn an toàn: trang hủy lời gọi cũ trước khi gọi lời mới (NFR5.5).
 */
export function SearchBox({
  initialValue,
  onSearch,
  inputRef,
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  // Chuỗi trên địa chỉ đổi mà không do ô này (Back/Forward, "Xóa tìm kiếm") thì ô lấy theo.
  // Đặt lại state ngay trong lúc vẽ là cách React khuyên dùng cho việc "đổi state theo prop", thay cho effect.
  const [syncedValue, setSyncedValue] = useState(initialValue);
  if (initialValue !== syncedValue) {
    setSyncedValue(initialValue);
    setValue(initialValue);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value.trim());
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
