using ChatRoom.ApiModel;

namespace Chat.ApiModel.Messaging;

/// <summary>
/// Represents a company-to-company chat room in the messaging section of the application.
/// </summary>
public sealed class ChatRoomDto
{
    /// <summary>
    /// ID of the chat room
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Companies in the chat room
    /// </summary>
    public UserDto[] Participants { get; set; } = [];

    /// <summary>
    /// Messages in the chat room
    /// </summary>
    public ChatMessageDto[] Messages { get; set; } = [];

    /// <summary>
    /// Date and time the chat room was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Whether the chat room is read-only.
    /// </summary>
    /// <remarks>
    /// This is used to lock chat rooms for system messages, or to prevent users from sending messages.
    /// </remarks>
    public bool ReadOnly { get; set; }

    /// <summary>
    /// Whether the chat room is read-only.
    /// </summary>
    public string Name { get; set; } = "";
}
