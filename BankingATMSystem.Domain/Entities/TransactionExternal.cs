using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Domain.Entities
{
    public class TransactionExternal
    {
        public string Id { get; set; }
        public string LedgerEntryId { get; set; }
        public  LedgerEntry Ledger { get; set; }
        public string FromUserId {  get; set; }
        public string? Description { get; set; }
        public string TransferType { get; set; }
        public string ToUserId { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
