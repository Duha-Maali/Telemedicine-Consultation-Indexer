using AutoMapper;
using TCI.Business.DTOs.Auth.Responses;
using TCI.DataAccess.Entities;

namespace TCI.Business.Mappings;

public sealed class AuthMappingProfile : Profile
{
    public AuthMappingProfile()
    {
        CreateMap<Doctor, DoctorAuthResponse>();
    }
}
