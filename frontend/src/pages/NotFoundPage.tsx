import { Link } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle";

// Gõ sai địa chỉ thì vào đây, thay vì thấy một trang trắng.
export function NotFoundPage() {
  const headingRef = usePageTitle("Không tìm thấy trang");

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Không tìm thấy trang
      </h1>
      <p>Địa chỉ bạn mở không có trong ứng dụng.</p>
      <p>
        <Link to="/employees">Về trang Nhân viên</Link>
      </p>
    </>
  );
}
