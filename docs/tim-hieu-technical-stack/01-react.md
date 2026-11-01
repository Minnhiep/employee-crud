# 01. React: tầng giao diện

> Phần trong kế hoạch: *JavaScript cơ bản; component, props, state; useState, useEffect; form và kiểm tra dữ liệu; gọi API; hiển thị trạng thái loading và lỗi.*
> Vị trí trong luồng: **bước 1–3 và 9** ở [00-tong-quan-luong.md](00-tong-quan-luong.md).

## 1. React là gì, nói đơn giản

Hình dung giao diện như **bộ đồ chơi lắp ghép**. Mỗi miếng ghép (nút, ô nhập, bảng, form) được làm một lần rồi dùng lại nhiều chỗ. Mỗi miếng như vậy là một **component**.

Điểm khác biệt chính của React: bạn **không tự sửa màn hình từng chỗ**. Bạn chỉ mô tả "với dữ liệu này thì màn hình trông như thế này". Khi dữ liệu đổi, React tự vẽ lại phần cần đổi. Dữ liệu thay đổi được gọi là **state**.

## 2. JavaScript cần nắm trước

React chỉ là JavaScript. Các cú pháp sau gặp liên tục:

```js
// const/let: dùng const mặc định, let khi cần gán lại; tránh var
const name = "An";
let count = 0;

// Arrow function
const add = (a, b) => a + b;

// Template string
const greeting = `Xin chào ${name}`;

// Destructuring: lấy thuộc tính ra biến
const employee = { id: 1, fullName: "An", departmentId: 2 };
const { fullName, departmentId } = employee;

// Spread: tạo object/mảng MỚI từ cái cũ (rất quan trọng với state)
const updated = { ...employee, fullName: "Bình" };
const list = [1, 2];
const list2 = [...list, 3];

// map / filter: biến đổi và lọc mảng, trả về mảng MỚI
const names = [employee].map(e => e.fullName);
const inDept2 = [employee].filter(e => e.departmentId === 2);

// Promise + async/await: chờ việc mất thời gian (gọi mạng) mà không đứng máy
async function load() {
  const res = await fetch("/api/employees");
  const data = await res.json();
  return data;
}

// Module: chia code ra nhiều file
// export default function EmployeeList() {...}
// import EmployeeList from "./EmployeeList";
```

**Vì sao cần "mảng/object mới"?** React so sánh state cũ và mới bằng tham chiếu (có phải cùng một object không). Nếu sửa trực tiếp `employee.fullName = "Bình"` thì vẫn là object cũ, React tưởng không có gì đổi và **không vẽ lại**.

Tài liệu JavaScript: [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) (link quen thuộc, hôm nay em chưa mở lại).

## 3. Tổng quan các cách tạo dự án React

### 3.1 Tạo dự án React là tạo gì

Code React (JSX, `import`, nhiều file) **trình duyệt không chạy thẳng được**. Cần một công cụ làm 3 việc:
1. **Dịch** JSX và JavaScript mới thành thứ trình duyệt hiểu.
2. **Gom** nhiều file thành vài file gọn để đưa lên mạng. Việc này gọi là **bundle**.
3. **Chạy máy chủ phát triển** (dev server): sửa code là trang tự cập nhật. Tính năng này gọi là **HMR**.

Các cách tạo dự án khác nhau ở chỗ **chỉ làm 3 việc trên**, hay **làm thêm cả phần chạy trên máy chủ**.

### 3.2 Hai cách hiển thị trang

| Cách | Nói đơn giản | Thuật ngữ |
|---|---|---|
| Trình duyệt tự dựng trang | Máy chủ gửi "hộp rỗng" kèm code, trình duyệt chạy code rồi mới hiện nội dung | **CSR** (Client-Side Rendering), ứng dụng kiểu **SPA** |
| Máy chủ dựng sẵn trang | Máy chủ gửi trang đã có nội dung, trình duyệt chỉ việc hiện | **SSR** (Server-Side Rendering) |
| Dựng sẵn từ lúc build | Trang được tạo thành file HTML trước, ai vào cũng nhận cùng file | **SSG** (Static Site Generation) |

Ví dụ đời thường: CSR giống mua đồ nội thất **tự lắp** (giao nhanh, về nhà mới lắp). SSR giống mua đồ **lắp sẵn** (mở ra dùng ngay, nhưng cửa hàng phải làm nhiều việc hơn).

### 3.3 Các nhóm công cụ

**Nhóm A: Build tool, chỉ lo giao diện (ra SPA)**

| Công cụ | Đặc điểm | Lệnh tạo |
|---|---|---|
| **Vite** | Phổ biến nhất, khởi động nhanh, ít cấu hình | `npm create vite@latest my-app -- --template react` (mẫu `react-ts` là TypeScript) |
| **Rsbuild** | Viết bằng Rust, build nhanh, hợp dự án lớn | `npx create-rsbuild --template react` |
| **Parcel** | Gần như không cần cấu hình | Không có lệnh tạo mẫu riêng; cài `parcel` rồi tự viết `index.html` (em chưa kiểm lại hướng dẫn hiện hành) |

- **Hợp khi:** đã có backend riêng và React chỉ là giao diện gọi API; hoặc ứng dụng nội bộ cần đăng nhập, không cần Google tìm thấy.
- **Tự lo thêm:** chuyển trang (ví dụ thư viện React Router), tải dữ liệu, tối ưu.

**Nhóm B: Framework, React kèm phần máy chủ**

| Framework | Đặc điểm |
|---|---|
| **Next.js** | Phổ biến nhất; có SSR/SSG, React Server Components, định tuyến theo thư mục. Lệnh: `npx create-next-app@latest` |
| **React Router v7** (chế độ framework) | Kế thừa Remix, đi cùng Vite; dùng được như thư viện chuyển trang hoặc framework đầy đủ |
| **Expo** | Làm **ứng dụng điện thoại** bằng React Native, không phải web |

- **Hợp khi:** cần Google tìm thấy nội dung (SEO), cần trang hiện nhanh ngay lần đầu, hoặc muốn một dự án làm cả giao diện lẫn API.
- **Đánh đổi:**
  - Nhiều khái niệm hơn: phải phân biệt code chạy ở máy chủ và code chạy ở trình duyệt.
  - Cần nơi chạy được Node.js để triển khai, không chỉ chép file tĩnh lên.
  - Nếu đã có backend riêng thì dễ thành hai nơi cùng viết logic.

**Nhóm C: Đã ngừng, đừng dùng cho dự án mới**

- **Create React App** (`npx create-react-app`): ngừng từ 2/2025 vì không còn người bảo trì. Nhiều bài hướng dẫn cũ vẫn dùng.

**Nhóm D: Chỉ để thử, không làm dự án**

- Sân chơi online như **CodeSandbox**, **StackBlitz**: viết thử React ngay trên trình duyệt.
- Nhúng thẳng React bằng thẻ `<script>` vào trang HTML: chỉ để học hay thử nhanh.

### 3.4 Chọn nhanh

```
Ứng dụng di động?                                  → Expo
Cần SEO / trang hiện sẵn nội dung?                 → Next.js hoặc React Router v7 (framework)
Đã có backend riêng, React chỉ là giao diện?       → Nhóm A: Vite, Rsbuild hoặc Parcel
Chỉ muốn thử vài dòng React?                       → StackBlitz / CodeSandbox
```

Mọi cách trên đều cần **Node.js** (trừ nhóm D). Dự án DRMs dùng công cụ nào là **quyết định của nhóm**, kế hoạch chưa ghi; nên hỏi anh Hiếu.

Các ví dụ phía dưới chỉ dùng React thuần (component, state, hook, fetch), nên chạy được với công cụ nào trong nhóm A cũng được. Chỗ nào chỉ đúng với một công cụ thì có ghi chú riêng, ví dụ file `.env` ở mục 6 là cách của Vite.

## 4. Component và props

**Component** là một hàm JavaScript trả về giao diện, viết bằng **JSX**: cú pháp trông giống HTML nhưng nằm trong JavaScript.

**Props** là dữ liệu cha truyền xuống con, giống tham số của hàm. Con **chỉ đọc** props, không sửa.

```jsx
function EmployeeRow({ employee, onEdit, onDelete }) {
  return (
    <tr>
      <td>{employee.fullName}</td>
      <td>{employee.email}</td>
      <td>{employee.departmentName}</td>
      <td>
        <button onClick={() => onEdit(employee)}>Sửa</button>
        <button onClick={() => onDelete(employee.id)}>Xóa</button>
      </td>
    </tr>
  );
}
```

Ghi chú: trong JSX dùng `className` thay `class`, `onClick` thay `onclick`; `{...}` để chèn giá trị JavaScript.

## 5. State và `useState`

**State** là "trí nhớ" của component: dữ liệu thay đổi theo thời gian, như nội dung ô tìm kiếm, danh sách nhân viên, cờ đang tải. Đổi state thì React vẽ lại component.

```jsx
import { useState } from "react";

function SearchBox({ onSearch }) {
  const [keyword, setKeyword] = useState("");   // [giá trị hiện tại, hàm để đổi]

  return (
    <form onSubmit={e => { e.preventDefault(); onSearch(keyword); }}>
      <input value={keyword} onChange={e => setKeyword(e.target.value)} />
      <button type="submit">Tìm</button>
    </form>
  );
}
```

**Props và state khác nhau thế nào:** props do **cha đưa vào**, con không sửa; state do **chính component giữ**, sửa bằng hàm `set...`.

## 6. `useEffect`: làm việc "bên ngoài" sau khi vẽ

Có những việc không phải vẽ giao diện, như **gọi API khi mở trang**. Những việc như vậy gọi là **side effect** và đặt trong `useEffect`.

```jsx
import { useEffect, useState } from "react";

// search, reloadKey do App truyền xuống (xem mục 8); danh sách chỉ lo tải và hiển thị
function EmployeeList({ search, reloadKey, onEdit, onDelete }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;                           // tránh ghi kết quả cũ khi search đổi nhanh
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/employees?search=${encodeURIComponent(search)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);   // fetch KHÔNG tự báo lỗi khi 4xx/5xx
        return res.json();
      })
      .then(data => { if (!ignore) setEmployees(data); })
      .catch(err => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };              // hàm dọn dẹp
  }, [search, reloadKey]);                         // chạy lại khi từ khóa đổi hoặc App báo "tải lại"

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p style={{ color: "red" }}>Không tải được: {error}</p>;
  if (employees.length === 0) return <p>Chưa có nhân viên.</p>;

  return (
    <table>
      <tbody>
        {employees.map(e => (
          <EmployeeRow key={e.id} employee={e} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  );
}
```

Mảng ở cuối `useEffect` gọi là **dependency array**, quyết định khi nào effect chạy:

| Viết | Effect chạy khi |
|---|---|
| `[]` | Một lần sau lần vẽ đầu |
| `[search]` | Lần đầu và mỗi khi `search` đổi |
| Không có mảng | Sau **mọi** lần vẽ (dễ gây gọi API liên tục) |

Lưu ý: ở chế độ phát triển, `<StrictMode>` cố ý chạy effect **hai lần** để lộ lỗi thiếu dọn dẹp. Thấy API bị gọi 2 lần khi chạy `npm run dev` là bình thường. Nguồn: [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) (link quen thuộc, hôm nay em chưa mở lại).

`API_URL` nên để trong file `.env` của Vite, ví dụ `VITE_API_URL=http://localhost:5080`, rồi đọc bằng `import.meta.env.VITE_API_URL`. Số cổng backend tùy máy, xem trong `launchSettings.json` của ASP.NET Core. Cho gọn, khai báo một lần trong `src/api.js` (xem mục 8) rồi `import { API_URL } from "./api";` ở các file cần dùng.

## 7. Form và kiểm tra dữ liệu

**Controlled input**: giá trị ô nhập nằm trong state, mỗi lần gõ thì cập nhật state. Nhờ vậy kiểm tra dữ liệu ngay được.

```jsx
// editing = nhân viên đang sửa; null khi thêm mới. Một form dùng cho cả Thêm và Sửa.
function EmployeeForm({ departments, editing, onSaved, onCancel }) {
  const [form, setForm] = useState({
    fullName: editing?.fullName ?? "",
    email: editing?.email ?? "",
    departmentId: editing ? String(editing.departmentId) : "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Vui lòng nhập họ tên";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Email không hợp lệ";
    if (!form.departmentId) errs.departmentId = "Vui lòng chọn phòng ban";
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;      // có lỗi thì không gửi

    setSaving(true);
    setServerError(null);
    try {
      const url = editing ? `${API_URL}/api/employees/${editing.id}` : `${API_URL}/api/employees`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",            // sửa: PUT; thêm: POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, departmentId: Number(form.departmentId) }),
      });
      if (!res.ok) {
        const problem = await res.json().catch(() => null);
        setServerError(problem?.title ?? `Lỗi ${res.status}`);
        return;
      }
      onSaved();                                     // PUT trả 204 không có body nên không đọc JSON; App tự tải lại danh sách
    } catch {
      setServerError("Không kết nối được máy chủ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Họ tên" />
      {errors.fullName && <span>{errors.fullName}</span>}

      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      {errors.email && <span>{errors.email}</span>}

      <select name="departmentId" value={form.departmentId} onChange={handleChange}>
        <option value="">-- Chọn phòng ban --</option>
        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      {errors.departmentId && <span>{errors.departmentId}</span>}

      {serverError && <p style={{ color: "red" }}>{serverError}</p>}
      <button type="submit" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}</button>
      {editing && <button type="button" onClick={onCancel}>Hủy</button>}
    </form>
  );
}
```

Nút bị khóa khi `saving` để tránh bấm 2 lần, vì bấm 2 lần sẽ tạo 2 nhân viên trùng.

## 8. Ghép lại: App, Sửa, Xóa và tải phòng ban

```
App
├── SearchBox             (ô tìm kiếm)
├── EmployeeList          (gọi GET, hiển thị loading/lỗi/rỗng)
│   └── EmployeeRow       (một dòng, nút Sửa/Xóa)
└── EmployeeForm          (thêm/sửa; gọi POST hoặc PUT; danh sách phòng ban do App tải từ GET /api/departments rồi truyền vào)
```

**State đặt ở đâu?** Đặt ở component cha gần nhất của các component cùng cần dùng nó. `SearchBox`, `EmployeeList` và `EmployeeForm` cùng liên quan tới từ khóa tìm kiếm, việc "tải lại" và nhân viên đang sửa, nên `App` giữ các state này rồi truyền xuống. React gọi việc này là **lifting state up**. Kế hoạch ghi rõ chưa cần Redux trong 2 tuần.

```jsx
// src/api.js
export const API_URL = import.meta.env.VITE_API_URL;   // cách đọc biến môi trường của Vite

// src/App.jsx
import { useEffect, useState } from "react";
import { API_URL } from "./api";
// import SearchBox, EmployeeList, EmployeeForm từ các file tương ứng

export default function App() {
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);       // tăng lên để báo danh sách tải lại
  const [editing, setEditing] = useState(null);        // nhân viên đang sửa; null = đang thêm mới
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState(null);

  // Tải danh sách phòng ban một lần khi mở trang, dùng cho dropdown
  useEffect(() => {
    fetch(`${API_URL}/api/departments`)
      .then(res => { if (!res.ok) throw new Error(`Lỗi ${res.status}`); return res.json(); })
      .then(setDepartments)
      .catch(() => setMessage("Không tải được danh sách phòng ban"));
  }, []);

  const handleDelete = async id => {
    if (!window.confirm("Xóa nhân viên này?")) return;
    const res = await fetch(`${API_URL}/api/employees/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res) setMessage("Không kết nối được máy chủ");
    else if (res.status === 404) setMessage("Nhân viên không còn tồn tại");
    else if (!res.ok) setMessage(`Xóa thất bại (lỗi ${res.status})`);
    else setMessage("Đã xóa");
    setReloadKey(k => k + 1);
  };

  const handleSaved = () => {
    setMessage(editing ? "Đã cập nhật" : "Đã thêm");
    setEditing(null);
    setReloadKey(k => k + 1);
  };

  return (
    <main>
      <h1>Quản lý nhân viên</h1>
      {message && <p>{message}</p>}
      <SearchBox onSearch={setSearch} />
      <EmployeeForm
        key={editing?.id ?? "new"}
        departments={departments}
        editing={editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
      <EmployeeList search={search} reloadKey={reloadKey} onEdit={setEditing} onDelete={handleDelete} />
    </main>
  );
}
```

Những chỗ cần hiểu:
- **Xóa** hỏi xác nhận trước (`window.confirm`) vì không hoàn tác được. API trả `204` là thành công; `404` là bản ghi đã bị xóa trước đó, ví dụ ở tab khác.
- **Sửa**: bấm "Sửa" thì `editing` thành nhân viên đó, form chuyển sang gửi `PUT`.
- **`key={editing?.id ?? "new"}`**: `useState` chỉ lấy giá trị ban đầu **một lần**, lúc component được tạo. Đổi `key` buộc React tạo form mới. Nhờ vậy chuyển từ sửa người A sang người B thì form hiện đúng dữ liệu của B, không giữ dữ liệu của A.
- **`setReloadKey(k => k + 1)`**: tăng một con số chỉ để báo `EmployeeList` tải lại, vì `reloadKey` nằm trong dependency array của nó. Viết dạng hàm `k => k + 1` để luôn lấy giá trị mới nhất.
- **Phòng ban** chỉ tải một lần (`[]`), vì bài này không có chức năng thêm/sửa phòng ban.

## 9. Lỗi hay gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Sửa dữ liệu mà màn hình không đổi | Sửa trực tiếp object/mảng state | Tạo object/mảng mới (`{...}`, `map`, `filter`) |
| API bị gọi liên tục | `useEffect` không có dependency array, hoặc set state làm dependency đổi mãi | Kiểm tra mảng phụ thuộc |
| Cảnh báo "Each child in a list should have a unique key" | Thiếu `key` khi `map` | Dùng `key={e.id}`, không dùng chỉ số mảng |
| Lỗi 400/500 mà màn hình vẫn như thành công | `fetch` chỉ báo lỗi khi mất mạng, không báo khi 4xx/5xx | Luôn kiểm `res.ok` |
| Lỗi "blocked by CORS policy" ở Console | Frontend (cổng 5173) và backend khác địa chỉ, backend chưa cho phép | Bật CORS ở backend, xem [02-api-json.md](02-api-json.md) mục 7 |
| `departmentId` gửi lên là chuỗi `"2"` | Giá trị `<select>` luôn là chuỗi | Đổi bằng `Number(...)` trước khi gửi |

## 10. Câu hỏi tự kiểm

1. Props và state khác nhau thế nào? Cho một ví dụ mỗi loại trong bài CRUD.
2. Vì sao `setEmployees(employees.push(x))` sai? Viết lại cho đúng.
3. Dependency array `[]`, `[search]` và không có mảng khác nhau ra sao?
4. Vì sao phải kiểm `res.ok` sau `fetch`?
5. Một màn hình danh sách cần mấy trạng thái hiển thị? (Gợi ý: đang tải, lỗi, rỗng, có dữ liệu.)
6. Đã kiểm email ở form rồi, sao backend vẫn kiểm lại?
7. Vì sao trình duyệt không chạy thẳng code React được?
8. CSR và SSR khác nhau thế nào? Mỗi loại hợp với kiểu trang nào?
9. Vite và Next.js khác nhau ở điểm cốt lõi nào? Đã có backend ASP.NET Core thì nên chọn nhóm nào, vì sao?
10. Vì sao `EmployeeForm` cần `key={editing?.id ?? "new"}`? Bỏ đi thì lỗi gì xảy ra?
11. Sau khi Thêm/Sửa/Xóa, làm sao danh sách biết phải tải lại?

## Nguồn

- [react.dev/learn](https://react.dev/learn), tài liệu chính thức, nằm trong kế hoạch.
- [Build a React app from Scratch](https://react.dev/learn/build-a-react-app-from-scratch) (Vite, Parcel, Rsbuild), [Creating a React App](https://react.dev/learn/creating-a-react-app) (React Router v7), [Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app), [React Versions](https://react.dev/versions): đã tra ngày 30/10/2026.
- Em biết sẵn, hôm nay chưa mở lại trang để kiểm: Next.js và Expo có trong danh sách framework của react.dev, lệnh `create-next-app`, cách dùng Parcel, các sân chơi online.
