using Chat.Business.Messaging;
using Chat.Business.Persistance;
using Chat.Model;
using Chat.Model.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Throw;

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
    public IEnumerable<ChatMessage> GetMessagesInRoom(Guid roomId) =>
        (from message in _context.ChatMessages
        where message.RoomId == roomId
        orderby message.CreatedAt
        select message).AsNoTracking().ToArray();

    /// <inheritdoc />
    public async Task SubmitMessageAsync(ChatMessage message, CancellationToken ct = default)
    {
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync(ct);
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

        room.Participants = participants;

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
        return await _context.ChatRooms
            .Include(static r => r.Participants).FirstOrDefaultAsync(c => c.Id == roomId, ct);
    }

    /// <summary>
    /// Delete the chat room
    /// </summary>
    public async Task<ChatRoom> DeleteChatRoomAsync(Guid roomId, CancellationToken ct)
    {
        ChatRoom? c = await _context.ChatRooms.FirstOrDefaultAsync(c => c.Id == roomId, ct);

        if (c is null)
            throw new NullReferenceException();

        _context.ChatRooms.Remove(c);

        await _context.SaveChangesAsync(ct);

        return c;
    }
}