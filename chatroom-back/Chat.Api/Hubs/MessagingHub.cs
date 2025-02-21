using System.Security.Authentication;
using Mapster;
using MapsterMapper;
using Chat.Api.Infrastructure.Authentication;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Chat.Model.Messaging;

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
    /// Gets all chat room.
    /// </summary>
    public List<ChatRoomDto> ListChatRoom()
    {
        List<Model.Messaging.ChatRoom> room = _messagingService.GetRooms().ToList()
                                        ?? throw new ArgumentException("Offer not found");

        return _mapper.Map<List<ChatRoomDto>>(room);
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
    public async Task<ChatRoomDto> CreateChatRoom(string chatRoomName, string creatorIdentifier)
    {
        Model.Messaging.ChatRoom room = await _messagingService.CreateChatRoom(chatRoomName, creatorIdentifier)
                                        ?? throw new ArgumentException("Offer not created");

        return _mapper.Map<ChatRoomDto>(room);
    }

    /// <summary>
    /// Gets the chat room history.
    /// </summary>
    public IEnumerable<ChatMessageDto> GetChatRoomHistory(string chatRoomId)
    {
        var messages = _messagingService.GetMessagesInRoom(Guid.Parse(chatRoomId));

        return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
    }
    
    /// <inheritdoc />
    public async Task JoinChatRoom(Guid roomId, string creatorId)
    {
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

        await _messagingService.AddParticipant(room, creatorId);
    }

    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId, string creatorId)
    {
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        await _messagingService.RemoveParticipant(room, creatorId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());

    }

    /// <inheritdoc />
    public async Task SomeoneWriteInChatRoom(Guid roomId, string creatorId)
    {
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        await _messagingService.SomeoneWriteInChatRoom(room, creatorId);
    }

    /// <inheritdoc />
    public async Task SendMessage(string roomId, string creatorId, string message)
    {
        await _messagingService.SubmitMessageAsync(roomId, creatorId, message);
    }
}