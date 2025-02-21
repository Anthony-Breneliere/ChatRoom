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
    /// Pushes a new chat room to the client.
    /// </summary>
    /// <param name="room">The new chat room to push.</param>
    public Task NewChatRoom(ChatRoomDto room);

    /// <summary>
    /// Pushes a user joining a chat room to the client.
    /// </summary>
    /// <param name="room">The chat room to push.</param>
    public Task UserJoinedRoom(ChatRoomDto room);

    /// <summary>
    /// Pushes a user leaving a chat room to the client.
    /// </summary>
    /// <param name="room">The chat room to push.</param>
    /// <param name="username">The user who left.</param>
    public Task UserLeftRoom(ChatRoomDto room, string username);

    /// <summary>
    /// Pushes a user who changed their username to the client.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="username">The new username.</param>
    public Task UserChangedName(Guid userId, string username);

    /// <summary>
    /// Pushes a user who is writing a message to the client.
    /// </summary>
    /// <param name="user">The user.</param>
    /// <param name="roomId">The chat room ID.</param>
    public Task UserIsWriting(Chat.Model.User user, string roomId);
}

/// <summary>
/// Company messaging related methods invoked by the client (client-to-server).
/// </summary>
public interface IMessagingHubInvoke
{
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
    /// Gets all chat rooms.
    /// </summary>
    public Task<ChatRoomDto[]> GetChatRooms();

    /// <summary>
    /// Get Chat rooom
    /// </summary>
    Task<ChatRoomDto> GetChatRoom(Guid roomId);

    /// <summary>
    /// Create chat room
    /// </summary>
    Task<ChatRoomDto> CreateChatRoom(string newRoomName);
}