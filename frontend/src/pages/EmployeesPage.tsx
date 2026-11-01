import { usePageTitle } from "../hooks/usePageTitle";

// U2 mới có tiêu đề; danh sách, tìm kiếm và nút thêm nhân viên do U4 làm.
export function EmployeesPage() {
  const headingRef = usePageTitle("Nhân viên");

  return (
    <h1 ref={headingRef} tabIndex={-1}>
      Nhân viên
    </h1>
  );
}
