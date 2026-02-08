using BankingATMSystem.Application.Common.Models;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Transfer
{
    public class GetPinCommand : IRequest<string>
    {
        public string PinHash { get; set; }
        public string UserAccountId { get; set; }
        public GetPinCommand(string pinHash, string userAccountId)
        {
            PinHash = pinHash;
            UserAccountId = userAccountId;
        }
    }
}
