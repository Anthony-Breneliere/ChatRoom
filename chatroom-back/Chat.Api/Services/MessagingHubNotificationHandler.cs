using Chat.Api.Hubs;
using MapsterMapper;
using Chat.ApiModel.Messaging;
using Chat.Business.Messaging;
using Chat.Model.Messaging;
using Microsoft.AspNetCore.SignalR;
using Chat.Model;
using ChatRoom.ApiModel;

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
    public async Task NotifyNewChatRoomAsync(Model.Messaging.ChatRoom chatRoom)
    {
        ChatRoomDto chatRoomDto = _mapper.Map<ChatRoomDto>(chatRoom);
        await _hubContext.Clients.All.NewChatRoom(chatRoomDto);
    }

    /// <inheritdoc />
    public async Task NotifyUserJoinChatRoomAsync(Guid chatRoomId, User user)
    {
        UserDto userDto = _mapper.Map<UserDto>(user);
        await _hubContext.Clients.Group(chatRoomId.ToString()).UserJoinChatRoom(chatRoomId.ToString(), userDto);
    }

    /// <inheritdoc />
    public async Task NotifyUserLeftChatRoomAsync(Model.Messaging.ChatRoom chatRoom)
    {
        ChatRoomDto chatRoomDto = _mapper.Map<ChatRoomDto>(chatRoom);
        await _hubContext.Clients.Group(chatRoom.Id.ToString()).UserLeaveChatRoom(chatRoomDto);
    }
}