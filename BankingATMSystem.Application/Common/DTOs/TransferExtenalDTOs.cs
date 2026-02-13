using BankingATMSystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.DTOs
{
    public class TransferExtenalDTOs
    {
        public string TransferId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
    }
}
