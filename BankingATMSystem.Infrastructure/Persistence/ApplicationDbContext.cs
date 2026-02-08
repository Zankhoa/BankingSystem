
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
    public DbSet<Users> Users { get; set; }
    public DbSet<Transactions> TransactionsHistory { get; set; }
    public DbSet<UserAccount> UserAccount { get; set; }
    public DbSet<RefreshToken> RefreshToken { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Cấu hình Index (Để tìm kiếm nhanh) ---
        modelBuilder.Entity<Users>()
            .HasIndex(a => a.AccountNumber)
            .IsUnique(); // Đảm bảo số tài khoản không trùng nhau
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(a => a.Token)
            .IsUnique(); // Đảm bảo số tài khoản không trùng nhau
                         // Cấu hình RowVersion cho User
        modelBuilder.Entity<Users>()
            .Property(u => u.RowVersion)
            .IsRowVersion(); // Đánh dấu đây là cột concurrency token
        //moi quan he 1 1 voi user va user Token
        modelBuilder.Entity<Users>().HasOne(u => u.UserAccount)
            .WithOne(p => p.User)
            .HasForeignKey<UserAccount>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        // Cấu hình Index cho bảng Transactions
        modelBuilder.Entity<Transactions>(entity =>
    {
        // Tạo Index hỗn hợp: Tìm theo người gửi/nhận VÀ sắp xếp theo ngày giảm dần
        // IncludeProperties (nếu dùng SQL Server) để query không cần về bảng chính (Covering Index)
        entity.HasIndex(t => new { t.UserId, t.ReceiverUserId, t.CreateAt })
              .HasDatabaseName("IX_Transactions_History_Search")
              .IsDescending(false, false, true) // Date giảm dần
              .IncludeProperties(t => new { t.Amount, t.Description });
    });
    }
    }