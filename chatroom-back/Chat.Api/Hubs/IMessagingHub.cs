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
    /// 
    /// </summary>
    /// <param name="chatroom"></param>
    /// <returns></returns>
    public Task NewChatroom(ChatRoomDto chatroom);


    /// <summary>
    /// Pushes a deleted chatroom to the client
    /// </summary>
    /// <param name="chatroom">The ID of the deleted chatroom.</param>
    /// <returns></returns>
    public Task DeletedChatroom(ChatRoomDto chatroom);
    
    /// <summary>
    /// Pushes an edited message to the client.
    /// </summary>
    /// <param name="message">The edited message to push.</param>
    public Task EditedMessage(ChatMessageDto message);
    
    /// <summary>
    /// Pushes a deleted message to the client.
    /// </summary>
    /// <param name="id">The ID of the deleted message.</param>
    public Task DeletedMessage(ChatMessageDto id);
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
    /// Delete Chat rooom
    /// </summary>
    Task DeleteChatroom(Guid roomId);

    /// <summary>
    /// Delete a chat message
    /// </summary>
    /// <param name="messageId"></param>
    /// <returns></returns>
    Task DeleteMessage(Guid messageId);

    /// <summary>
    /// 
    /// </summary>
    /// <param name="messageId"></param>
    /// <param name="newContent"></param>
    /// <returns></returns>
    Task EditedMessage(Guid messageId, string newContent);

    /// <summary>
    /// Create chat room
    /// </summary>
    Task<ChatRoomDto> CreateChatRoom(string name);
}