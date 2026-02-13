using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Models
{
    public class UserInfoDTO
    {
        public string UserName { get; set; }
        public decimal Balance { get; set; }
        public bool HasPin { get; set; }
        public string AccountNumber { get; set; }

    }
}
