using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Events;
using BankingATMSystem.Domain.Entities;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BankingATMSystem.Application.Features.TransferExternal
{
    public class TransferExternalHandler : IRequestHandler<TransferExternalCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IPinHash _pinHash;
        private readonly IExternalBankService _externalBankService;
        public TransferExternalHandler(IApplicationDbContext context, IPublishEndpoint publishEndpoint, IPinHash pinHash, IExternalBankService externalBankService)
        {
            _context = context;
            _publishEndpoint = publishEndpoint;
            _pinHash = pinHash;
            _externalBankService = externalBankService;
        }

        public async Task<bool> Handle(TransferExternalCommand request, CancellationToken cancellationToken)
        {
            //1 transaction scop theo acid
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                if (request.Amount <= 0) throw new Exception("Số tiền phải lớn hơn 0");
                var userId = await _context.Users.Where(x => x.UserAccount.Id == request.SenderId).Select(x => x.Id).FirstOrDefaultAsync(cancellationToken);
                var user = await _context.Users.FromSql($"SELECT * FROM Users WITH (UPDLOCK) WHERE Id = {userId}").SingleOrDefaultAsync(cancellationToken);
                //validate 
                if (user == null) throw new Exception("Tài khoản không tồn tại");
                if (user.Balance < request.Amount) throw new Exception("Insufficient funds");
                if (!_pinHash.VerifyPinAsync(request.Pin, user.PinHash))
                {
                    throw new Exception("Ma pin sai");
                }
                //tao transactionExternal
                string transferExternalid = Guid.CreateVersion7().ToString();
                var ledgerId = Guid.CreateVersion7().ToString();
                var transferExternal = new TransactionExternal
                {
                    Id = transferExternalid,
                    LedgerEntryId = ledgerId,
                    FromUserId = request.ToAccountNumber,
                    ToUserId = request.SenderId,
                    TransferType = "Success",
                    Amount = request.Amount,
                    CreateAt = DateTime.UtcNow,
                };
                _context.TransactionExternal.Add(transferExternal);

                var ledgerEntry = new LedgerEntry
                {
                    Id = ledgerId,
                    UserId = user.Id,
                    TransactionExternalId = transferExternalid,
                    TransactionId ="",
                    Amount = -request.Amount,
                    BalanceAfter = user.Balance - request.Amount, // audit only
                    EntryType = "DEBIT",
                    Status = "Hold",
                    CreateAt = DateTime.UtcNow
                };
                _context.LedgerEntry.Add(ledgerEntry);
                //tru tien di
                user.Balance -= request.Amount;

                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                var externalRequest = new ExternalTransferRequest(
                    TransactionExternalId: transferExternalid,
                    Amount: request.Amount,
                    ToAccount: request.ToAccountNumber,
                    message: "Chuyển tiền liên ngân hàng"
                );
                var bankResponse = await _externalBankService.SendPayoutRequestAsync(externalRequest);
                if (bankResponse == "Falied") // Hoặc check IsSuccess
                {
                    // Thay vì Send (đồng bộ), hãy Publish (bất đồng bộ) để đảm bảo chắc chắn sẽ hoàn tiền
                    await _publishEndpoint.Publish(new ProcessBankCallbackEvent(
                        transferExternalid, request.Amount,user.AccountNumber,"Failed", "Bank rejected request"
                    ), cancellationToken); ;
                }
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
