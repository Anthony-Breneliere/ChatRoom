using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
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
    public async Task<IEnumerable<Model.Messaging.ChatRoom>> GetRooms() => await _messagingPersistance.GetRooms();

    /// <summary>
    /// Gets all messages in a chat room.
    /// </summary>
    /// <param name="roomId">ID of the chat room.</param>
    /// <returns>All messages in the chat room.</returns>
    public IEnumerable<ChatMessage> GetMessagesInRoom(Guid roomId){
        return _messagingPersistance.GetMessagesInRoom(roomId);
    }

    /// <summary>
    /// Remove the user who is living from the participants and notify
    /// </summary>
    /// <param name="roomId">id of the chatroom</param>
    /// <param name="userId">id of the user</param>
    /// <returns></returns>
    public async Task LeaveChatRoom(string roomId, Guid userId){

        var user = await _messagingPersistance.GetUserAsync(userId);

        if(user is null)
            return;
        
        await _messagingPersistance.RemoveParticipantAsync(Guid.Parse(roomId), user);
        await _notificationHandler.NotifyLeaveChatRoomAsync(roomId, $"{user.FirstName} {user.LastName}", user.Id.ToString());
    }

    /// <summary>
    /// Add the user who is living from the participants and notify
    /// </summary>
    /// <param name="roomId">id of the chatroom</param>
    /// <param name="userId">id of the user</param>
    /// <returns></returns>
    public async Task EnterChatRoom(string roomId, Guid userId){

        var user = await _messagingPersistance.GetUserAsync(userId);

        if(user is null)
            return;

        await _messagingPersistance.SetParticipantAsync(Guid.Parse(roomId), user);
        await _notificationHandler.NotifyEnterChatRoomAsync(roomId, $"{user.FirstName} {user.LastName}", user.Id.ToString());
    }

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
    private async Task<User> GetUserFromNameIdentifier(string nameIdentifier)
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
        return await _messagingPersistance.GetChatRoomAsync(roomId, ct);
    }

    /// <summary>
    /// delete chat room.
    /// </summary>
    /// <returns>boolean</returns>
    public async Task<bool> DeleteChatroom(Guid chatroomId, CancellationToken ct = default)
    {
        var result = await _messagingPersistance.DeleteChatroomAsync(chatroomId, ct);
        if(result is null)
        {
            return false;
        }
        await _notificationHandler.NotifyDeleteChatroomAsync(result);
        return true;
    }

    /// <summary>
    /// delete a message from a chatroom.
    /// </summary>
    /// <param name="messageId">The id of the message to delete</param>
    /// <param name="ct">CancellationToken</param>
    /// <returns></returns>
    public async Task<bool> DeleteMessage(Guid messageId, CancellationToken ct = default)
    {
        var result = await _messagingPersistance.DeleteMessageAsync(messageId, ct);
        if(result is null)
        {
            return false;
        }
        await _notificationHandler.NotifyDeletedMessageAsync(result);
        return true;
    }

    /// <summary>
    /// edit chat message.
    /// </summary>
    /// <returns>boolean</returns>
    public async Task<bool> EditedMessage(Guid messageId, string content, CancellationToken ct = default)
    {
        var result = await _messagingPersistance.EditedMessageAsync(messageId, content, ct);
        if(result is null)
        {
            return false;
        }
        await _notificationHandler.NotifyEditedMessageAsync(result);
        return true;
    }

    /// <summary>
    /// Use to notify someone is writting
    /// </summary>
    /// <param name="fullname">The name of the person who are writting</param>
    /// <param name="roomId">The id of the room who the person is writting</param>
    /// <returns></returns>
    public async Task SomeoneIsWritting(string roomId, string fullname)
    {
        await _notificationHandler.NotifySomeoneIsWrittingAsync(roomId, fullname);
    }

    
    /// <summary>
    /// create chat room.
    /// </summary>
    /// <returns>The chat room.</returns>
    public async Task<Model.Messaging.ChatRoom?> CreateChatRoom( string nameIdentifier, string name, 
        CancellationToken ct = default)
    {
        User user = await GetUserFromNameIdentifier(nameIdentifier);

        // using a HashSet to avoid duplicates if userCompany is importer or exporter
        HashSet<User> participants = [user];
        
        ChatRoom chatRoom = new Model.Messaging.ChatRoom
        {
            Name = name,
            Participants = participants.ToList()
        };

        var chatroom = await _messagingPersistance.CreateRoomAsync(chatRoom, ct);

        await _notificationHandler.NotifyNewChatroomAsync(chatroom);

        return chatroom;
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
}