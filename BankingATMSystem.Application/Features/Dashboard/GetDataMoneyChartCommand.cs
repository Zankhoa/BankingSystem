using BankingATMSystem.Application.Common.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Dashboard
{
    public class GetDataMoneyChartCommand : IRequest<List<DataChartDTOs>>
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string userAccountId { get; set; }

    }
}
