using Chat.ApiModel.Messaging;
using ChatRoom.ApiModel;

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
    /// Notifies clients that a new chat room was created
    /// </summary>
    /// <param name="room">The newly created chat room</param>
    Task NewChatRoom(ChatRoomDto room);

    /// <summary>
    /// Notifies clients that a user joined the chat room
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="user">The user who joined</param>
    Task UserJoined(Guid roomId, UserDto user);

    /// <summary>
    /// Notifies clients that a user left the chat room
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="user">The user who left</param>
    Task UserLeft(Guid roomId, UserDto user);

    /// <summary>
    /// Notifies clients that a user is typing
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="user">The user who is typing</param>
    Task UserTyping(Guid roomId, UserDto user);

    /// <summary>
    /// Notifies clients that a user stopped typing
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="user">The user who stopped typing</param>
    Task UserStoppedTyping(Guid roomId, UserDto user);
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
    /// Get Chat rooom
    /// </summary>
    Task<ChatRoomDto> GetChatRoom(Guid roomId);

    /// <summary>
    /// Create chat room
    /// </summary>
    Task<ChatRoomDto> CreateChatRoom(string name);

    /// <summary>
    /// Get Chat rooms
    /// </summary>
    Task<IEnumerable<ChatRoomDto>> GetChatRooms();

    /// <summary>
    /// Edit message
    /// </summary>
    Task EditMessage(string roomId, Guid messageId, string message);
}