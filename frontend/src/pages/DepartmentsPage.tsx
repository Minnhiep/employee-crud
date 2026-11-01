import { usePageTitle } from "../hooks/usePageTitle";

// U2 mới có tiêu đề; danh sách và nút thêm phòng ban do U3 làm.
export function DepartmentsPage() {
  const headingRef = usePageTitle("Phòng ban");

  return (
    <h1 ref={headingRef} tabIndex={-1}>
      Phòng ban
    </h1>
  );
}
