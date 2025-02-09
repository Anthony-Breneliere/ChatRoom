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
    /// Pushes the created chatroom
    /// </summary>
    /// <param name="chatroom">The new chatroom</param>
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

    /// <summary>
    /// Pushes the fullname of the user who is writting
    /// </summary>
    /// <param name="roomId">Id of the chatroom</param>
    /// <param name="fullName">fullname of the user</param>
    /// <returns></returns>
    public Task SomeoneIsWritting(String roomId, String fullName);

    /// <summary>
    /// Pushes informations of the user who is leaving the chatroom
    /// </summary>
    /// <param name="roomId">Id of the chatroom</param>
    /// <param name="fullName">fullname of the user</param>
    /// <param name="userId">id of the user</param>
    /// <returns></returns>
    public Task LeaveChatRoom(string roomId, string fullName, string userId);

    /// <summary>
    /// Pushes informations of the user who is enterring the chatroom
    /// </summary>
    /// <param name="roomId">Id of the chatroom</param>
    /// <param name="fullName">fullname of the user</param>
    /// <param name="userId">id of the user</param>
    /// <returns></returns>
    public Task EnterChatRoom(string roomId, string fullName, string userId);


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
    /// <param name="userId">The id of the user who is entering</param>
    /// <returns>The chat history</returns>
    public Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId, Guid userId);

    /// <summary>
    /// Use when a user leave a chatroom
    /// </summary>
    /// <param name="roomId">The id of the chatroom</param>
    /// <param name="userId">The id of the user who is leaving</param>
    public Task LeaveChatRoom(Guid roomId, Guid userId);
    
    /// <summary>
    /// Submits a new message to the chatroom.
    /// </summary>
    public Task SendMessage(string roomId, string message);

    /// <summary>
    /// Get Chat rooom
    /// </summary>
    Task<ChatRoomDto> GetChatRoom(Guid roomId);

    /// <summary>
    /// Used to notify other persons of chatroom than someone is writting
    /// </summary>
    /// <param name="userFullname">The name of the person who is writting</param>
    /// <param name="roomId">The id of the chatroom</param>
    /// <returns></returns>
    Task SomeoneIsWritting(string roomId, string userFullname);

    /// <summary>
    /// Delete a chatroom
    /// </summary>
    /// <param name="roomId">The id of the chatroom to delete</param>
    /// <returns></returns>
    Task DeleteChatroom(Guid roomId);

    /// <summary>
    /// Delete a chat message
    /// </summary>
    /// <param name="messageId"></param>
    /// <returns></returns>
    Task DeleteMessage(Guid messageId);

    /// <summary>
    /// Update a message with a new content
    /// </summary>
    /// <param name="messageId">The id of the message to update</param>
    /// <param name="newContent">The new content of the message</param>
    /// <returns></returns>
    Task EditedMessage(Guid messageId, string newContent);

    /// <summary>
    /// Create a new chatroom
    /// </summary>
    /// <param name="name">The name of the chatroom</param>
    /// <returns></returns>
    Task<ChatRoomDto> CreateChatRoom(string name);
}