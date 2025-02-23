using System.Security.Authentication;
using Microsoft.EntityFrameworkCore;
using Mapster;
using MapsterMapper;
using Chat.Api.Infrastructure.Authentication;
using Chat.ApiModel.Messaging;
using ChatRoom.ApiModel;
using Chat.Business.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Chat.Model;

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

    /// <summary>
    /// Sends a new message to all clients.
    /// </summary>
    /// <param name="message">The message to send.</param>
    public async Task NewMessage(ChatMessageDto message)
    {
        await Clients.All.NewMessage(message);
    }

    /// <summary>
    /// Notifies all clients that a message has been edited.
    /// </summary>
    /// <param name="message">The edited message.</param>
    public async Task EditedMessage(ChatMessageDto message)
    {
        await Clients.All.EditedMessage(message);
    }

    /// <summary>
    /// Notifies all clients that a message has been deleted.
    /// </summary>
    /// <param name="id">The ID of the deleted message.</param>
    public async Task DeletedMessage(Guid id)
    {
        await Clients.All.DeletedMessage(id);
    }


    /// <summary>
    /// Gets all chat rooms.
    /// </summary>
    public async Task<IEnumerable<ChatRoomDto>> GetChatRooms()
    {
        var rooms = await _messagingService.GetRooms().ToListAsync();
        return rooms.Adapt<IEnumerable<ChatRoomDto>>(_mapper.Config);
    }

    /// <summary>
    /// Gets the chat room from an offer.
    /// </summary>
    public async Task<ChatRoomDto> CreateChatRoom(string roomName)
    {
        Model.Messaging.ChatRoom room = await _messagingService.CreateChatRoom(roomName)
                            ?? throw new ArgumentException("Chat room not created");

        var chatRoomDto = _mapper.Map<ChatRoomDto>(room);
        chatRoomDto.Name = roomName;

        await Clients.All.NewChatRoomCreated(chatRoomDto); // Notifier tous les clients de la nouvelle salle de chat

        return chatRoomDto;
    }

    /// <summary>
    /// Gets the current user.
    /// </summary>
    /// <returns>The user details.</returns>
    public async Task<UserDto> GetUser()
    {
        var userId = Context.User?.GetUserUid()
        ?? throw new AuthenticationException("User nameidentifier not found in Claims.");
        var user = await _messagingService.GetUserById(Guid.Parse(userId));

        return _mapper.Map<UserDto>(user);
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

    /// <inheritdoc />
    public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId)
    {
        var chatRoom = await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted)
                        ?? throw new KeyNotFoundException("Chatroom not found.");
        User user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);

        await _messagingService.AddToParticipants(chatRoom, user);

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

        var messages = _messagingService.GetMessagesInRoom(roomId);

        return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
    }

    /// <inheritdoc />
    public async Task LeaveChatRoom(Guid roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());
        User user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        await Clients.Group(roomId.ToString()).ParticipantLeft(user.Id.ToString());
    }

    /// <summary>
    /// Notifies the chat room that a user is typing.
    /// </summary>
    /// <param name="roomId">The ID of the chat room.</param>
    public async Task UserTyping(Guid roomId)
    {
        var userId = Context.UserIdentifier ?? throw new AuthenticationException("User identifier not found.");
        var user = await _messagingService.GetUserById(Guid.Parse(userId));

        var userTypingInfo = new
        {
            RoomId = roomId,
            UserId = user.Id,
            UserName = $"{user.FirstName} {user.LastName}"
        };

        // await Clients.Group(roomId.ToString()).isTyping(userTypingInfo);
    }

    /// <inheritdoc />
    public async Task SendMessage(string roomId, string message)
    {
        User user = await _messagingService.GetUserFromNameIdentifier(NameIdentifier);
        await _messagingService.SubmitMessageAsync(roomId, message, user);
        var authorFullName = user.FirstName + " " + user.LastName;
        var chatMessageDto = new ChatMessageDto { RoomId = Guid.Parse(roomId), Content = message, AuthorFullName = authorFullName };

        await Clients.Group(roomId.ToString()).NewMessage(chatMessageDto);
    }
}