using BankingATMSystem.Application.Common.Models;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Auth
{
    public class GetUserInforCommand : IRequest<UserInfoDTO>
    {
        public string UserId { get; set; }
        public GetUserInforCommand(string userId)
        {
            UserId = userId;
        }
    }
}
