using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using BCrypt.Net;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Auth
{
    public class RegisterHandler : IRequestHandler<RegisterCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        public RegisterHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<bool> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            //1 kiem tra xem co trung lap username va email
            var exists = await _context.Users.AnyAsync(x => x.Name == request.Username || x.Email == request.Email, cancellationToken);
            if (exists) throw new Exception("Tai khoan hoac email da ton tai!");

            //2 bat dau transaction
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                //tao user
                var userId = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "");

                //tao so tai khoan 
                var randomAccNum = new Random().NextInt64(1000000000, 9999999999).ToString();
                var user = new Users
                {
                    Id = userId,
                    Name = request.Username.ToUpper(),
                    //HashPassword(khong luu plain text)
                    Email = request.Email,
                    AccountNumber = randomAccNum,
                    PinHash = "",
                    Phone = request.Phone,
                    Balance = 0
                };
                _context.Users.Add(user);

                var accountId = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "");
                //b Tạo tai khoan
                if (userId != accountId)
                {
                    var account = new UserAccount
                    {
                        Id = accountId,
                        Username = request.Username.ToUpper(),
                        PassordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(request.Password),
                        Role = "User",
                        UserId = userId,
                        IsActive = false,
                        accesssFailesCount = 0,
                        LockoutEnd = null
                    };
                    _context.UserAccount.Add(account);

                    //luu tat ca xuong db
                    await _context.SaveChangesAsync(cancellationToken);

                    //commmit
                    await transaction.CommitAsync(cancellationToken);
                }
                return true;
            }
            catch (Exception)
            {
                // Có lỗi thì hoàn tác sạch sẽ
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }


        }
    }
}
