using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GhostStudentBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RoomId",
                table: "StudentSessions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "StudentSessions");
        }
    }
}
