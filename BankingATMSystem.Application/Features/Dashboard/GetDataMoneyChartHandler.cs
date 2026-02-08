using BankingATMSystem.Application.Common.DTOs;
using BankingATMSystem.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Dashboard
{
    public class GetDataMoneyChartHandler : IRequestHandler<GetDataMoneyChartCommand, List<DataChartDTOs>>
    {
        public readonly IApplicationDbContext _context;
        public GetDataMoneyChartHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<DataChartDTOs>> Handle(GetDataMoneyChartCommand request, CancellationToken cancellationToken)
        {
            var today = DateTime.Today;

            var userId = await _context.Users.AsNoTracking().Where(x => x.UserAccount.Id == request.userAccountId).Select(x => x.Id).FirstOrDefaultAsync(cancellationToken);
            var transaction = _context.TransactionsHistory.AsNoTracking().Where(x => x.UserId == userId || x.ReceiverUserId == userId);
            var fromDate = request.FromDate ?? DateTime.Today.AddDays(-5);
            var toDate = request.ToDate ?? DateTime.Today;
            // Đưa về đầu ngày và cuối ngày để query chính xác
            fromDate = new DateTime(fromDate.Year, fromDate.Month, 1);
            toDate = new DateTime(toDate.Year, toDate.Month, DateTime.DaysInMonth(toDate.Year, toDate.Month));
            if (request.FromDate != null)
            {
                transaction = transaction.Where(x => x.CreateAt >= fromDate);
            }
            if (request.ToDate != null)
            {
                transaction = transaction.Where(x => x.CreateAt <= toDate);
            }
            var data = await transaction.ToListAsync(cancellationToken);
            var currentLoop = fromDate;
            var result = new List<DataChartDTOs>();
            while (currentLoop <= toDate)
            {
                var monthTransaction = transaction.Where(x => x.CreateAt.Month == currentLoop.Month && x.CreateAt.Year == currentLoop.Year).ToArray();

                var totalInMoney = monthTransaction.Where(x => x.ReceiverUserId == userId).Sum(x => x.Amount);
                var totaloutMoney = monthTransaction.Where(x => x.UserId == userId).Sum(x => x.Amount);

                result.Add(new DataChartDTOs
                {
                    Date = $"Tháng{currentLoop.Month}",
                    MoneyIn = totalInMoney,
                    MoneyOut = totaloutMoney
                });
                currentLoop = currentLoop.AddMonths(1);
            }
            return result;
        }
    }
}
