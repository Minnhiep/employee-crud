import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Cổng cố định 5173 cho cả dev và preview: backend chỉ cho phép (CORS) đúng origin
// http://localhost:5173. strictPort làm Vite báo lỗi khi cổng bận, thay vì tự nhảy sang
// 5174 rồi mọi lời gọi API bị trình duyệt chặn.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
});
