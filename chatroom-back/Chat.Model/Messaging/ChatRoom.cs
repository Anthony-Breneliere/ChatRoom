using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Chat.Model.Timestamps;

namespace Chat.Model.Messaging;

/// <summary>
/// Represents a company-to-company chat room in the messaging section of the application.
/// </summary>
public sealed class ChatRoom : ICreateTimestamp
{
    /// <summary>
    /// ID of the chat room
    /// </summary>
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; init; }

    /// <summary>
    /// The name of the room
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Companies in the chat room
    /// </summary>
    public List<User> Participants { get; set; } = [];

    /// <summary>
    /// Messages in the chat room
    /// </summary>
    public List<ChatMessage> Messages { get; set; } = [];

    /// <inheritdoc />
    public DateTimeOffset CreatedAt { get; set; }
    
    /// <summary>
    /// Whether the chat room is read-only.
    /// </summary>
    /// <remarks>
    /// This is used to lock chat rooms for system messages, or to prevent users from sending messages.
    /// </remarks>
    public bool ReadOnly { get; set; }
}