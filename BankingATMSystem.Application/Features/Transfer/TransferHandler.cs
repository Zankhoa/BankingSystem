using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace BankingATMSystem.Application.Features.Transfer
{
    public class TransferHandler : IRequestHandler<TransferCommand, string>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPinHash _pinHash;
        public TransferHandler(IApplicationDbContext context, IPinHash pinHash)
        {
            _context = context;
            _pinHash = pinHash;
        }
        public async Task<string> Handle(TransferCommand request, CancellationToken cancellationToken)
        {
            //1 mo transaction (unit of work)
            //dam bao tru a va cong b 
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                //validate du lieu dau vao
                if (request.AmountMoney <= 0) throw new Exception("Số tiền phải lớn hơn 0");

                //lay thong tin người gửi
                //luu y khong dung asnotracking vi ta can update
                var senderAccount = await _context.Users.FirstOrDefaultAsync(x => x.UserAccount.Id == request.SenderId, cancellationToken);
                if (senderAccount == null) throw new Exception("Account not exist");
                if (senderAccount.Balance < request.AmountMoney) throw new Exception("tai khoan khong du tien");

                //4 lay thong tin nguoi nhan
                var receiverAccount = await _context.Users.FirstOrDefaultAsync(u => u.AccountNumber == request.ReceiverAccountNumber, cancellationToken);
                if (receiverAccount == null) throw new Exception("so tai khoan hien khong ton tai");
                //if (senderAccount == receiverAccount) throw new Exception("khong the tu chuyen cho chinh minh");
                if (!_pinHash.VerifyPinAsync(request.Pin, senderAccount.PinHash))
                {
                    throw new Exception("Ma pin sai");
                }
                //thuc hien giao dich
                senderAccount.Balance -= request.AmountMoney;
                receiverAccount.Balance += request.AmountMoney;

                //luu lich su  giao dich
                var randomNumber = new byte[32];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomNumber);

                var id = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                   .Replace("+", "")
                   .Replace("/", "")
                   .Replace("=", "");
                var transactionRecord = new Transactions
                {
                    Id = id,
                    UserId = senderAccount.Id,
                    RequestIs = request.requestId,
                    Amount = request.AmountMoney,
                    TransactionType = request.Types,
                    ReceiverUserId = receiverAccount.Id,
                    CreateAt = DateTime.UtcNow,
                    Description = request.Description,
                };
                _context.TransactionsHistory.Add(transactionRecord);

                //luu xuong db(commit)
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return "Giao dich thanh cong";
            }
            catch (DbUpdateConcurrencyException)
            {
                // Bắt lỗi Optimistic Locking
                await transaction.RollbackAsync(cancellationToken);
                throw new Exception("Giao dịch thất bại do có thay đổi dữ liệu đồng thời. Vui lòng thử lại.");
            }
            catch (Exception ex)
            {
                // Bắt các lỗi logic khác (không đủ tiền, tk khóa...)
                await transaction.RollbackAsync(cancellationToken);
                throw new Exception($"Lỗi giao dịch: {ex.Message}");
            }
        }
    }
}
