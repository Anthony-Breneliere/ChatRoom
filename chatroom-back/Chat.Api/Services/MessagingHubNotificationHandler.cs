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
        ChatMessageDto dto = new ChatMessageDto(){
            Id = message.Id,
            Content = message.Content,
            AuthorId = message.AuthorId,
            RoomId = message.RoomId,
            AuthorFullName = message.Author?.FirstName + " " + message.Author?.LastName,
            CreatedAt = message.CreatedAt
        };

        await _hubContext.Clients.Group(message.RoomId.ToString()).NewMessage(dto);
    }

    /// <inheritdoc />
    public async Task NotifyNewChatroomAsync(Model.Messaging.ChatRoom chatroom)
    {
        ChatRoomDto dto = _mapper.Map<ChatRoomDto>(chatroom);
        await _hubContext.Clients.All.NewChatroom(dto);
    }

    /// <inheritdoc />
    public async Task NotifyDeleteChatroomAsync(Model.Messaging.ChatRoom chatroom)
    {
        ChatRoomDto dto = _mapper.Map<ChatRoomDto>(chatroom);
        await _hubContext.Clients.All.DeletedChatroom(dto);
    }

    /// <inheritdoc />
    public async Task NotifyEditedMessageAsync(ChatMessage message)
    {
        ChatMessageDto dto = _mapper.Map<ChatMessageDto>(message);
        await _hubContext.Clients.Group(message.RoomId.ToString()).EditedMessage(dto);
    }

    /// <inheritdoc />
    public async Task NotifySomeoneIsWrittingAsync(string roomId, string fullName)
    {
        await _hubContext.Clients.Group(roomId).SomeoneIsWritting(roomId, fullName);
    }


    /// <inheritdoc />
    public async Task NotifyDeletedMessageAsync(ChatMessage message)
    {
        ChatMessageDto dto = _mapper.Map<ChatMessageDto>(message);
        await _hubContext.Clients.Group(message.RoomId.ToString()).DeletedMessage(dto);
    }

    /// <inheritdoc />
    public async Task NotifyLeaveChatRoomAsync(string roomId, string fullName, string userId)
    {
        await _hubContext.Clients.Group(roomId).LeaveChatRoom(roomId, fullName, userId);
    }

    /// <inheritdoc />
    public async Task NotifyEnterChatRoomAsync(string roomId, string fullName, string userId)
    {
        await _hubContext.Clients.Group(roomId).EnterChatRoom(roomId, fullName, userId);
    }
}