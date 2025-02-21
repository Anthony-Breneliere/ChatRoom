using Chat.ApiModel.Messaging;
using ChatRoom.ApiModel;

namespace Chat.Api.Hubs;

/// <summary>
/// Company messaging related methods pushed by the hub (server-to-client).  
/// </summary>
public interface IMessagingHubPush
{
    /// <summary>
    /// Pushes a new chat room to the client.
    /// </summary>
    /// <param name="room">The room to push.</param>
    public Task NewChatRoom(ChatRoomDto room);

    /// <summary>
    /// Pushes a join/leave chat room participant to the client.
    /// </summary>
    /// <param name="room"></param>
    /// <returns></returns>
    public Task UpdateChatRoomParticipant(ChatRoomDto room);
    
    /// <summary>
    /// Pushes that someone write in the chat room to the client.
    /// </summary>
    /// <param name="room"></param>
    /// <param name="user"></param>
    /// <returns></returns>
    public Task SomeoneWriteInChatRoom(ChatRoomDto room, UserDto user);

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
}

/// <summary>
/// Company messaging related methods invoked by the client (client-to-server).
/// </summary>
public interface IMessagingHubInvoke
{
    /// <summary>
    /// Join a chat room to receive new messages.
    /// </summary>
    /// <param name="roomId">The ID of the chatroom.</param>
    /// <param name="creatorId">The ID of the new participant.</param>
    public Task JoinChatRoom(Guid roomId, string creatorId);

    /// <summary>
    /// Leave the chat room.
    /// </summary>
    /// <param name="roomId">The ID of the chatroom.</param>
    /// <param name="creatorId">The ID of the participant who leave.</param>
    public Task LeaveChatRoom(Guid roomId, string creatorId);
    
    /// <summary>
    /// Submits a new message to the chatroom.
    /// </summary>
    public Task SendMessage(string roomId, string creatorId, string message);

    /// <summary>
    /// Get Chat rooom
    /// </summary>
    Task<ChatRoomDto> GetChatRoom(Guid roomId);

    /// <summary>
    /// Create chat room
    /// </summary>
    Task<ChatRoomDto> CreateChatRoom(string chatRoomName, string creatorIdentifier);
}