using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankingATMSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityAndSecurity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_refreshTokens_Users_UserAccountId",
                table: "refreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Accounts_AccountId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_refreshTokens",
                table: "refreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "refreshTokens");

            migrationBuilder.RenameTable(
                name: "refreshTokens",
                newName: "RefreshTokens");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "UserAccount");

            migrationBuilder.RenameIndex(
                name: "IX_refreshTokens_UserAccountId",
                table: "RefreshTokens",
                newName: "IX_RefreshTokens_UserAccountId");

            migrationBuilder.RenameIndex(
                name: "IX_refreshTokens_Token",
                table: "RefreshTokens",
                newName: "IX_RefreshTokens_Token");

            migrationBuilder.AlterColumn<string>(
                name: "UserAccountId",
                table: "RefreshTokens",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "UserAccount",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserAccount",
                table: "UserAccount",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(19,4)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserAccount_UserId",
                table: "UserAccount",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_AccountNumber",
                table: "User",
                column: "AccountNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_UserAccount_UserAccountId",
                table: "RefreshTokens",
                column: "UserAccountId",
                principalTable: "UserAccount",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_UserAccount_AccountId",
                table: "Transactions",
                column: "AccountId",
                principalTable: "UserAccount",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserAccount_User_UserId",
                table: "UserAccount",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_UserAccount_UserAccountId",
                table: "RefreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_UserAccount_AccountId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAccount_User_UserId",
                table: "UserAccount");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshTokens",
                table: "RefreshTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserAccount",
                table: "UserAccount");

            migrationBuilder.DropIndex(
                name: "IX_UserAccount_UserId",
                table: "UserAccount");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "UserAccount");

            migrationBuilder.RenameTable(
                name: "RefreshTokens",
                newName: "refreshTokens");

            migrationBuilder.RenameTable(
                name: "UserAccount",
                newName: "Users");

            migrationBuilder.RenameIndex(
                name: "IX_RefreshTokens_UserAccountId",
                table: "refreshTokens",
                newName: "IX_refreshTokens_UserAccountId");

            migrationBuilder.RenameIndex(
                name: "IX_RefreshTokens_Token",
                table: "refreshTokens",
                newName: "IX_refreshTokens_Token");

            migrationBuilder.AlterColumn<string>(
                name: "UserAccountId",
                table: "refreshTokens",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "refreshTokens",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_refreshTokens",
                table: "refreshTokens",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(19,4)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AccountNumber",
                table: "Accounts",
                column: "AccountNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_refreshTokens_Users_UserAccountId",
                table: "refreshTokens",
                column: "UserAccountId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Accounts_AccountId",
                table: "Transactions",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
