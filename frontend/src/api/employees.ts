import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { RequestOptions } from "./client";

/** Nhân viên API trả về, có sẵn tên phòng ban để không phải gọi thêm. */
export type Employee = {
  id: number;
  fullName: string;
  email: string;
  departmentId: number;
  departmentName: string;
};

/** Dữ liệu gửi lên khi thêm hoặc sửa nhân viên. */
export type EmployeeRequest = {
  fullName: string;
  email: string;
  departmentId: number;
};

const BASE_PATH = "/api/employees";

/**
 * Danh sách nhân viên, đã sắp theo họ tên ở backend.
 * Có chuỗi tìm thì thêm ?search=; có phòng ban thì thêm ?departmentId= (hai điều kiện ghép AND).
 * URLSearchParams mã hóa giá trị, nên dấu tiếng Việt, khoảng trắng, "%", "&" đi đúng nguyên văn.
 */
export function getEmployees(
  search: string,
  departmentId: number | null,
  options?: RequestOptions,
): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (departmentId !== null) {
    params.set("departmentId", String(departmentId));
  }
  const queryString = params.toString();
  const query = queryString ? `?${queryString}` : "";
  return apiGet<Employee[]>(BASE_PATH + query, options);
}

export function getEmployee(
  id: number,
  options?: RequestOptions,
): Promise<Employee> {
  return apiGet<Employee>(`${BASE_PATH}/${id}`, options);
}

export function createEmployee(request: EmployeeRequest): Promise<Employee> {
  return apiPost<Employee>(BASE_PATH, request);
}

export function updateEmployee(
  id: number,
  request: EmployeeRequest,
): Promise<Employee> {
  return apiPut<Employee>(`${BASE_PATH}/${id}`, request);
}

export function deleteEmployee(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`);
}
