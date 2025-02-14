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
    /// Pushes a newly created chatroom to the clients.
    /// </summary>
    /// <param name="chatRoom">The new chatroom.</param>
    public Task NewChatRoom(ChatRoomDto chatRoom);

    /// <summary>
    /// Pushes a user who had joigned a room to the clients.
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="user"></param>
    public Task JoignedChatRoom(Guid roomId, UserDto user);

    /// <summary>
    /// Pushes a user who had left a room to the clients.
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="user"></param>
    public Task LeavedChatRoom(Guid roomId, UserDto user);

    /// <summary>
    /// Pushes a user who is typing to the clients.
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="user"></param>
    public Task UserIsTyping(Guid roomId, UserDto user);

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
    Task<ChatRoomDto> CreateChatRoom();

    /// <summary>
    /// Get all messages in a chat room.
    /// </summary>
    public Task<IEnumerable<ChatMessageDto>> GetMessagesInRoom(Guid roomId);
}