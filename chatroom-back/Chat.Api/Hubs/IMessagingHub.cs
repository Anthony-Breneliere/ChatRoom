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
    /// Pushes a new chat room
    /// </summary>
    /// <param name="chatRoom">the created chat room</param>
    public Task NewChatRoomCreated(ChatRoomDto chatRoom);

    /// <summary>
    /// Pushes the id of the deleted chat room to the client
    /// </summary>
    /// <param name="roomId">the id of the deleted chat room</param>
    public Task DeletedChatRoom(Guid roomId);

    /// <summary>
    /// Pushes >the chat room updated with the new participant
    /// </summary>
    /// <param name="chatRoom">the chat room updated with the new participant</param>
    public Task NewJoiner(ChatRoomDto chatRoom);

    /// <summary>
    /// Pushes the chat room updated without the leaver
    /// </summary>
    /// <param name="chatRoom">the chat room updated without the leaver</param>
    public Task NewLeaver(ChatRoomDto chatRoom);

    /// <summary>
    /// Pushes the writting user
    /// </summary>
    /// <param name="user">the writting user</param>
    /// <param name="roomId">room id</param>
    public Task UserWriting(string roomId, UserDto user);
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
    Task CreateChatRoom(string chatRoomName);
}