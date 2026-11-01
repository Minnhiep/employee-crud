import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { RequestOptions } from "./client";

/** Phòng ban API trả về (hợp đồng C1). */
export type Department = {
  id: number;
  name: string;
};

/** Dữ liệu gửi lên khi thêm hoặc sửa phòng ban. */
export type DepartmentRequest = {
  name: string;
};

const BASE_PATH = "/api/departments";

/** Danh sách phòng ban, đã sắp theo tên A-Z ở backend. */
export function getDepartments(
  options?: RequestOptions,
): Promise<Department[]> {
  return apiGet<Department[]>(BASE_PATH, options);
}

export function getDepartment(
  id: number,
  options?: RequestOptions,
): Promise<Department> {
  return apiGet<Department>(`${BASE_PATH}/${id}`, options);
}

export function createDepartment(
  request: DepartmentRequest,
): Promise<Department> {
  return apiPost<Department>(BASE_PATH, request);
}

export function updateDepartment(
  id: number,
  request: DepartmentRequest,
): Promise<Department> {
  return apiPut<Department>(`${BASE_PATH}/${id}`, request);
}

export function deleteDepartment(id: number): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`);
}
