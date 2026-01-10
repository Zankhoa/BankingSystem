using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BankingATMSystem.Application.Features.Auth
{
    public class LoginHandler : IRequestHandler<LoginCommand, LoginResponse>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public LoginHandler(IApplicationDbContext context, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users.Include(x => x.RefreshTokens).FirstOrDefaultAsync(u => u.Username == request.userName, cancellationToken);

            //1 check tai khan co ton tai hay khong
            if (user == null) throw new Exception("tai khoan hong ton tai");

            //2 check khoa tai khoan
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                throw new Exception("tai khoan da bi khoa vui long lien he voi ngan hang de mo lai!");
            }
            //3 verify password
            if(!_passwordHasher.Verify(request.Password, user.PassordHash))
            {
                user.accesssFailesCount++;
                if(user.accesssFailesCount >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddHours(3); 
                    user.accesssFailesCount = 0;
                }
                await _context.SaveChangesAsync(cancellationToken);
                throw new Exception("Tài khoản mat khau cua ban khong dung. Neu nhap qua 5 lan se bi khoa tai khoan!");
            }
            //4 dang nhap thnh cong
            user.accesssFailesCount = 0;
            user.LockoutEnd = null;
            
            //5 tao token
            var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken(request.IdAddress);

            //6 xoay vog Token(revoke cac token cu cua ip nay hoac giu lai tuy policy)
            //o day minh cai moi vao
            user.RefreshTokens.Add(refreshToken);

            await _context.SaveChangesAsync(cancellationToken);
            return new LoginResponse(accessToken, refreshToken.Token, refreshToken.Expires);
        }
    }
}
