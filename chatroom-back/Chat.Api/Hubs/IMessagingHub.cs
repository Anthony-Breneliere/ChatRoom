using Chat.ApiModel.Messaging;

namespace Chat.Api.Hubs
{
	/// <summary>
	/// Définit les méthodes que le serveur pousse vers le client (server-to-client).
	/// </summary>
	public interface IMessagingHubPush
	{
		/// <summary>
		/// Notifie le client qu'un utilisateur est en train d'écrire.
		/// </summary>
		/// <param name="userId">L'identifiant de l'utilisateur qui écrit.</param>
		/// <returns>Une tâche asynchrone.</returns>
		Task UserWriting(string userId);

		/// <summary>
		/// Envoie un nouveau message au client.
		/// </summary>
		/// <param name="message">Le message à envoyer.</param>
		/// <returns>Une tâche asynchrone.</returns>
		Task NewMessage(ChatMessageDto message);

		/// <summary>
		/// Envoie un message édité au client.
		/// </summary>
		/// <param name="message">Le message édité à envoyer.</param>
		/// <returns>Une tâche asynchrone.</returns>
		Task EditedMessage(ChatMessageDto message);

		/// <summary>
		/// Envoie l'identifiant d'un message supprimé au client.
		/// </summary>
		/// <param name="id">L'identifiant du message supprimé.</param>
		/// <returns>Une tâche asynchrone.</returns>
		Task DeletedMessage(Guid id);
	}

	/// <summary>
	/// Définit les méthodes que le client invoque sur le serveur (client-to-server).
	/// </summary>
	public interface IMessagingHubInvoke
	{
		/// <summary>
		/// Rejoint une chat room afin de recevoir de nouveaux messages et d'obtenir l'historique.
		/// </summary>
		/// <param name="roomId">L'identifiant de la chat room.</param>
		/// <returns>Une tâche renvoyant une collection de messages.</returns>
		Task<IEnumerable<ChatMessageDto>> JoinChatRoom(Guid roomId);

		/// <summary>
		/// Quitte la chat room.
		/// </summary>
		/// <param name="roomId">L'identifiant de la chat room à quitter.</param>
		/// <returns>Une tâche asynchrone.</returns>
		Task LeaveChatRoom(Guid roomId);

		/// <summary>
		/// Envoie un nouveau message dans la chat room.
		/// </summary>
		/// <param name="roomId">L'identifiant de la chat room (en chaîne de caractères).</param>
		/// <param name="message">Le contenu du message.</param>
		/// <returns>Une tâche asynchrone.</returns>
		Task SendMessage(string roomId, string message);

		/// <summary>
		/// Récupère une chat room.
		/// </summary>
		/// <param name="roomId">L'identifiant de la chat room.</param>
		/// <returns>Une tâche renvoyant la chat room.</returns>
		Task<ChatRoomDto> GetChatRoom(Guid roomId);

		/// <summary>
		/// Crée une nouvelle chat room.
		/// </summary>
		/// <returns>Une tâche renvoyant la chat room créée.</returns>
		Task<ChatRoomDto> CreateChatRoom();

		/// <summary>
		/// Notifie le serveur qu'un utilisateur est en train d'écrire dans la chat room.
		/// </summary>
		/// <param name="roomId">L'identifiant de la chat room (en chaîne de caractères).</param>
		/// <returns>Une tâche asynchrone.</returns>
		Task NotifyUserIsWriting(string roomId);
	}
}
