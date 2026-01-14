using MediatR;

namespace BankingATMSystem.Application.Features.Withdraw
{
    public class WithdrawCommand : IRequest<bool>
    {
        public string UserId {  get; set; }
        public decimal Amount { get; set; }
    }
}
