using Chat.ApiModel.Messaging;
using Chat.Model.Messaging;
using Mapster;

namespace Chat.Api.Mapping;

/// <summary>
/// Provides mapping extensions for configuring object mappings, using Mapster.
/// </summary>
public static class MappingExtensions
{
    /// <summary>
    /// Configures the mappings.
    /// </summary>
    public static void ConfigureStaticMappings()
    {
      TypeAdapterConfig<ChatMessage, ChatMessageDto>.NewConfig()
          .Map(static m => m.AuthorId, static m => m.Author.Id)
          .Map(static m => m.AuthorFullName, static m => m.Author.FirstName + " " + m.Author.LastName)
          .Map(static m => m.Content, static m => m.Content)
          .Map(static m => m.CreatedAt, static m => m.CreatedAt)
          .Map(static m => m.RoomId, static m => m.RoomId)
          .Map(static m => m.Id, static m => m.Id);
    }
}
