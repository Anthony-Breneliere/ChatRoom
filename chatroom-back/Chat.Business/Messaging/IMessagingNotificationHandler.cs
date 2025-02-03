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
    /// Notifies the client of an new chatroom.
    /// </summary>
    /// <param name="chatroom"></param>
    /// <returns></returns>
    public Task NotifyNewChatroomAsync(ChatRoom chatroom);

    /// <summary>
    /// 
    /// </summary>
    /// <param name="chatroom"></param>
    /// <returns></returns>
    public Task NotifyDeleteChatroomAsync(ChatRoom chatroom);

    /// <summary>
    /// Notifies the client of a deleted message.
    /// </summary>
    /// <param name="message">The deleted message</param>
    public Task NotifyDeletedMessageAsync(ChatMessage message);
}