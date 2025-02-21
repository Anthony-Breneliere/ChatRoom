using Chat.Model;
using Chat.Model.Messaging;

namespace Chat.Business.Messaging;

/// <summary>
/// Specifies the notification mechanisms for company messaging.
/// </summary>
public interface IMessagingNotificationHandler
{
    /// <summary>
    /// Notifies the client of a new message.
    /// </summary>
    /// <param name="message">The new message.</param>
    public Task NotifyNewMessageAsync(ChatMessage message);
    
    /// <summary>
    /// Notifies the client of an edited message.
    /// </summary>
    /// <param name="message">The edited message.</param>
    public Task NotifyEditedMessageAsync(ChatMessage message);

    /// <summary>
    /// Notifies the client of a deleted message.
    /// </summary>
    /// <param name="roomId">The ID of the chat room.</param>
    /// <param name="id">The ID of the deleted message.</param>
    public Task NotifyDeletedMessageAsync(long roomId, Guid id);

    /// <summary>
    /// Notifies clients that a new chat room was created
    /// </summary>
    /// <param name="room">The newly created chat room</param>
    Task NotifyNewChatRoomAsync(ChatRoom room);

    /// <summary>
    /// Notifies clients that a user joined the chat room
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="user">The user who joined</param>
    Task NotifyUserJoinedAsync(Guid roomId, User user);

    /// <summary>
    /// Notifies clients that a user left the chat room
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="user">The user who left</param>
    Task NotifyUserLeftAsync(Guid roomId, User user);
}