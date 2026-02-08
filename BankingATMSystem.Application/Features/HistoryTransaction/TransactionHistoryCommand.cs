using BankingATMSystem.Application.Common.DTOs;
using MediatR;

namespace BankingATMSystem.Application.Features.HistoryTransaction
{
    public class TransactionHistoryCommand : IRequest<List<TransactionHistoryDTOs>>
    {
        public string userAccountId { get; set; }
        public string SearchData { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}
