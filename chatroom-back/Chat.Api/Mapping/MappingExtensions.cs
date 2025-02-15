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
                .Map(dest => dest.AuthorFullName, src => src.Author.FirstName + " " + src.Author.LastName);
    }
}