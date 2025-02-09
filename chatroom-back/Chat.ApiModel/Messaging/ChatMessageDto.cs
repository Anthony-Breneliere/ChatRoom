using System.ComponentModel.DataAnnotations;
using ChatRoom.ApiModel;

namespace Chat.ApiModel.Messaging;

/// <summary>
/// Represents a company-to-company chat message in the messaging section of the application.
/// </summary>
public sealed class ChatMessageDto
{
    /// <summary>
    /// ID of message
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID of chat room this message belongs to
    /// </summary>
    public Guid RoomId { get; set; }
    
    /// <summary>
    /// ID of message's author
    /// </summary>
    public Guid AuthorId { get; set; }

    /// <summary>
    /// Full name of the message's author
    /// </summary>
    public string AuthorFullName { get; set; } = "";

    /// <summary>
    /// ID of the author's company
    /// </summary>
    public int AuthorCompanyId { get; set; }
    
    /// <summary>
    /// Name of the author's company
    /// </summary>
    public string AuthorCompanyName { get; set; } = "";
    
    /// <summary>
    /// Message content
    /// </summary>
    [StringLength(4096, MinimumLength = 1)]
    public string Content { get; set; } = "";

    /// <summary>
    /// Date and time the message was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
    
    /// <summary>
    /// Date and time the message was last updated.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
}