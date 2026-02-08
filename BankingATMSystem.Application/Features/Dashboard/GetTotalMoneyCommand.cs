using BankingATMSystem.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Dashboard
{
    public class GetTotalMoneyCommand : IRequest<TotalMoneyDTO>
    {
        public string UserAccountId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}
