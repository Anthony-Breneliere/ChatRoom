using System.Security.Authentication;
using Mapster;
using MapsterMapper;
using Chat.Api.Infrastructure.Authentication;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ChatRoom.ApiModel;

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
    public async Task<ChatRoomDto> CreateChatRoom(string name)
    {
        Model.Messaging.ChatRoom room = await _messagingService.CreateChatRoom(name, NameIdentifier)
                                        ?? throw new ArgumentException("Offer not created");

        return _mapper.Map<ChatRoomDto>(room);
    }
    
    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId)
    {
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());
        await _messagingService.JoinChatRoomAsync(roomId, NameIdentifier);

        var messages = _messagingService.GetMessagesInRoom(roomId);

        return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
    }

    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());
        await _messagingService.LeaveChatRoomAsync(roomId, NameIdentifier);
    }

    /// <inheritdoc />
    public async Task SendMessage(string roomId, string message)
    {
        await _messagingService.SubmitMessageAsync(roomId, message, NameIdentifier);
        await NotifyStoppedTyping(roomId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ChatRoomDto>> GetChatRooms()
    {
        var rooms = await _messagingService.GetChatRooms(Context.ConnectionAborted);

        return _mapper.Map<IEnumerable<ChatRoomDto>>(rooms);
    }

    /// <inheritdoc />
    public async Task EditMessage(string roomId, Guid messageId, string message)
    {
        await _messagingService.EditMessageAsync(messageId, message, NameIdentifier);
        await NotifyStoppedTyping(roomId);
    }

    /// <summary>
    /// Notifies that the user is typing
    /// </summary>
    public async Task NotifyTyping(string roomId)
    {
        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        var userDto = _mapper.Map<UserDto>(user);

        await Clients.Group(roomId).UserTyping(Guid.Parse(roomId), userDto);
    }

    /// <summary>
    /// Notifies that the user stopped typing
    /// </summary>
    public async Task NotifyStoppedTyping(string roomId)
    {
        var user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        var userDto = _mapper.Map<UserDto>(user);

        await Clients.Group(roomId).UserStoppedTyping(Guid.Parse(roomId), userDto);
    }
}