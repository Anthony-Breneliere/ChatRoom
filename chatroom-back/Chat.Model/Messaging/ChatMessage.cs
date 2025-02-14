using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Chat.Model.Timestamps;

namespace Chat.Model.Messaging;

// Inspired by previous work at https://github.com/Nodsoft/OpenChat/blob/develop/Nodsoft.OpenChat.Server/Data/Models/ChatMessage.cs

/// <summary>
/// Represents a company-to-company chat message in the messaging section of the application.
/// </summary>
public sealed class ChatMessage : ICreateTimestamp
{
    /// <summary>
    /// ID of message
    /// </summary>
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; init; }

    /// <summary>
    /// ID of chat room this message belongs to
    /// </summary>
    public Guid RoomId { get; init; }
    
    /// <summary>
    /// Chat room this message belongs to
    /// </summary>
    public ChatRoom Room { get; init; } = new();
    
    /// <summary>
    /// ID of message's author
    /// </summary>
    public Guid AuthorId { get; init; }

    /// <summary>
    /// Author of the message
    /// </summary>
    public User Author { get; init; } = new();
    
    /// <summary>
    /// Message content
    /// </summary>
    [StringLength(4096, MinimumLength = 1)] 
    public string Content { get; set; } = "";

    /// <inheritdoc />
    public DateTimeOffset CreatedAt { get; set; }
}