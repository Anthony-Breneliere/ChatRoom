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
    public IQueryable<ChatRoom> GetRooms() => _context.ChatRooms
        .Include(static r => r.Participants).AsNoTracking();

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
        select message).Include(static m => m.Author).AsNoTracking().ToArray();

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
    /// Add participant to chat room
    /// </summary>
    public async Task<ChatRoom?> AddParticipantAsync(Guid roomId,Guid participantId, CancellationToken ct)
    {
        User? participant = await _context.Users.FindAsync(participantId);
        ChatRoom? chatRoom = await _context.ChatRooms.FindAsync(roomId);
        if (chatRoom != null && participant != null)
        {
          chatRoom.Participants.Add(participant);
          await _context.SaveChangesAsync(ct);
        }

        return await _context.ChatRooms
            .Include(static r => r.Participants).FirstOrDefaultAsync(c => c.Id == roomId, ct);
    }

    /// <summary>
    /// Remove participant from chat room
    /// </summary>
    public async Task<ChatRoom?> RemoveParticipantAsync(Guid roomId, Guid participantId, CancellationToken ct)
    {
        User? participant = await _context.Users.FindAsync(participantId);
        ChatRoom? chatRoom = await _context.ChatRooms
            .Include(static r => r.Participants).FirstOrDefaultAsync(c => c.Id == roomId, ct);
        if (chatRoom != null && participant != null)
        {
            chatRoom.Participants.Remove(participant);
            await _context.SaveChangesAsync(ct);
        }

        return await _context.ChatRooms
            .Include(static r => r.Participants).FirstOrDefaultAsync(c => c.Id == roomId, ct);
    }
}
