// Khai báo kiểu cho các biến môi trường VITE_* mà ứng dụng đọc qua import.meta.env.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
