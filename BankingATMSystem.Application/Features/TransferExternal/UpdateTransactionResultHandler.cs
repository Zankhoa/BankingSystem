using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.TransferExternal
{
    public class UpdateTransactionResultHandler : IRequestHandler<UpdateTransactionExternalResultCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        public UpdateTransactionResultHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<bool> Handle(UpdateTransactionExternalResultCommand request, CancellationToken cancellationToken)
        {
            var transaction = await _context.LedgerEntry.FromSql($"SELECT * FROM LedgerEntry WITH (UPDLOCK) WHERE TransactionExternalId = {request.TransactionExternalId}").SingleOrDefaultAsync(cancellationToken);
            if (transaction == null || transaction.Status != "Hold")
            {
                return true;
            }
            using var dbTransactionExternal = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                if(request.Status == "SUCCESS")
                {
                    transaction.Status = "Success";
                }
                else
                {
                    transaction.Status = "Falied";
                    //refun tien
                    var user = await _context.Users.SingleOrDefaultAsync(x => x.Id == transaction.UserId);

                    user.Balance += Math.Abs(transaction.Amount);
                    var refundLedger = new LedgerEntry
                    {
                        Amount = request.Amount,
                        UserId = transaction.UserId,
                        EntryType = "Refund",
                        Status = "Success",
                        BalanceAfter = user.Balance,
                        CreateAt = DateTime.Now,
                        Id = Guid.CreateVersion7().ToString(),
                        TransactionExternalId = Guid.CreateVersion7().ToString(),
                    };
                    _context.LedgerEntry.Add(refundLedger);
                }
                await _context.SaveChangesAsync(cancellationToken);
                await dbTransactionExternal.CommitAsync(cancellationToken);
                return true;
            }
            catch
            {
                await dbTransactionExternal.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
