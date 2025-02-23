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
    /// Notifies the client that a user is typing.
    /// </summary>
    /// <param name="roomId">The ID of the chat room.</param>
    /// <param name="userId">The ID of the user who is typing.</param>
    /// <param name="userName">The name of the user who is typing.</param>
    public Task NotifyUserTypingAsync(Guid roomId, Guid userId, string userName);
}