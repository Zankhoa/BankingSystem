using BankingATMSystem.Application.Common.DTOs;
using BankingATMSystem.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BankingATMSystem.Application.Features.HistoryTransaction
{
    public class TransactionHistoryHandler
        : IRequestHandler<TransactionHistoryCommand, List<TransactionHistoryDTOs>>
    {
        private readonly IApplicationDbContext _context;

        public TransactionHistoryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TransactionHistoryDTOs>> Handle(
            TransactionHistoryCommand request,
            CancellationToken cancellationToken)
        {
            // 1. Lấy user từ accountId
            var user = await _context.Users.AsNoTracking().Where(x => x.UserAccount.Id == request.userAccountId).Select(x => new
                {
                    x.Id,
                    x.Name
                }).FirstOrDefaultAsync(cancellationToken);
            if (user == null) throw new Exception("User not found");
            // 2. Base query
            var query = _context.TransactionsHistory.AsNoTracking().Where(t => (t.UserId == user.Id || t.ReceiverUserId == user.Id) && t.CreateAt >= request.FromDate && t.CreateAt <= request.ToDate );

            // 3. Search
            if (!string.IsNullOrWhiteSpace(request.SearchData))
            {
                var search = request.SearchData.Trim().ToLower();
               query = query.Where(t => (t.Description != null && t.Description.ToLower().Contains(search)));
            }

          // 4. Lấy transaction ra trước (KHÔNG map DTO ở đây)
          var transactions = await query.OrderByDescending(t => t.CreateAt).Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync(cancellationToken);
          // 5. Lấy danh sách user liên quan (receiver)
          var receiverIds = transactions.Where(x => x.UserId == user.Id).Select(x => x.ReceiverUserId).Distinct().ToList();
          var receiverUsers = await _context.Users.AsNoTracking().Where(x => receiverIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);
          // 6. Map DTO ở memory (AN TOÀN)
          var result = transactions.Select(x => new TransactionHistoryDTOs
          {
                CreateAt = x.CreateAt,
                AmountMoney = x.UserId == user.Id ? -x.Amount : x.Amount,
                Description = x.Description,
                UsersTransaction = x.UserId == user.Id ? receiverUsers.GetValueOrDefault(x.ReceiverUserId) : user.Name,
                code = x.RequestIs, // FIX tên field nếu cần
                Status = "SUCCESS"
          }).ToList();
            return result;
        }
    }
}
