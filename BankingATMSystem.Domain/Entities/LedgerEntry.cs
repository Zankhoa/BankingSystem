using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Domain.Entities
{
    public class LedgerEntry
    {
        public string Id { get;  set; }
        public string UserId { get;  set; }
        public string? TransactionId { get;  set; }
        public Transactions? Transactions { get;  set; }
        public string? TransactionExternalId { get;  set; }
        public TransactionExternal? TransactionExternal { get;  set; }
        public decimal Amount { get;  set; }
        public string Status { get; set; }
        public decimal BalanceAfter { get;  set; }
        public string EntryType { get;  set; }
        public DateTime CreateAt { get;  set; }
       
    }
}
