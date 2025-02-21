using Chat.Api.Hubs;
using MapsterMapper;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Chat.Model.Messaging;
using Microsoft.AspNetCore.SignalR;
using Chat.Model;
using ChatRoom.ApiModel;
using Microsoft.Extensions.Logging;

namespace Chat.Api.Services;

/// <summary>
/// Provides functionality for handling company messaging hub notifications via SignalR.
/// </summary>
/// <seealso cref="MessagingService" />
/// <seealso cref="MessagingHub"/>
public sealed class MessagingHubNotificationHandler : IMessagingNotificationHandler
{
    private readonly IHubContext<MessagingHub, IMessagingHubPush> _hubContext;
    private readonly IMapper _mapper;
    private readonly ILogger<MessagingService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MessagingHubNotificationHandler"/> class.
    /// </summary>
    public MessagingHubNotificationHandler(
        IHubContext<MessagingHub, IMessagingHubPush> hubContext,
        IMapper mapper,
        ILogger<MessagingService> logger
    )
    {
        _hubContext = hubContext;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task NotifyNewMessageAsync(ChatMessage message)
    {
        ChatMessageDto dto = _mapper.Map<ChatMessageDto>(message);
        await _hubContext.Clients.Group(message.RoomId.ToString()).NewMessage(dto);
    }

    /// <inheritdoc />
    public async Task NotifyEditedMessageAsync(ChatMessage message)
    {
        ChatMessageDto dto = _mapper.Map<ChatMessageDto>(message);
        await _hubContext.Clients.Group(message.RoomId.ToString()).EditedMessage(dto);
    }


    /// <inheritdoc />
    public async Task NotifyDeletedMessageAsync(long roomId, Guid id)
    {
        await _hubContext.Clients.Group(roomId.ToString()).DeletedMessage(id);
    }

    /// <summary>
    /// Notifies clients about a new chat room.
    /// </summary>
    /// <param name="room">The chat room.</param>
    public async Task NotifyNewRoomAsync(Model.Messaging.ChatRoom room)
    {
        ChatRoomDto dto = _mapper.Map<ChatRoomDto>(room);
        await _hubContext.Clients.All.NewRoom(dto);
    }

    /// <inheritdoc />
    public async Task NotifyUserJoignedChatRoomAsync(Guid roomId, User user)
    {
        UserDto dto = _mapper.Map<UserDto>(user);
        _logger.LogDebug("User joigned chat room {roomId}: {user}", roomId, user);
        await _hubContext.Clients.All.UserJoignedChatRoom(roomId, dto);
    }

    /// <inheritdoc />
    public async Task NotifyUserLeavedChatRoomAsync(Guid roomId, User user)
    {
        UserDto dto = _mapper.Map<UserDto>(user);
        await _hubContext.Clients.All.UserLeavedChatRoom(roomId, dto);
    }


}