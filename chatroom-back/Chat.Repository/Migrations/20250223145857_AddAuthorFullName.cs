using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chat.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthorFullName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "author_full_name",
                table: "chat_messages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "updated_at",
                table: "chat_messages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "author_full_name",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "chat_messages");
        }
    }
}
