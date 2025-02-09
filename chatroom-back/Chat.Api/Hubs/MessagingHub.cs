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
    public async Task<IEnumerable<ChatRoomDto>> GetRooms()
    {
        IEnumerable<Model.Messaging.ChatRoom> rooms = await _messagingService.GetRooms()
                                        ?? throw new ArgumentException("Offer not found");

        return rooms.Select(s => _mapper.Map<ChatRoomDto>(s)).ToArray();
    }
    
    /// <summary>
    /// Gets the chat room from an offer.
    /// </summary>
    public async Task<ChatRoomDto> CreateChatRoom(string name)
    {
        Model.Messaging.ChatRoom room = await _messagingService.CreateChatRoom(NameIdentifier, name)
                                        ?? throw new ArgumentException("Offer not created");

        return _mapper.Map<ChatRoomDto>(room);
    }
    
    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId, Guid userId)
    {
        if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
            throw new KeyNotFoundException("Chatroom not found.");

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());
        await _messagingService.EnterChatRoom(roomId.ToString(), userId);

        var messages = _messagingService.GetMessagesInRoom(roomId);

        List<ChatMessageDto> messagesDto = new List<ChatMessageDto>();

        foreach(var m in messages)
        {
            messagesDto.Add(new ChatMessageDto(){
                Id = m.Id,
                Content = m.Content,
                RoomId = m.RoomId,
                CreatedAt = m.CreatedAt,
                AuthorFullName = m.Author?.FirstName + " " + m.Author?.LastName
            });
        }

        return messagesDto;
    }

    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId, Guid userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());
        await _messagingService.LeaveChatRoom(roomId.ToString(), userId);
    }

    /// <inheritdoc />
    public async Task DeleteChatroom(Guid roomId)
    {
        var room = await _messagingService.DeleteChatroom(roomId);
    }

    /// <inheritdoc />
    public async Task DeleteMessage(Guid messageId)
    {
        await _messagingService.DeleteMessage(messageId);
    }

    /// <inheritdoc />
    public async Task SendMessage(string roomId, string message)
    {
        await _messagingService.SubmitMessageAsync(roomId, message, NameIdentifier);
    }

    /// <inheritdoc />
    public async Task EditedMessage(Guid messageId, string newContent)
    {
        await _messagingService.EditedMessage(messageId, newContent);
    }

    /// <inheritdoc />
    public async Task SomeoneIsWritting(string roomId, string userFullname)
    {
        await _messagingService.SomeoneIsWritting(roomId, userFullname);
    }
}