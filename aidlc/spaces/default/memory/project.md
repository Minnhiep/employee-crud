# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->
- Frontend: React with TypeScript (strict mode, `.tsx`/`.ts` files), created with Vite as a single-page app that calls the separate ASP.NET Core API (not Next.js or another server framework). Changed from JavaScript by Hiệp on 2026-11-01 (U2 Code Generation) for a professional, maintainable codebase.
- Backend: ASP.NET Core on .NET 10 (LTS), Web API controller-based (Controller → Service → DTO), Dependency Injection.
- Data access: Entity Framework Core + Npgsql.EntityFrameworkCore.PostgreSQL (10.x), migrations.
- Database: PostgreSQL 18 (local, port 5432, database `employee_db`).
- API: REST + JSON, OpenAPI; manual API testing with Postman.
- Source control: Git (local now; GitHub later).
- Installed on this machine (checked 2026-10-30): .NET SDK 10.0.403, PostgreSQL 18.6 + pgAdmin 4, Node.js 24.15.0, npm 11.16.0, Git 2.54.0, Postman.

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->
DECIDED: Requirements source is docs/ke-hoach.md (internship plan): employee & department management — list, create, update, delete, search employees, choose department; validation and basic error messages; data flows React → Web API JSON → ASP.NET Core → PostgreSQL (Hiệp, 2026-10-30)
DECIDED: Deliverables per docs/ke-hoach.md section 5: source with migrations, database diagram, API list with request/response JSON examples, README to install and run locally (Hiệp, 2026-10-30)
DECIDED: AI-DLC generates code; Hiệp (intern) answers every question and approves every gate himself, and must be able to explain the code (Hiệp, 2026-10-30)
DECIDED: User-facing explanations and UI text in Vietnamese (Hiệp, 2026-10-30)
DECIDED: Employees: list, create, update, delete, search by full name and email (case-insensitive) (Hiệp, 2026-10-30)
DECIDED: Departments: simple list, create, update, delete; an employee belongs to exactly one department chosen from a dropdown; a department that still has employees cannot be deleted; seed a few sample departments via EF Core migration (Hiệp, 2026-10-30)
DECIDED: Validation on both the React form and the API, with basic user-facing error messages; API errors use ProblemDetails and correct HTTP status codes (400/404/409) (Hiệp, 2026-10-30)
DECIDED: API documented with OpenAPI; manual API testing with Postman; automated unit tests only for the main business logic (services), no large test suite or E2E (Hiệp, 2026-10-30)
DECIDED: Runs directly on the local machine (dotnet run, npm run dev, local PostgreSQL); README explains local setup (Hiệp, 2026-10-30)

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->
NEVER introduce microservices or a complex architecture — single backend + single frontend (affirmed 2026-10-30, docs/ke-hoach.md section 3)
NEVER use Redux (affirmed 2026-10-30, docs/ke-hoach.md section 3)
NEVER set up CI/CD in this scope (affirmed 2026-10-30, docs/ke-hoach.md section 3)
NEVER commit secrets such as the PostgreSQL password; use user-secrets or local config excluded from git (affirmed 2026-10-30)
NEVER add authentication, login or user roles — not in docs/ke-hoach.md (affirmed 2026-10-30)
NEVER use Docker or containers in this scope — run directly on the local machine (affirmed 2026-10-30)
NEVER use Next.js or another server framework for the frontend in this scope (affirmed 2026-10-30; the TypeScript ban was lifted by Hiệp on 2026-11-01)

NEVER cài công cụ hoặc gói ra ngoài thư mục dự án (ví dụ `dotnet tool install --global`, `npm install -g`) hay đổi PATH khi Hiệp chưa duyệt. (affirmed 2026-10-30)

NEVER tự đẩy (push) code lên GitHub; Hiệp tự làm từng bước khi bài đã xong. (affirmed 2026-10-30)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

ALWAYS để Hiệp tự trả lời mọi câu hỏi và tự duyệt mọi gate; AI-DLC không bao giờ trả lời hay duyệt thay Hiệp. (affirmed 2026-10-30)

ALWAYS kiểm tra dữ liệu ở cả form React lẫn API, và API trả lỗi theo ProblemDetails với mã HTTP đúng (400/404/409). (affirmed 2026-10-30)

ALWAYS viết chữ trên giao diện và thông báo lỗi cho người dùng bằng tiếng Việt. (affirmed 2026-10-30)

ALWAYS làm đúng và đủ theo yêu cầu trong docs/ke-hoach.md (dự án Hiệp giao), không tự thêm hay bớt tính năng. (affirmed 2026-10-30)

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
