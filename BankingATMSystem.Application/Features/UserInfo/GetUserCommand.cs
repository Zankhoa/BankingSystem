using BankingATMSystem.Application.Common.Models;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.UserInfo
{
    public class GetUserCommand : IRequest<UserResponse>
    {
        public string AccountNumber { get; set; }
        public GetUserCommand(string accountNumber)
        {
            AccountNumber = accountNumber;
        }
    }
}
