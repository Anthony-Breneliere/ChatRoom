using System.Security.Authentication;
using Mapster;
using MapsterMapper;
using Chat.Api.Infrastructure.Authentication;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Chat.Model;

namespace Chat.Api.Hubs;

// TODO: Implement error handling via filters

/// <summary>
/// Represents the company messaging hub.
/// </summary>
[Authorize]
public sealed class MessagingHub : Hub<IMessagingHubPush>, IMessagingHubInvoke
{
    /// route to the hub
    public static string HubPath => "api/hub/messaging";

    private readonly MessagingService _messagingService;
    private readonly IMessagingNotificationHandler _notificationHandler;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of the <see cref="MessagingHub"/> class.
    /// </summary>
    public MessagingHub(MessagingService messagingService, IMapper mapper, IMessagingNotificationHandler notificationHandler)
    {
        _messagingService = messagingService;
        _notificationHandler = notificationHandler;
        _mapper = mapper;
    }

    private string NameIdentifier => Context.User?.GetNameIdentifier() 
        ?? throw new AuthenticationException("User nameidentifier not found in Claims.");
    
    /// <summary>
    /// Gets the chat room from an offer.
    /// </summary>
    public async Task<ChatRoomDto> GetChatRoom(Guid roomId)
    {
        Model.Messaging.ChatRoom room = await _messagingService.GetChatRoom(roomId)
                                        ?? throw new ArgumentException("Offer not found");

        return _mapper.Map<ChatRoomDto>(room);
    }

    /// <summary>
    /// Get all chat rooms.
    /// </summary>
    public async Task<ChatRoomDto[]> GetAllChatRooms()
    {
        var rooms = await _messagingService.GetAllChatRoomAsync();
        return _mapper.Map<ChatRoomDto[]>(rooms);
    }
    
    /// <summary>
    /// Gets the chat room from an offer.
    /// </summary>
    public async Task<ChatRoomDto> CreateChatRoom()
    {
        Model.Messaging.ChatRoom room = await _messagingService.CreateChatRoom(NameIdentifier)
                                        ?? throw new ArgumentException("Offer not created");

        return _mapper.Map<ChatRoomDto>(room);
    }
    
    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId)
    {
        Console.WriteLine($"User {NameIdentifier} is joining chat room {roomId}");
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        await _messagingService.AddUserToRoomAsync(roomId, user.Id, Context.ConnectionAborted);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

        var messages = await GetMessagesInRoom(roomId);
        await _notificationHandler.NotifyJoignedChatRoomAsync(roomId, user);

        return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
    }


    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId)
    {

        Console.WriteLine($"User {NameIdentifier} is leaving chat room {roomId}");
        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        await _messagingService.RemoveUserFromRoomAsync(roomId, user.Id, Context.ConnectionAborted);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());
        await _notificationHandler.NotifyLeavedChatRoomAsync(roomId, user);
    }

    /// <inheritdoc />
    public async Task SendMessage(string roomId, string message)
    {
        await _messagingService.SubmitMessageAsync(roomId, message, NameIdentifier);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> GetMessagesInRoom(Guid roomId)
    {
        var newMessages = new List<ChatMessageDto>();
        var messages = await _messagingService.GetMessagesAsync(roomId, Context.ConnectionAborted);
        foreach (var message in messages)
        {
            var newMessage = new ChatMessageDto
            {
                Id = message.Id,
                Content = message.Content,
                CreatedAt = message.CreatedAt,
                AuthorFullName = message.Author.FirstName ?? "Unknown User",
                AuthorId = message.AuthorId,
                RoomId = message.RoomId
            };
            newMessages.Add(newMessage);
        }
        return newMessages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
        
    }

    /// <summary>
    /// Ajouter l'utilisateur à tous les groupes
    /// </summary>
    /// <param name="rooms"></param>
    /// <returns></returns>
    public async Task SubscribeAllChatRooms(ChatRoomDto[] rooms)
    { 
        // Ajouter l'utilisateur à chaque room (group SignalR)
        foreach (var room in rooms){
            await Groups.AddToGroupAsync(Context.ConnectionId, room.Id.ToString());
        }
    }

    /// <summary>
    /// Levée d'évènement si un utilisateur écrit
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="user"></param>
    /// <returns></returns>
    public async Task userIsTyping(Guid roomId, User user)
    { 
        await _notificationHandler.NotifyUserTypingAsync(roomId, user);
    }
}