using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.DTOs
{
    public class TotalMoneyDTO
    {
        public Decimal MoneyIn { get; set; }
        public Decimal MoneyOut { get; set; }
        public Decimal TotalMoney { get; set; }
    }
}
