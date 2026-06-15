using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewSimulator.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "JobPositions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobPositions_CompanyId",
                table: "JobPositions",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobPositions_Companies",
                table: "JobPositions",
                column: "CompanyId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobPositions_Companies",
                table: "JobPositions");

            migrationBuilder.DropIndex(
                name: "IX_JobPositions_CompanyId",
                table: "JobPositions");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "JobPositions");
        }
    }
}
