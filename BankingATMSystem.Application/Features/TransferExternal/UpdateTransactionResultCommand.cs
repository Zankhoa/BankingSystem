using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.TransferExternal
{
    public class UpdateTransactionExternalResultCommand : IRequest<bool>
    {
        public string TransactionExternalId { get; set; }
        public string FromAccountNumber { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
    }
}
