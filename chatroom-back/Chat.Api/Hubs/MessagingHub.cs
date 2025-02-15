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
    /// Gets chat rooms.
    /// </summary>
    public async Task<IEnumerable<ChatRoomDto>> GetRooms()
    {
        IEnumerable<Model.Messaging.ChatRoom> rooms = await _messagingService.GetRooms();

        return _mapper.Map<IEnumerable<ChatRoomDto>>(rooms);
    }

    /// <summary>
    /// Gets the chat room from an offer.
    /// </summary>
    public async Task CreateChatRoom(string chatRoomName)
    {
        Model.Messaging.ChatRoom c = await _messagingService.CreateChatRoom(NameIdentifier, chatRoomName);
        await Groups.AddToGroupAsync(Context.ConnectionId, c.Id.ToString());

    }

    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> InitConnexionAndGetMessages(Guid roomId)
    {

        if (await _messagingService.isParticipant(roomId, NameIdentifier))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

            var messages = await _messagingService.GetMessagesAsync(roomId);
            
            return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
        }

        throw new UnauthorizedAccessException("L'utilisateur ne peut pas récuperer les messages si il n'est pas participant à la chat room");
    }
    
    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId)
    {
        await _messagingService.JoinChatRoomAsync(roomId, NameIdentifier);

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

        var messages = _messagingService.GetMessagesInRoom(roomId);

        return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
    }

    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId)
    {
        if (await _messagingService.isParticipant(roomId, NameIdentifier))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());

            await _messagingService.LeaveChatRoomAsync(roomId, NameIdentifier);

        }
        else
        {
            throw new UnauthorizedAccessException("L'utilisateur ne peut pas partir d'une chat room si il n'est pas participant à la chat room");
        }

    }

    /// <inheritdoc />
    public async Task SendMessage(string roomId, string message)
    {
        await _messagingService.SubmitMessageAsync(roomId, message, NameIdentifier);
    }

    /// <inheritdoc />
    public async Task DeleteChatRoom(string roomId)
    {
        await _messagingService.DeleteChatRoomAsync(new Guid(roomId));
    }

    /// <inheritdoc />
    public async Task SendUserWriting(Guid roomId)
    {
        await _messagingService.UserWritingAsync(roomId, NameIdentifier);
    }
}