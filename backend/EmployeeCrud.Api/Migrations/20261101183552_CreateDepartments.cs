using Microsoft.EntityFrameworkCore.Migrations;

using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EmployeeCrud.Api.Migrations
{
    /// <inheritdoc />
    public partial class CreateDepartments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "departments",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_departments", x => x.id);
                });

            // Viết tay: EF Core không sinh được chỉ mục trên biểu thức lower(name).
            // Chỉ mục này để database tự chặn tên trùng không phân biệt hoa thường,
            // và tên ux_departments_name phải khớp DbConstraintNames để ErrorMapper đổi lỗi 23505 thành 409.
            migrationBuilder.Sql("CREATE UNIQUE INDEX ux_departments_name ON departments (lower(name));");

            // Dữ liệu mẫu. Chỉ chèn cột name, để id do database tự cấp:
            // nếu chèn kèm id cố định thì bộ đếm tự tăng không chạy theo, lần thêm phòng ban sau sẽ bị trùng id.
            migrationBuilder.InsertData(
                table: "departments",
                column: "name",
                values: new object[] { "Nhân sự", "Kế toán", "Kỹ thuật", "Kinh doanh" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Quay lui theo thứ tự ngược với Up: xóa chỉ mục viết tay trước, rồi mới xóa bảng.
            migrationBuilder.Sql("DROP INDEX IF EXISTS ux_departments_name;");

            migrationBuilder.DropTable(
                name: "departments");
        }
    }
}