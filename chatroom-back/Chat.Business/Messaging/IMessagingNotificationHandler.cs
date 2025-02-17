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
    /// Notifies the client of a new chatRoom.
    /// </summary>
    /// <param name="chatRoom">The chat room.</param>
    public Task NotifyNewChatRoomAsync(ChatRoom chatRoom);


    /// <summary>
    /// Notifies the client of a new participant in a chatRoom.
    /// </summary>
    /// <remarks>J'aurai pu passer que l'utilisateur pour plus d'efficatité ?</remarks>
    public Task NotifyUserJoinChatRoomAsync(ChatRoom chatRoom);

    /// <summary>
    /// Notifies the client that user left the chatRoom.
    /// </summary>
    /// <remarks>J'aurai pu passer que l'utilisateur pour plus d'efficatité ?</remarks>
    public Task NotifyUserLeftChatRoomAsync(ChatRoom chatRoom);
}