using BankingATMSystem.Application.Common.DTOs;
using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Common.Models;
using BankingATMSystem.Application.Features.UserInfo;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Dashboard
{
    public class GetTotalMoneyHandler : IRequestHandler<GetTotalMoneyCommand, TotalMoneyDTO>
    {
        private readonly IApplicationDbContext _context;
        public GetTotalMoneyHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<TotalMoneyDTO> Handle(GetTotalMoneyCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users.Where(x => x.UserAccount.Id == request.UserAccountId).Select(x => new { x.Id, x.Balance }).FirstOrDefaultAsync(cancellationToken);
            if (user == null)
                throw new Exception("User not found");
            // 2. Base query
            var query = _context.TransactionsHistory.AsNoTracking().Where(t => t.UserId == user.Id || t.ReceiverUserId == user.Id);
            if(request.FromDate != null)
            {
                query = query.Where(x => x.CreateAt >= request.FromDate);
            }
            if(request.ToDate != null)
            {
                query = query.Where(x => x.CreateAt <= request.ToDate);
            }
            var totalOutMoney = await query.Where(x => x.UserId == user.Id).SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;
            var totalInMoney = await query.Where(x => x.ReceiverUserId == user.Id).SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0;
            var result = new TotalMoneyDTO
            {
                MoneyOut = totalOutMoney,
                MoneyIn = totalInMoney,
                TotalMoney = user.Balance,
            };
            return result;
        }
    }
}
