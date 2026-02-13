using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Interfaces
{
    public interface IExternalBankService
    {
        Task<string> SendPayoutRequestAsync(ExternalTransferRequest request);
    }
    public record ExternalTransferRequest(string TransactionExternalId, decimal Amount, string ToAccount, string message);
}
