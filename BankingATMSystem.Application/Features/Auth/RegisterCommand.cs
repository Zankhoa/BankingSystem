using MediatR;

namespace BankingATMSystem.Application.Features.Auth
{
    public class RegisterCommand : IRequest<bool>
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // Password thô (hoặc đã mã hóa RSA)
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}
