
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
    public DbSet<User> User { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<UserAccount> UserAccount { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Cấu hình Index (Để tìm kiếm nhanh) ---
        modelBuilder.Entity<User>()
            .HasIndex(a => a.AccountNumber)
            .IsUnique(); // Đảm bảo số tài khoản không trùng nhau
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(a => a.Token)
            .IsUnique(); // Đảm bảo số tài khoản không trùng nhau

        //moi quan he 1 1 voi user va user Token
        modelBuilder.Entity<User>().HasOne(u => u.UserAccount)
            .WithOne(p => p.User)
            .HasForeignKey<UserAccount>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
    }