using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chat.Repository.Migrations
{
    /// <inheritdoc />
    public partial class ChatRoomName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "chat_rooms",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "name",
                table: "chat_rooms");
        }
    }
}
