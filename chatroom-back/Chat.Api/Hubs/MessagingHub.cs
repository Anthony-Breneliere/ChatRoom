// File: MessagingHub.cs
using Chat.ApiModel.Messaging;
using System.Security.Authentication;
using Mapster;
using MapsterMapper;
using Chat.Api.Infrastructure.Authentication;
using Chat.Business.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Chat.Api.Hubs
{
    /// <summary>
    /// Représente le hub de messagerie pour la communication en temps réel.
    /// </summary>
    [Authorize]
    public sealed class MessagingHub : Hub<IMessagingHubPush>, IMessagingHubInvoke
    {
        /// <summary>
        /// Obtient le chemin relatif du hub.
        /// </summary>
        public static string HubPath => "api/hub/messaging";

        private readonly MessagingService _messagingService;
        private readonly IMapper _mapper;

        /// <summary>
        /// Initialise une nouvelle instance du hub de messagerie.
        /// </summary>
        /// <param name="messagingService">Le service de messagerie.</param>
        /// <param name="mapper">Le mapper pour adapter les modèles.</param>
        public MessagingHub(MessagingService messagingService, IMapper mapper)
        {
            _messagingService = messagingService;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtient l'identifiant de l'utilisateur connecté.
        /// </summary>
        private string NameIdentifier => Context.User?.GetNameIdentifier()
            ?? throw new AuthenticationException("User nameidentifier not found in Claims.");

        /// <summary>
        /// Récupère une chat room en fonction de son identifiant.
        /// </summary>
        /// <param name="roomId">L'identifiant de la chat room.</param>
        /// <returns>La chat room sous forme de DTO.</returns>
        public async Task<ChatRoomDto> GetChatRoom(Guid roomId)
        {
            var room = await _messagingService.GetChatRoom(roomId)
                        ?? throw new ArgumentException("Chatroom not found");

            return _mapper.Map<ChatRoomDto>(room);
        }

        /// <summary>
        /// Crée une nouvelle chat room.
        /// </summary>
        /// <returns>La chat room créée sous forme de DTO.</returns>
        public async Task<ChatRoomDto> CreateChatRoom()
        {
            var room = await _messagingService.CreateChatRoom(NameIdentifier)
                        ?? throw new ArgumentException("Chatroom not created");

            return _mapper.Map<ChatRoomDto>(room);
        }

        /// <summary>
        /// Récupère toutes les chat rooms.
        /// </summary>
        /// <returns>Un tableau de chat rooms sous forme de DTO.</returns>
        public async Task<ChatRoomDto[]> GetAllChatRooms()
        {
            var rooms = await _messagingService.GetRooms().ToListAsync();
            return _mapper.Map<ChatRoomDto[]>(rooms);
        }

        /// <summary>
        /// Rejoint une chat room et renvoie l'historique des messages.
        /// </summary>
        /// <param name="roomId">L'identifiant de la chat room à rejoindre.</param>
        /// <returns>L'historique des messages sous forme de DTO.</returns>
        public async Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId)
        {
            if (await _messagingService.GetChatRoomAsync(roomId, Context.ConnectionAborted) is not { } room)
                throw new KeyNotFoundException("Chatroom not found.");

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());

            var messages = _messagingService.GetMessagesInRoom(roomId);
            return messages.Adapt<IEnumerable<ChatMessageDto>>(_mapper.Config);
        }

        /// <summary>
        /// Quitte la chat room spécifiée.
        /// </summary>
        /// <param name="roomId">L'identifiant de la chat room à quitter.</param>
        public async Task LeaveChatRoom(Guid roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());
        }

        /// <summary>
        /// Envoie un message dans la chat room.
        /// </summary>
        /// <param name="roomId">L'identifiant de la chat room (en chaîne de caractères).</param>
        /// <param name="message">Le contenu du message.</param>
        public async Task SendMessage(string roomId, string message)
        {
            await _messagingService.SubmitMessageAsync(roomId, message, NameIdentifier);
        }

        /// <summary>
        /// Notifie le serveur qu'un utilisateur est en train d'écrire dans la chat room.
        /// </summary>
        /// <param name="roomId">L'identifiant de la chat room (en chaîne de caractères).</param>
        public async Task NotifyUserIsWriting(string roomId)
        {
            await Clients.Group(roomId).UserWriting(NameIdentifier);
        }
    }
}
