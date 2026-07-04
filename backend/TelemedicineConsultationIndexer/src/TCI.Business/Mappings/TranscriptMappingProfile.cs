using AutoMapper;
using TCI.Business.DTOs.Transcripts.Responses;
using TCI.DataAccess.Entities;

namespace TCI.Business.Mappings;

public sealed class TranscriptMappingProfile : Profile
{
    public TranscriptMappingProfile()
    {
        CreateMap<TranscriptSegment, TranscriptSegmentResponse>();
    }
}
