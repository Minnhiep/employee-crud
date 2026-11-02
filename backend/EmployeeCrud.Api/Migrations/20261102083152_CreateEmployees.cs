using Microsoft.EntityFrameworkCore.Migrations;

using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EmployeeCrud.Api.Migrations
{
    /// <inheritdoc />
    public partial class CreateEmployees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    department_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employees", x => x.id);
                    table.ForeignKey(
                        name: "fk_employees_department",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_employees_department_id",
                table: "employees",
                column: "department_id");

            // Viết tay: EF Core không sinh được chỉ mục trên biểu thức lower(email).
            // Chỉ mục này để database tự chặn email trùng không phân biệt hoa thường (BR3.2),
            // còn email vẫn lưu đúng như người dùng gõ. Tên ux_employees_email phải khớp DbConstraintNames
            // để U1 đổi lỗi 23505 thành 409 "Email đã được sử dụng".
            migrationBuilder.Sql("CREATE UNIQUE INDEX ux_employees_email ON employees (lower(email));");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Quay lui theo thứ tự ngược với Up: xóa chỉ mục viết tay trước, rồi mới xóa bảng.
            // Bảng departments và dữ liệu phòng ban không bị đụng tới (migration CreateDepartments giữ nguyên).
            migrationBuilder.Sql("DROP INDEX IF EXISTS ux_employees_email;");

            migrationBuilder.DropTable(
                name: "employees");
        }
    }
}