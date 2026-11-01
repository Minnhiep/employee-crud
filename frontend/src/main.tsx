import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Thứ tự nạp CSS quan trọng: biến trước, rồi kiểu nền, rồi class của component.
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  // index.html luôn có <div id="root">; thiếu thì là lỗi cấu hình, báo rõ thay vì trang trắng im lặng.
  throw new Error("Không tìm thấy phần tử #root trong index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
