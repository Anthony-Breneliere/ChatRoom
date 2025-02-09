using Chat.Business.Messaging;
using Chat.Business.Persistance;
using Chat.Model;
using Chat.Model.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Chat.Repository.Repositories;

/// <summary>
/// Provides the business logic for companies.
/// </summary>
public sealed class MessagingRepository : IMessagingPersistance
{
    private readonly PlatformDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="MessagingService"/> class.
    /// </summary>
    public MessagingRepository(PlatformDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async  Task<IEnumerable<ChatMessage>> GetMessages(Guid roomId, CancellationToken ct) =>
        await _context.ChatMessages.Where(m => m.RoomId == roomId).AsNoTracking().ToArrayAsync(ct);

    /// <inheritdoc />
    public async Task<IEnumerable<ChatRoom>> GetRooms() => await _context.ChatRooms.AsNoTracking().ToArrayAsync();

    /// <inheritdoc />
    public IQueryable<ChatRoom> GetRoomsForCompany(Guid userId) =>
        from room in _context.ChatRooms
        where room.Participants.Any(participant => participant.Id == userId)
        select room;

    /// <inheritdoc />
    public IEnumerable<ChatMessage> GetMessagesInRoom(Guid roomId){
        var messages = (from message in _context.ChatMessages
        where message.RoomId == roomId
        orderby message.CreatedAt
        select message).AsNoTracking().ToArray();

        // We add this part to link a message with a name in the front chatroom project
        foreach(var message in messages)
        {
            var author = _context.Users.FirstOrDefault(f => f.Id == message.AuthorId);
            if(author is null)
                continue;
            message.Author = author;
        }

        return messages;
    }

    /// <inheritdoc />
    public async Task SubmitMessageAsync(ChatMessage message, CancellationToken ct = default)
    {
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync(ct);
    }

    /// <inheritdoc />
    public async Task<ChatRoom?> DeleteChatroomAsync(Guid id, CancellationToken ct = default)
    {
        var chatroom = _context.ChatRooms.FirstOrDefault(c => c.Id == id);
        if(chatroom is null)
        {
            return null;
        }

        _context.ChatRooms.Remove(chatroom);
        await _context.SaveChangesAsync(ct);
        return chatroom;
    }

    /// <inheritdoc />
    public async Task<ChatMessage?> DeleteMessageAsync(Guid id, CancellationToken ct = default)
    {
        var message = _context.ChatMessages.FirstOrDefault(c => c.Id == id);
        if(message is null)
        {
            return null;
        }

        _context.ChatMessages.Remove(message);
        await _context.SaveChangesAsync(ct);
        return message;
    }

    /// <inheritdoc />
    public async Task<ChatMessage?> EditedMessageAsync(Guid id, string content, CancellationToken ct = default)
    {
        var message = _context.ChatMessages.FirstOrDefault(c => c.Id == id);
        if(message is null)
        {
            return null;
        }
        message.Content = content;

        _context.ChatMessages.Update(message);
        await _context.SaveChangesAsync(ct);
        return message;
    }

    /// <inheritdoc />
    public async Task<ChatRoom> CreateRoomAsync(ChatRoom room, CancellationToken ct = default)
    {
        // Get the company IDs from the participants
        Guid[] participantIds = room.Participants.Select(participant => participant.Id).ToArray();

        // Prune participants and replace with full entities from the database
        List<User> participants = await _context.Users.Where(c => participantIds.Contains(c.Id))
            .ToListAsync(cancellationToken: ct);

        if (participants.Count != participantIds.Length)
        {
            throw new ArgumentException("Invalid participants.");
        }

        EntityEntry<ChatRoom> entityEntry = _context.ChatRooms.Add(room);
        await _context.SaveChangesAsync(ct);

        return entityEntry.Entity;
    }

    /// <inheritdoc />
    public async Task<ChatMessage?> GetMessageAsync(Guid id, CancellationToken ct = default)
        => await _context.ChatMessages.FirstOrDefaultAsync(m => m.Id == id, cancellationToken: ct);

    /// <summary>
    /// Get chat room with participants
    /// </summary>
    public async Task<ChatRoom?> GetChatRoomAsync(Guid roomId, CancellationToken ct)
    {
        ChatRoom? chatroom = await _context.ChatRooms
            .Include(static r => r.Participants).FirstOrDefaultAsync(c => c.Id == roomId, ct);

        return chatroom;
    }

    /// <summary>
    /// Add a participant from a chatroom
    /// </summary>
    public async Task SetParticipantAsync(Guid roomId, User user)
    {
        ChatRoom? chatroom = await _context.ChatRooms
            .Include(static r => r.Participants).FirstOrDefaultAsync(c => c.Id == roomId);

        if(chatroom is null)
            return;

        chatroom.Participants.Add(user);
        _context.ChatRooms.Update(chatroom);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Remove a participant from a chatroom
    /// </summary>
    public async Task RemoveParticipantAsync(Guid roomId, User user)
    {
        ChatRoom? chatroom = await _context.ChatRooms
            .Include(static r => r.Participants).FirstOrDefaultAsync(c => c.Id == roomId);
        
        if(chatroom is null)
            return;

        chatroom.Participants.Remove(user);
        _context.ChatRooms.Update(chatroom);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Get all chat room with participants
    /// </summary>
    public async Task<ChatRoom[]> GetChatRoomsAsync(CancellationToken ct)
    {
        return await _context.ChatRooms
            .Include(static r => r.Participants).ToArrayAsync();
    }

    /// <summary>
    /// Get a user by his id
    /// </summary>
    public async Task<User?> GetUserAsync(Guid userId)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
    }
}