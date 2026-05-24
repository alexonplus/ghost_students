using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GhostStudentBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SessionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SkillName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinalScore = table.Column<int>(type: "int", nullable: false),
                    TotalXpEarned = table.Column<int>(type: "int", nullable: false),
                    TotalTimeSeconds = table.Column<int>(type: "int", nullable: false),
                    DistractionTimeSeconds = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionHistories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SessionHistories_UserId",
                table: "SessionHistories",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionHistories");
        }
    }
}
