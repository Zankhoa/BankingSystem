using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.DTOs
{
    public class TransactionHistoryDTOs
    {
        public string code { get; set; }
        public DateTime CreateAt { get; set; }
        public string UsersTransaction { get; set; }
        public Decimal AmountMoney {  get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
    }
}
