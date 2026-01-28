using BankingATMSystem.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Infrastructure.Security
{
    public class PinHash : IPinHash
    {
        public bool VerifyPinAsync(string pin, string pinHash)
        {
            if (String.IsNullOrEmpty(pin)) return false;
            return BCrypt.Net.BCrypt.EnhancedVerify(pin, pinHash);
        }
        public string Hash(string pin)  =>  BCrypt.Net.BCrypt.HashPassword(pin);
    }
}
