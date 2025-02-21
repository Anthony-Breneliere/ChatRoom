using System.Security.Authentication;
using Mapster;
using MapsterMapper;
using Chat.Api.Infrastructure.Authentication;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

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
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of the <see cref="MessagingHub"/> class.
    /// </summary>
    public MessagingHub(MessagingService messagingService, IMapper mapper)
    {
        _messagingService = messagingService;
        _mapper = mapper;
    }

    private string NameIdentifier => Context.User?.GetNameIdentifier() 
        ?? throw new AuthenticationException("User nameidentifier not found in Claims.");

    /// <summary>
    /// Gets all chat rooms.
    /// </summary>
    public async Task<ChatRoomDto[]> GetChatRooms()
    {
        Model.Messaging.ChatRoom[] rooms = await _messagingService.GetChatRooms()
                                        ?? throw new ArgumentException("Offer not found");      

        return _mapper.Map<ChatRoomDto[]>(rooms);
    }

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
    /// Gets the chat room from an offer.
    /// </summary>
    public async Task<ChatRoomDto> CreateChatRoom(string newRoomName)
    {
        Model.Messaging.ChatRoom room = await _messagingService.CreateChatRoom(NameIdentifier, newRoomName)
                                        ?? throw new ArgumentException("Offer not created");

        return _mapper.Map<ChatRoomDto>(room);
    }
    
    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId)
    {
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        await _messagingService.AddUserToRoomAsync(roomId, user.Id, Context.ConnectionAborted);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

        var messages = _messagingService.GetMessagesInRoom(roomId).ToList();
        var messageDtos = messages.Select(message => new ChatMessageDto
        {
            Id = message.Id,
            RoomId = message.RoomId,
            AuthorId = message.AuthorId,
            AuthorFullName = message.Author?.FirstName ?? "Unknown User",
            Content = message.Content,
            CreatedAt = message.CreatedAt,
        });

        return messageDtos;
    }

    /// <inheritdoc />
    public Dictionary<Guid, List<ChatMessageDto>> GetChatRoomsMessages(Guid[] roomIds)
    {
        var messagesMap = new Dictionary<Guid, List<ChatMessageDto>>();
        foreach (var roomId in roomIds)
        {
            var messages = _messagingService.GetMessagesInRoom(roomId).ToList();
            var messageDtos = messages.Select(message => new ChatMessageDto
            {
                Id = message.Id,
                RoomId = message.RoomId,
                AuthorId = message.AuthorId,
                AuthorFullName = message.Author?.FirstName ?? "Unknown User",
                Content = message.Content,
                CreatedAt = message.CreatedAt,
            }).ToList();

            messagesMap[roomId] = messageDtos;
        }    

        return messagesMap;
    }

    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId)
    {
        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        await _messagingService.RemoveUserFromRoomAsync(roomId, user.Id, Context.ConnectionAborted);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());
    }

    /// <inheritdoc />
    public async Task LeaveChatRooms()
    {
        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        var rooms = await _messagingService.GetRoomsForUser(user.Id);
        if (rooms is null)
            return;
        foreach (var room in rooms)
        {
            await _messagingService.RemoveUserFromRoomAsync(room.Id, user.Id, Context.ConnectionAborted);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.Id.ToString());
        }
    }
    
    /// <inheritdoc />
    public async Task SendMessage(string roomId, string message)
    {
       await _messagingService.SubmitMessageAsync(roomId, message, NameIdentifier);
    }

    /// <inheritdoc />
    public async Task ChangeUsername(string newUsername)
    {
        await _messagingService.ChangeUserName(NameIdentifier, newUsername);
    }

    /// <inheritdoc />
    public async Task UserIsWriting(string roomId)
    {
        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        await Clients.Group(roomId).UserIsWriting(user, roomId);
    }
}