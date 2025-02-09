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
    /// Notifies the client of a new chat room.
    /// </summary>
    /// <param name="chatRoom">The new chat room</param>
    public Task NotifyNewChatRoomCreatedAsync(Chat.Model.Messaging.ChatRoom chatRoom);

    /// <summary>
    /// Notifies the client of a deleted chat room.
    /// </summary>
    /// <param name="roomId">The id of deleted chat room</param>
    public Task NotifyChatRoomDeletedAsync(Guid roomId);

    /// <summary>
    /// Notifies the client of a new participant in chatroom.
    /// </summary>
    /// <param name="chatRoom">the chat room with the new participant</param>
    public Task NotifyNewJoinerAsync(ChatRoom chatRoom);
}