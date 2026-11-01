# Câu hỏi NFR Design: u3-departments

> Các mục khác đã chốt ở NFR Requirements và rà soát (InMemory cho test, chỉ mục viết tay, seed không id, không cache, không retry). Chỉ còn một chỗ cần anh chọn, vì nó thêm một công cụ vào dự án.

## Q1. Đọc con số độ phủ 80% của `DepartmentService` bằng gì?

Bối cảnh: `coverlet.collector` (đã có ở U1) chỉ sinh file XML `coverage.cobertura.xml`, mở ra rất khó đọc. Cần một cách xem được "lớp `DepartmentService` phủ bao nhiêu % dòng" (NFR4.2). Dự án cấm cài global, nên công cụ nào cũng phải cài cục bộ qua tool manifest như `dotnet-ef`.

A. `reportgenerator` cài cục bộ trong `.config/dotnet-tools.json` (gói `dotnet-reportgenerator-globaltool`, tên có chữ "globaltool" nhưng cài cục bộ được). Đọc file XML, in bảng % theo từng lớp (`TextSummary`) và có thể làm trang HTML. Đây là cách phổ biến nhất trong dự án .NET. Không tự chặn khi dưới 80%: anh đọc số rồi tự quyết. (Khuyên dùng)
B. Đổi sang `coverlet.msbuild` với ngưỡng: `dotnet test /p:CollectCoverage=true /p:Threshold=80 /p:Include="[EmployeeCrud.Api]*Service"`. Dưới 80% thì `dotnet test` báo lỗi luôn, nên lệnh `verify` tự chặn. Nhược: thêm một gói coverlet thứ hai, bảng in ra theo module chứ không theo lớp, khó xem dòng nào chưa phủ.
C. Cả hai: ngưỡng tự chặn (B) và báo cáo đọc theo lớp (A).
X. Other (please specify)

[Answer]: A
