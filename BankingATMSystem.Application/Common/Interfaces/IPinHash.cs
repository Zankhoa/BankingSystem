using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Interfaces
{
    public interface IPinHash 
    {
        bool VerifyPinAsync(string pin, string pinHash);
        string Hash(string pin);
    }
     
}
