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
    /// <param name="chatRoomid">The chatRoom id.</param>
    /// <param name="user">User who joined the room</param>
    public Task UserJoinChatRoom(string chatRoomid, UserDto user);

    /// <summary>
    /// Pushes that user leave to the client.
    /// </summary>
    /// <param name="chatRoomId">The chatRoom Id.</param>
    /// <param name="user">User</param>
    public Task UserLeaveChatRoom(string chatRoomId, UserDto user);

    /// <summary>
    /// Pushes that user leave to the client.
    /// </summary>
    /// <param name="chatRoomId">The chatRoom Id.</param>
    /// <param name="user">User</param>
    public Task UserIsTyping(string chatRoomId, UserDto user);
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
    /// <param name="roomId">Room Id</param>
    public Task LeaveChatRoom(Guid roomId);

    /// <summary>
    ///  User is typing
    /// </summary>
    /// <param name="roomId">Room Id</param>
    public Task UserIsTyping(Guid roomId);

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