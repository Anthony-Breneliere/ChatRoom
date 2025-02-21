using System.Text.Json;
using System.Text.Json.Serialization;
using Chat.Business.Persistance;
using Chat.Model;
using Chat.Model.Messaging;
using Microsoft.Extensions.Logging;

namespace Chat.Business.Messaging;

/// <summary>
/// Provides functionality for sending messages between companies.
/// </summary>
public sealed class MessagingService
{
    private readonly IMessagingPersistance _messagingPersistance;
    private readonly IMessagingNotificationHandler _notificationHandler;
    private readonly IUserPersistance _userPersistance;
    private readonly ILogger<MessagingService> Logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MessagingService"/> class.
    /// </summary>
    public MessagingService(IMessagingPersistance messagingPersistance,
        IMessagingNotificationHandler notificationHandler,
        IUserPersistance userPersistance,
        ILogger<MessagingService> logger)
    {
        _messagingPersistance = messagingPersistance;
        _notificationHandler = notificationHandler;
        _userPersistance = userPersistance;
        Logger = logger;
    }

    /// <summary>
    /// Gets all messages.
    /// </summary>
    /// <returns>All messages.</returns>
    public async Task<IEnumerable<ChatMessage>> GetMessagesAsync(Guid roomId, CancellationToken ct) =>
        await _messagingPersistance.GetMessages(roomId, ct);

    /// <summary>
    /// Gets all chat rooms.
    /// </summary>
    /// <returns>All chat rooms.</returns>
    public IQueryable<Model.Messaging.ChatRoom> GetRooms() => _messagingPersistance.GetRooms();

    /// <summary>
    /// Gets all messages in a chat room.
    /// </summary>
    /// <param name="roomId">ID of the chat room.</param>
    /// <returns>All messages in the chat room.</returns>
    public IEnumerable<ChatMessage> GetMessagesInRoom(Guid roomId) =>
        _messagingPersistance.GetMessagesInRoom(roomId);

    /// <summary>
    /// Submits a new chat message.
    /// </summary>
    public async Task SubmitMessageAsync(string roomId, string message, string nameIdentifier, CancellationToken ct = default)
    {
        Model.Messaging.ChatRoom chatRoom = await _messagingPersistance.GetChatRoomAsync(Guid.Parse(roomId), ct)
                                            ?? throw new ArgumentException($"Room {roomId} not found");

        User user = await GetUserFromNameIdentifier(nameIdentifier);

        ChatMessage chatMessage = new ChatMessage()
        {
            Content = message,
            CreatedAt = DateTime.UtcNow,
            AuthorId = user.Id,
            Author = user,
            Room = chatRoom,
            RoomId = chatRoom.Id
        };

        Logger.LogDebug("Received a chat message: {chatMessage}", JsonSerializer.Serialize(chatMessage, new JsonSerializerOptions { WriteIndented = true, ReferenceHandler = ReferenceHandler.Preserve }));

        await _messagingPersistance.SubmitMessageAsync(chatMessage, ct);

        await _notificationHandler.NotifyNewMessageAsync(chatMessage);
    }

    /// <summary>
    ///  Get user from name identifier.
    /// </summary>
    public async Task<User> GetUserFromNameIdentifier(string nameIdentifier)
    {
        User user = await _userPersistance.GetUserByUsernameAsync(nameIdentifier)
                    ?? throw new ArgumentException($"User {nameIdentifier} not found");
        return user;
    }

    /// <summary>
    /// create chat room for an offer.
    /// </summary>
    /// <returns>The chat room.</returns>
    public async Task<ChatRoom?> GetChatRoom(Guid roomId,
        CancellationToken ct = default)
    {
        ChatRoom? chatRoom = await _messagingPersistance.GetChatRoomAsync(roomId, ct);

        return chatRoom;
    }

    /// <summary>
    /// create chat room for an offer.
    /// </summary>
    /// <returns>The chat room.</returns>
    public async Task<Model.Messaging.ChatRoom?> CreateChatRoom(string chatRoomName, string nameIdentifier, 
        CancellationToken ct = default)
    {
        User user = await GetUserFromNameIdentifier(nameIdentifier);
        HashSet<User> participants = [user];

        ChatRoom chatRoom = new Model.Messaging.ChatRoom
        {
            Name = chatRoomName,
            Participants = participants.ToList()
        };

        var newChatRoom = await _messagingPersistance.CreateRoomAsync(chatRoom, ct);

        await _notificationHandler.NotifyNewChatRoomAsync(chatRoom);

        return newChatRoom;
    }

    /// <summary>
    /// Gets a specific chat room.
    /// </summary>
    /// <returns>The chat room.</returns>
    public async Task<Model.Messaging.ChatRoom?> GetChatRoomAsync(Guid roomId, CancellationToken ct = default)
        => await _messagingPersistance.GetChatRoomAsync(roomId, ct);

    /// <summary>
    /// Gets a specific chat message.
    /// </summary>
    /// <param name="id">ID of the chat message.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The chat message.</returns>
    public async Task<ChatMessage?> GetMessageAsync(Guid id, CancellationToken ct = default) =>
        await _messagingPersistance.GetMessageAsync(id, ct);

    /// <summary>
    /// Get all chat rooms.
    /// </summary>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>All chat rooms.</returns>
    public async Task<IEnumerable<Model.Messaging.ChatRoom>> GetChatRooms(CancellationToken ct = default) =>
        await _messagingPersistance.GetChatRooms(ct);

    /// <summary>
    /// Edits an existing chat message.
    /// </summary>
    /// <param name="messageId">ID of the message to edit</param>
    /// <param name="newContent">New content for the message</param>
    /// <param name="nameIdentifier">User identifier of the editor</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The edited message</returns>
    /// <exception cref="ArgumentException">Thrown when message not found or user not authorized</exception>
    public async Task<ChatMessage> EditMessageAsync(Guid messageId, string newContent, string nameIdentifier, CancellationToken ct = default)
    {
        var message = await _messagingPersistance.GetMessageAsync(messageId, ct) 
            ?? throw new ArgumentException($"Message {messageId} not found");
            
        var user = await GetUserFromNameIdentifier(nameIdentifier);
        
        if (message.AuthorId != user.Id)
        {
            throw new ArgumentException("Not authorized to edit this message");
        }

        message.Content = newContent;
        message.UpdatedAt = DateTime.UtcNow;
        await _messagingPersistance.EditMessageAsync(message, ct);
        
        await _notificationHandler.NotifyEditedMessageAsync(message);
        
        return message;
    }

    /// <summary>
    /// Join chat room.
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="nameIdentifier">The user name identifier</param>
    /// /// <param name="ct">Cancellation token</param>
    public async Task JoinChatRoomAsync(Guid roomId, string nameIdentifier, CancellationToken ct = default)
    {
        var room = await _messagingPersistance.GetChatRoomAsync(roomId, ct) 
            ?? throw new KeyNotFoundException("Chatroom not found.");

        User user = await GetUserFromNameIdentifier(nameIdentifier);

        if (!room.Participants.Any(p => p.Id == user.Id))
        {
            room.Participants.Add(user);
            await _messagingPersistance.UpdateChatRoomAsync(room, ct);
        }

        await _notificationHandler.NotifyUserJoinedAsync(roomId, user);
    }

    /// <summary>
    /// Leave chat room.
    /// </summary>
    /// <param name="roomId">The chat room ID</param>
    /// <param name="nameIdentifier">The user name identifier</param>
    public async Task LeaveChatRoomAsync(Guid roomId, string nameIdentifier)
    {
        if (await _messagingPersistance.GetChatRoomAsync(roomId, CancellationToken.None) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        User user = await GetUserFromNameIdentifier(nameIdentifier);

        if (room.Participants.Any(p => p.Id == user.Id))
        {
            room.Participants.RemoveAll(p => p.Id == user.Id);
            await _messagingPersistance.UpdateChatRoomAsync(room);
        }

        await _notificationHandler.NotifyUserLeftAsync(roomId, user);
    }
}