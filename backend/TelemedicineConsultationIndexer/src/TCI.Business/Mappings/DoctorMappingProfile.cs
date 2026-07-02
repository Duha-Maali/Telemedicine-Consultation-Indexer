using AutoMapper;
using TCI.Business.DTOs.Doctors.Responses;
using TCI.DataAccess.Entities;

namespace TCI.Business.Mappings;

public sealed class DoctorMappingProfile : Profile
{
    public DoctorMappingProfile()
    {
        CreateMap<Doctor, DoctorResponse>();
    }
}
