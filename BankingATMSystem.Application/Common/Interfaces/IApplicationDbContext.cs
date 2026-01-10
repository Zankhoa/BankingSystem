using BankingATMSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Account> Accounts { get; }
        DbSet<Transaction> Transactions { get; }
        DbSet<UserAccount> Users { get; }
        DbSet<RefreshToken> RefreshTokens { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);

        // Hỗ trợ truy cập Database Facade cho Transaction
        // Lưu ý: Cần thêm thư viện Microsoft.EntityFrameworkCore vào project Application nếu chưa có
        Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade Database { get; }
    }
}
