using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Transfer
{
    public class CheckPinCommand :IRequest<bool>
    {
        public string userId { get; set; }
    }
}
