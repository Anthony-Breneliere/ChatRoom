using Chat.Model;
using Chat.Model.Messaging;

namespace Chat.Business.Persistance;


/// <summary>
/// Manages the persistance of company messaging.
/// </summary>
public interface IMessagingPersistance
{
    /// <summary>
    /// Gets messages from a room
    /// </summary>
    /// <returns>All messages of the room.</returns>
    Task<IEnumerable<ChatMessage>> GetMessages( Guid roomId, CancellationToken ct = default);
    
    /// <summary>
    /// Gets all chat rooms.
    /// </summary>
    /// <returns>All chat rooms.</returns>
    Task<IEnumerable<ChatRoom>> GetRooms();
    
    /// <summary>
    /// Gets all messages in a chat room.
    /// </summary>
    /// <param name="roomId">ID of the chat room.</param>
    /// <returns>All messages in the chat room.</returns>
    IEnumerable<ChatMessage> GetMessagesInRoom(Guid roomId);

    /// <summary>
    /// Submits a new chat message.
    /// </summary>
    /// <param name="message">Message to submit.</param>
    /// <param name="ct">Cancellation token.</param>
    Task SubmitMessageAsync(ChatMessage message, CancellationToken ct = default);

    /// <summary>
    /// Delete a chatroom
    /// </summary>
    /// <param name="id">Chatroom to delete</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns></returns>
    Task<ChatRoom?> DeleteChatroomAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Delete a message
    /// </summary>
    /// <param name="id"></param>
    /// <param name="ct"></param>
    /// <returns></returns>
    Task<ChatMessage?> DeleteMessageAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Update the content of a message
    /// </summary>
    /// <param name="id">Id of message</param>
    /// <param name="content">new content of the message</param>
    /// <param name="ct">CancellationToken</param>
    /// <returns></returns>
    Task<ChatMessage?> EditedMessageAsync(Guid id, string content, CancellationToken ct = default);

    /// <summary>
    /// Creates a new chat room.
    /// </summary>
    /// <param name="room">Room to create.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <exception cref="ArgumentException">Thrown when the participants are invalid.</exception>
    Task<Model.Messaging.ChatRoom> CreateRoomAsync(Model.Messaging.ChatRoom room, CancellationToken ct = default);

    /// <summary>
    /// Gets a specific chat room.
    /// </summary>
    /// <param name="roomId">ID of the chat room.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The chat room.</returns>
    Task<Model.Messaging.ChatRoom?> GetChatRoomAsync(Guid roomId, CancellationToken ct = default);

    /// <summary>
    /// Gets all chat room.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns></returns>
    Task<ChatRoom[]> GetChatRoomsAsync(CancellationToken ct);

    /// <summary>
    /// Gets a specific chat message.
    /// </summary>
    /// <param name="id">ID of the chat message.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The chat message.</returns>
    Task<ChatMessage?> GetMessageAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Add a participant of the chatroom
    /// </summary>
    /// <param name="roomId">id of the chatroom</param>
    /// <param name="user">user to add</param>
    /// <returns></returns>
    Task SetParticipantAsync(Guid roomId, User user);

    /// <summary>
    /// Remove a participant of the chatroom
    /// </summary>
    /// <param name="roomId">id of the chatroom</param>
    /// <param name="user">user to remove</param>
    /// <returns></returns>
    Task RemoveParticipantAsync(Guid roomId, User user);

    /// <summary>
    /// Get a user
    /// </summary>
    /// <param name="userId">This id of the user to get</param>
    /// <returns>The user or null</returns>
    Task<User?> GetUserAsync(Guid userId);
}