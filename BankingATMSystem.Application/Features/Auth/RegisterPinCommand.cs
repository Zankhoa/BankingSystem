using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Auth
{
    public class RegisterPinCommand : IRequest<bool>
    {
        public string userAccountId { get; set; }
        public string Pin { get; set; }
        public string Password { get; set; }
    }
}
