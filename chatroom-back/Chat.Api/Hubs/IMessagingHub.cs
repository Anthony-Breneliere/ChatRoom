using Chat.ApiModel.Messaging;

namespace Chat.Api.Hubs;

/// <summary>
/// Company messaging related methods pushed by the hub (server-to-client).  
/// </summary>
public interface IMessagingHubPush
{
    /// <summary>
    /// Pushes a new message to the client.
    /// </summary>
    /// <param name="message">The message to push.</param>
    public Task NewMessage(ChatMessageDto message);

    /// <summary>
    /// Pushes an edited message to the client.
    /// </summary>
    /// <param name="message">The edited message to push.</param>
    public Task EditedMessage(ChatMessageDto message);

    /// <summary>
    /// Pushes a deleted message to the client.
    /// </summary>
    /// <param name="id">The ID of the deleted message.</param>
    public Task DeletedMessage(Guid id);

    /// <summary>
    /// Notifies the client that a user is typing.
    /// </summary>
    /// <param name="roomId">The ID of the chat room.</param>
    /// <param name="userId">The ID of the user who is typing.</param>
    /// <param name="userName">The name of the user who is typing.</param>
    public Task NotifyUserTypingAsync(Guid roomId, Guid userId, string userName);

    /// <summary>
    /// Notify all clients that a new chat room has been created.
    /// </summary>
    public Task NewChatRoomCreated(ChatRoomDto chatRoom);

    /// <summary>
    /// Notifier les participants qui rejoignent
    /// </summary>
    public Task ParticipantJoined(string userId);

    /// <summary>
    /// Notifier les participants qui quittent
    /// </summary>
    public Task ParticipantLeft(string userId);

}

/// <summary>
/// Company messaging related methods invoked by the client (client-to-server).
/// </summary>
public interface IMessagingHubInvoke
{

    /// <summary>
    /// Create chat room
    /// </summary>
    Task<ChatRoomDto> CreateChatRoom(string Name);

    /// <summary>
    /// Get all chat rooms
    /// </summary>
    Task<IEnumerable<ChatRoomDto>> GetChatRooms();



    /// <summary>
    /// Join a chat room to receive new messages, and get the chat history.
    /// </summary>
    /// <param name="roomId">The ID of the chatroom.</param>
    /// <returns>The chat history</returns>
    public Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId);

    /// <summary>
    /// Leave the chat room
    /// </summary>
    /// <param name="roomId"></param>
    public Task LeaveChatRoom(Guid roomId);

    /// <summary>
    /// Submits a new message to the chatroom.
    /// </summary>
    public Task SendMessage(string roomId, string message);

    /// <summary>
    /// Get Chat rooom
    /// </summary>
    Task<ChatRoomDto> GetChatRoom(Guid roomId);

}