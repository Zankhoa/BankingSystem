
using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BankingATMSystem.Infrastructure.Persistence;

// 2. Kế thừa thêm IApplicationDbContext
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Các DbSet đã khớp với Interface rồi nên không cần sửa gì thêm
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Cấu hình Index (Để tìm kiếm nhanh) ---
        modelBuilder.Entity<Account>()
            .HasIndex(a => a.AccountNumber)
            .IsUnique(); // Đảm bảo số tài khoản không trùng nhau
    }
    }