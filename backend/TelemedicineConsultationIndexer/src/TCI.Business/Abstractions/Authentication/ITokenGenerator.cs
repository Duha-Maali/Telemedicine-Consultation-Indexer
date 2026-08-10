using TCI.Business.Models.Authentication;
using TCI.DataAccess.Entities;

namespace TCI.Business.Abstractions.Authentication;

public interface ITokenGenerator
{
    TokenResult Generate(Doctor doctor);
}
