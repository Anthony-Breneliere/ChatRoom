using Chat.ApiModel.Messaging;
using ChatRoom.ApiModel;
using System.Globalization;

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
    /// Pushes a new chatRoom to the client.
    /// </summary>
    /// <param name="chatRoom">The chatRoom.</param>
    public Task NewChatRoom(ChatRoomDto chatRoom);

    /// <summary>
    /// Pushes a new user to the client.
    /// </summary>
    /// <param name="chatRoom">The chatRoom.</param>
    /// <remarks>J'aurai pu passer que l'utilisateur pour plus d'efficatité ?</remarks>

    public Task UserJoinChatRoom(ChatRoomDto chatRoom);

    /// <summary>
    /// Pushes that user leave to the client.
    /// </summary>
    /// <param name="chatRoom">The chatRoom.</param>
    /// <remarks>J'aurai pu passer que l'utilisateur pour plus d'efficatité ?</remarks>
    public Task UserLeaveChatRoom(ChatRoomDto chatRoom);
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
    /// Get All ChatRooms
    /// </summary>
    /// <returns></returns>
    Task<ChatRoomDto[]> GetAllChatRooms();
}