using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankingATMSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRowUpdateUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PinHash",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestIs",
                table: "TransactionsHistory",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PinHash",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RequestIs",
                table: "TransactionsHistory");
        }
    }
}
