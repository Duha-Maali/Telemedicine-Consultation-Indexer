using AutoMapper;
using TCI.Business.DTOs.Consultations.Responses;
using TCI.DataAccess.Entities;

namespace TCI.Business.Mappings;

public sealed class ConsultationMappingProfile : Profile
{
    public ConsultationMappingProfile()
    {
        CreateMap<Consultation, CreateConsultationResponse>();

        CreateMap<Consultation, ConsultationListItemResponse>();

        CreateMap<Consultation, ConsultationDetailsResponse>();

        CreateMap<Consultation, ConsultationStatusResponse>();
    }
}
