using Chat.Model.Messaging;

namespace Chat.Business.Messaging;

using Chat.Model;

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
    /// Notifies the client of a new chat room.
    /// </summary>
    /// <param name="room">The new chat room.</param>
    public Task NotifyNewChatRoomAsync(ChatRoom room);

    /// <summary>
    /// Notifies the client of a user joining a chat room.
    /// </summary>
    /// <param name="room">The chat room.</param>
    public Task NotifyUserJoinedRoomAsync(ChatRoom room);

    /// <summary>
    /// Notifies the client of a user leaving a chat room.
    /// </summary>
    /// <param name="room">The chat room.</param>
    /// <param name="user">The user who left.</param>
    public Task NotifyUserLeftRoomAsync(ChatRoom room, User user);

    /// <summary>
    /// Notifies the client of a user changed their name.
    /// </summary>
    /// <param name="user">The user who changed their name.</param>
    public Task NotifyUserChangedNameAsync(User user);
}