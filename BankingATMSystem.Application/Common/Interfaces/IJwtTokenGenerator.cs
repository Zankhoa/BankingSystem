using BankingATMSystem.Domain.Entities;

namespace BankingATMSystem.Application.Common.Interfaces
{
     public interface IJwtTokenGenerator
    {
        string GenerateAccessToken(UserAccount user);
        RefreshToken GenerateRefreshToken(string ipAddress, string userAccountId);
    }
}
