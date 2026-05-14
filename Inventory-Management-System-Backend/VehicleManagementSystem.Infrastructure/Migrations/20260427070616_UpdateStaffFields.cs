using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VehicleManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStaffFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Staffs");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Staffs",
                newName: "Password");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Staffs",
                newName: "PasswordHash");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Staffs",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
