
using BankingATMSystem.Application.Common.Interfaces;
using MediatR;


namespace BankingATMSystem.Application.Features.TransferExternal
{
    public class TransferExternalCommand : IRequest<bool>, IIdempotent
    {
        public string requestId { get; set; }
        public string SenderId { get; set; }
        public string ToAccountNumber { get; set; }
        public decimal Amount { get; set; }
        public string Pin { get; set; }
    }
}
