using BankingATMSystem.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Infrastructure.Security
{
    public class PasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => BCrypt.Net.BCrypt.EnhancedHashPassword(password);
        public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
