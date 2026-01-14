using MediatR;
using BankingATMSystem.Domain.Entities;
using BankingATMSystem.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis; // <--- QUAN TRỌNG

namespace BankingATMSystem.Application.Features.Withdraw
{
    public class WithdrawHandler : IRequestHandler<WithdrawCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IConnectionMultiplexer _redis; // <--- Đổi sang cái này

        public WithdrawHandler(IApplicationDbContext context, IConnectionMultiplexer redis)
        {
            _context = context;
            _redis = redis;
        }

        public async Task<bool> Handle(WithdrawCommand request, CancellationToken cancellationToken)
        {
            // 1. Lấy database của Redis (mặc định là db 0)
            var db = _redis.GetDatabase();
            string lockKey = $"lock_account_{request.UserId}";
            string token = Guid.NewGuid().ToString(); // Mã định danh của request này

            // 2. TẠO KHÓA ATOMIC (Quan trọng nhất)
            // Hàm này làm 2 việc cùng lúc: Kiểm tra xem có khóa chưa? Nếu chưa thì Set luôn.
            // Expiry: 10 giây tự hủy.
            // When.NotExists: Chỉ set nếu key chưa tồn tại.
            bool isLocked = await db.StringSetAsync(lockKey, token, TimeSpan.FromSeconds(10), When.NotExists);

            if (!isLocked)
            {
                // Nếu trả về false -> Nghĩa là đã có người khác nhanh tay khóa trước
                throw new Exception("Tài khoản đang được xử lý ở giao dịch khác. Vui lòng thử lại!");
            }

            try
            {
                // --- LOGIC RÚT TIỀN (GIỮ NGUYÊN) ---
                using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
                try
                {
                    var user = await _context.User.FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);

                    // Giả lập xử lý chậm để test race condition
                    // await Task.Delay(2000); 

                    if (user == null) throw new Exception("Tài khoản không tồn tại");
                    if (user.Balance < request.Amount) throw new Exception("Số dư không đủ");

                    user.Balance -= request.Amount;

                    _context.Transactions.Add(new Transaction
                    {
                        UserId = user.Id,
                        Amount = request.Amount,
                        TransactionType = "WITHDRAW",
                        Description = "Rút tiền (Atomic Lock)",
                        CreateAt = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);

                    return true;
                }
                catch
                {
                    await transaction.RollbackAsync(cancellationToken);
                    throw;
                }
            }
            finally
            {
                // 3. XÓA KHÓA (Cần cẩn thận)
                // Chỉ xóa nếu cái khóa đó là do CHÍNH MÌNH tạo ra (check token)
                // (Để tránh trường hợp mình chạy lâu quá, khóa hết hạn, người khác vào tạo khóa mới, 
                // rồi mình xong việc lại xóa nhầm khóa của người ta)
                var currentValue = await db.StringGetAsync(lockKey);
                if (currentValue == token)
                {
                    await db.KeyDeleteAsync(lockKey);
                }
            }
        }
    }
}