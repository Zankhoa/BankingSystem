using MediatR;
namespace BankingATMSystem.Application.Features.Auth
{
        //request
        public record LoginCommand(string userName, string Password, string IdAddress) : IRequest<LoginResponse>;
        public record LoginResponse(string accessToken, string RefreshToken, DateTime RefreshTokenExpiration, string SignatureSecret);
}
