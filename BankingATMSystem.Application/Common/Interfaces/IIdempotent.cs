using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Interfaces
{
    public interface IIdempotent
    {
        string requestId { get; set; }
    }
}
