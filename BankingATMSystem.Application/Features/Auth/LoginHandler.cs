using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;
using System.Security.Cryptography;

namespace BankingATMSystem.Application.Features.Auth
{
    public class LoginHandler : IRequestHandler<LoginCommand, LoginResponse>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IConnectionMultiplexer _redis;

        public LoginHandler(IApplicationDbContext context, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator, IConnectionMultiplexer redis)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
            _redis = redis;
        }

        public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var userAccount = await _context.UserAccount.Include(x => x.RefreshTokens).FirstOrDefaultAsync(u => u.Username == request.userName, cancellationToken);

            //1 check tai khan co ton tai hay khong
            if (userAccount == null) throw new Exception("tai khoan hong ton tai");

            //2 check khoa tai khoan
            if (userAccount.LockoutEnd.HasValue && userAccount.LockoutEnd.Value > DateTime.UtcNow)
            {
                throw new Exception("tai khoan da bi khoa vui long lien he voi ngan hang de mo lai!");
            }
            //3 verify password
            //var hashPassword = _passwordHasher.Hash(request.Password);

            if (!_passwordHasher.Verify(request.Password, userAccount.PassordHash))
            {
                userAccount.accesssFailesCount++;
                if (userAccount.accesssFailesCount >= 5)
                {
                    userAccount.LockoutEnd = DateTime.UtcNow.AddHours(3);
                    userAccount.accesssFailesCount = 0;
                }
                await _context.SaveChangesAsync(cancellationToken);
                throw new Exception("Tài khoản mat khau cua ban khong dung. Neu nhap qua 5 lan se bi khoa tai khoan!");
            }
            //4 dang nhap thnh cong
            userAccount.accesssFailesCount = 0;
            userAccount.LockoutEnd = null;
            
            //5 tao token
            var accessToken = _jwtTokenGenerator.GenerateAccessToken(userAccount);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken(request.IdAddress, userAccount.Id);

            //tao session secret key cho signature
            //key nay se duoc luu vao redis, front end ung no de ky cac request tiep theo
            var sessionSecret = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            var redisKey = $"secret:{userAccount.Id}";
            var db = _redis.GetDatabase();
            await db.StringSetAsync(redisKey, sessionSecret, TimeSpan.FromMinutes(15));
            

            ////6 xoay vog Token(revoke cac token cu cua ip nay hoac giu lai tuy policy)
            ////o day minh cai moi vao
            //userAccount.RefreshTokens.Add(refreshToken);

            await _context.SaveChangesAsync(cancellationToken);
            return new LoginResponse(accessToken, refreshToken.Token, refreshToken.Expires, sessionSecret);
        }   
    }
}
