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
    /// <param name="chatroom">The new chatroom</param>
    /// <returns></returns>
    public Task NotifyNewChatroomAsync(ChatRoom chatroom);

    /// <summary>
    /// Notifies the client of a deleted chatroom
    /// </summary>
    /// <param name="chatroom">The deleted chatroom</param>
    /// <returns></returns>
    public Task NotifyDeleteChatroomAsync(ChatRoom chatroom);

    /// <summary>
    /// Notifies the client of a deleted message.
    /// </summary>
    /// <param name="message">The deleted message</param>
    public Task NotifyDeletedMessageAsync(ChatMessage message);

    /// <summary>
    /// Notify people on the chatroom when someone is writting
    /// </summary>
    /// <param name="roomId">The id of the chatroom</param>
    /// <param name="fullName">The fullname of the user who is writting</param>
    /// <returns></returns>
    Task NotifySomeoneIsWrittingAsync(string roomId, string fullName);

    /// <summary>
    /// Notify people on the chatroom when someone leave
    /// </summary>
    /// <param name="roomId">The id of the chatroom</param>
    /// <param name="fullName">The fullname of the user who is leaving the chatroom</param>
    /// <param name="userId">The user id of the user who is leaving the chatroom</param>
    /// <returns></returns>
    Task NotifyLeaveChatRoomAsync(string roomId, string fullName, string userId);

    /// <summary>
    /// Notify people on the chatroom when someone enter
    /// </summary>
    /// <param name="roomId">The id of the chatroom</param>
    /// <param name="fullName">The fullname of the user who is entering the chatroom</param>
    /// <param name="userId">The user id of the user who is entering the chatroom</param>
    /// <returns></returns>
    Task NotifyEnterChatRoomAsync(string roomId, string fullName, string userId);

}