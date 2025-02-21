using Chat.Api.Hubs;
using MapsterMapper;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Chat.Model.Messaging;
using Microsoft.AspNetCore.SignalR;

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

    /// <summary>
    /// Initializes a new instance of the <see cref="MessagingHubNotificationHandler"/> class.
    /// </summary>
    public MessagingHubNotificationHandler(
        IHubContext<MessagingHub, IMessagingHubPush> hubContext,
        IMapper mapper
    ) {
        _hubContext = hubContext;
        _mapper = mapper;
    }

    /// <inheritdoc />
    public async Task NotifyNewMessageAsync(ChatMessage message)
    {
        ChatMessageDto dto = _mapper.Map<ChatMessageDto>(message);
        dto.AuthorFullName = $"{message.Author.FirstName}";

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

    /// <inheritdoc />
    public async Task NotifyNewChatRoomAsync(Chat.Model.Messaging.ChatRoom room)
    {
        ChatRoomDto dto = _mapper.Map<ChatRoomDto>(room);
        await _hubContext.Clients.All.NewChatRoom(dto);
    }

    /// <inheritdoc />
    public async Task NotifyUserJoinedRoomAsync(Chat.Model.Messaging.ChatRoom room)
    {
        ChatRoomDto dto = _mapper.Map<ChatRoomDto>(room);
        await _hubContext.Clients.All.UserJoinedRoom(dto);
    }

    /// <inheritdoc />
    public async Task NotifyUserLeftRoomAsync(Chat.Model.Messaging.ChatRoom room, Chat.Model.User user)
    {
        ChatRoomDto dto = _mapper.Map<ChatRoomDto>(room);
        await _hubContext.Clients.All.UserLeftRoom(dto, user.FirstName);
    }

    /// <inheritdoc />
    public async Task NotifyUserChangedNameAsync(Chat.Model.User user)
    {
        await _hubContext.Clients.All.UserChangedName(user.Id, user.FirstName);
    }
}