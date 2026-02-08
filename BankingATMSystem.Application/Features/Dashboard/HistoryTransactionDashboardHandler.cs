using BankingATMSystem.Application.Common.DTOs;
using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BankingATMSystem.Application.Features.Dashboard
{
    public class HistoryTransactionDashboardHandler : IRequestHandler<HistoryTransactionDashboardCommand, List<TransactionHistoryDTOs>>
    {
        public readonly IApplicationDbContext _context;
        public HistoryTransactionDashboardHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<List<TransactionHistoryDTOs>> Handle(HistoryTransactionDashboardCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users.AsNoTracking().Where(x => x.UserAccount.Id == request.userAccountId).Select(x => new { x.Id }).FirstOrDefaultAsync(cancellationToken);
            var query = _context.TransactionsHistory.AsNoTracking().Where(t => (t.UserId == user.Id || t.ReceiverUserId == user.Id) && t.CreateAt >= request.FromDate && t.CreateAt <= request.ToDate);
            var transactions = await query.OrderByDescending(t => t.CreateAt).Take(7).ToListAsync(cancellationToken);
            var receiverIds = transactions.Where(x => x.UserId == user.Id).Select(x => x.ReceiverUserId).Distinct().ToList();
            var receiverUsers = await _context.Users.AsNoTracking().Where(x => receiverIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);
            var result = transactions.Select(x => new TransactionHistoryDTOs
            {
                CreateAt = x.CreateAt,
                AmountMoney = x.UserId == user.Id ? -x.Amount : x.Amount,
                Description = x.Description,
                UsersTransaction = receiverUsers.GetValueOrDefault(x.ReceiverUserId),
                code = x.RequestIs, // FIX tên field nếu cần
                Status = "SUCCESS"
            }).ToList();

            return result;
        }
    }
}
