using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Events
{
    public record ProcessBankCallbackEvent(string TransactionExternalId,decimal Amount, string FromAccountNumber, string status, string Message);
}
