using System.Security.Authentication;
using Mapster;
using MapsterMapper;
using Chat.Api.Infrastructure.Authentication;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ChatRoomDto> GetAllChatRoom(Guid roomId)
    {
        Model.Messaging.ChatRoom room = await _messagingService.GetChatRoom(roomId)
                                        ?? throw new ArgumentException("Offer not found");

        return _mapper.Map<ChatRoomDto>(room);
    }

    /// <summary>
    /// Gets the chat room from an offer.
    /// </summary>
    public async Task<ChatRoomDto> CreateChatRoom(string chatName)
    {
        Model.Messaging.ChatRoom room = await _messagingService.CreateChatRoom(NameIdentifier, chatName)
                                        ?? throw new ArgumentException("Offer not created");

        return _mapper.Map<ChatRoomDto>(room);
    }
    
    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId)
    {
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

        var messages = _messagingService.GetMessagesInRoom(roomId);

        await _messagingService.UserJoinRoom(roomId, NameIdentifier);

        return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
    }

    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId)
    {
        
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());

        await _messagingService.UserLeftRoom(roomId, NameIdentifier);
    }

    /// <inheritdoc />
    public async Task UserIsTyping(Guid roomId)
    {
        await _messagingService.UserIsTypingAsync(roomId, Context.ConnectionId, NameIdentifier);
    }

    /// <inheritdoc />
    public async Task SendMessage(string roomId, string message)
    {
        await _messagingService.SubmitMessageAsync(roomId, message, NameIdentifier);
    }

    /// <inheritdoc/>
    public async Task<ChatRoomDto[]> GetAllChatRooms()
    {
        List<Model.Messaging.ChatRoom> chatRooms = await _messagingService.GetRooms().ToListAsync();
        return _mapper.Map<ChatRoomDto[]>(chatRooms);
    }
}