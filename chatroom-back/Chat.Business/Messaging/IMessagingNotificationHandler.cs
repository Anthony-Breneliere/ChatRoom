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
    /// <param name="user"></param>
    public Task NotifyNewMessageAsync(ChatMessage message, User user);
    
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
    /// Notifies the client of a created chatroom.
    /// </summary>
    /// <param name="chatRoom"></param>
    public Task NotifyCreatedChatRoomAsync(ChatRoom chatRoom);

    /// <summary>
    /// Notifies the client of a joigned chatroom.
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="user"></param>
    public Task NotifyJoignedChatRoomAsync(Guid roomId, User user);

    /// <summary>
    /// Notifies the client of a leaved chatroom.
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="user"></param>
    public Task NotifyLeavedChatRoomAsync(Guid roomId, User user);

    /// <summary>
    /// Notifies the client if a user is typing.
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="user"></param>
    public Task NotifyUserTypingAsync(Guid roomId, User user);
}
