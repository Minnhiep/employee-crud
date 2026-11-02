import { useState } from "react";
import type { SubmitEvent } from "react";

type SearchBoxProps = {
  /** Chuỗi tìm đang có trên địa chỉ (?search=), dùng làm giá trị ban đầu của ô. */
  initialValue: string;
  /** Gọi khi bấm "Tìm" hoặc Enter, nhận chuỗi đã bỏ khoảng trắng hai đầu. */
  onSearch: (value: string) => void;
  /** Khóa ô và nút trong lúc đang tải. */
  disabled?: boolean;
};

/**
 * Form tìm kiếm dùng chung (interaction-spec 2.4). Gõ chưa làm gì; chỉ tìm khi bấm "Tìm" hoặc Enter.
 * Trang dùng nó nên đặt key theo chuỗi trên địa chỉ: khi bấm Back/Forward, chuỗi đổi thì ô được tạo lại
 * với giá trị mới (thay vì phải đồng bộ state bằng effect).
 */
export function SearchBox({
  initialValue,
  onSearch,
  disabled = false,
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form role="search" className="search" onSubmit={handleSubmit}>
      <label htmlFor="tim-kiem">Tìm theo họ tên hoặc email</label>
      <input
        id="tim-kiem"
        type="search"
        autoComplete="off"
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        data-testid="employee-search-input"
      />
      <button
        type="submit"
        className="btn btn--secondary"
        disabled={disabled}
        data-testid="employee-search-submit"
      >
        Tìm
      </button>
    </form>
  );
}
