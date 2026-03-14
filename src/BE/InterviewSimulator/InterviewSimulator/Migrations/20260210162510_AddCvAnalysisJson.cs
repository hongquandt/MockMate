using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewSimulator.Migrations
{
    /// <inheritdoc />
    public partial class AddCvAnalysisJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CvAnalysisJson",
                table: "InterviewSessions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CvAnalysisJson",
                table: "InterviewSessions");
        }
    }
}
