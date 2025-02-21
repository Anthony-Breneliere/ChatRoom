using Chat.Model;
using Chat.Model.Messaging;

namespace Chat.Business.Messaging;

/// <summary>
/// Specifies the notification mechanisms for company messaging.
/// </summary>
public interface IMessagingNotificationHandler
{
    /// <summary>
    /// Notifies the client of a new chat room.
    /// </summary>
    /// <param name="room"></param>
    /// <returns></returns>
    public Task NotifyNewChatRoomAsync(Model.Messaging.ChatRoom room);

    /// <summary>
    /// Notifies the client of a join/leave chat room participant.
    /// </summary>
    /// <param name="room"></param>
    /// <returns></returns>
    public Task NotifyUpdateChatRoomParticipantAsync(Model.Messaging.ChatRoom room);

    /// <summary>
    /// Notifies the client that that someone write in the chat room.
    /// </summary>
    /// <param name="room"></param>
    /// <param name="user"></param>
    /// <returns></returns>
    public Task NotifySomeoneWriteInChatRoomAsync(ChatRoom room, User user);
    
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
}