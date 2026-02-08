using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Models
{
    public class RefreshToken
    {
        public string NewAccessToken;
        public string NewRefreshToken;
        public DateTime NewRefreshTokenExpiry;
        public DateTime NewAccessTokenExpiry;

    }
}
