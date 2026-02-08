using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankingATMSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class addIndexTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TransactionsHistory_UserId",
                table: "TransactionsHistory");

            migrationBuilder.AlterColumn<string>(
                name: "ReceiverUserId",
                table: "TransactionsHistory",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "IsUsed",
                table: "RefreshToken",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "JwtId",
                table: "RefreshToken",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "isRevoked",
                table: "RefreshToken",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_History_Search",
                table: "TransactionsHistory",
                columns: new[] { "UserId", "ReceiverUserId", "CreateAt" },
                descending: new[] { false, false, true })
                .Annotation("SqlServer:Include", new[] { "Amount", "Description" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transactions_History_Search",
                table: "TransactionsHistory");

            migrationBuilder.DropColumn(
                name: "IsUsed",
                table: "RefreshToken");

            migrationBuilder.DropColumn(
                name: "JwtId",
                table: "RefreshToken");

            migrationBuilder.DropColumn(
                name: "isRevoked",
                table: "RefreshToken");

            migrationBuilder.AlterColumn<string>(
                name: "ReceiverUserId",
                table: "TransactionsHistory",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionsHistory_UserId",
                table: "TransactionsHistory",
                column: "UserId");
        }
    }
}
