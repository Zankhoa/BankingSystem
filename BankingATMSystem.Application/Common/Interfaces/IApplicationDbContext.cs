using BankingATMSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace BankingATMSystem.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Users> Users { get; }
        DbSet<Transactions> TransactionsHistory { get; }
        DbSet<UserAccount> UserAccount { get; }
        DbSet<RefreshToken> RefreshToken { get; }
        DbSet<TransactionExternal> TransactionExternal { get; }
        DbSet<LedgerEntry> LedgerEntry { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);

        // Hỗ trợ truy cập Database Facade cho Transaction
        // Lưu ý: Cần thêm thư viện Microsoft.EntityFrameworkCore vào project Application nếu chưa có
        Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade Database { get; }
    }
}
