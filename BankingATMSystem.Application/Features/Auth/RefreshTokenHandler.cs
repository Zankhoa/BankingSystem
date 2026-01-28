using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Auth
{
    //command nhan vao token tu cookie
    public record RefreshTokenCommand(string RefreshToken, string IpAdress) : IRequest<RefreshToken>;
    public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, RefreshToken>
    {
        private readonly IApplicationDbContext _context;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        public RefreshTokenHandler(IApplicationDbContext context, IJwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
        }
        public async Task<RefreshToken> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            //tim token trong db 
            var storedToken = await _context.RefreshToken.SingleOrDefaultAsync(u => u.Token == request.RefreshToken, cancellationToken);
            if (storedToken == null) throw new InvalidOperationException("Invalid Token");
            if (storedToken.isRevoked) throw new InvalidOperationException("Token has been revoked");

            //reuse dection
            if (storedToken.IsUsed)
            {
                //lay tat ca token cua user nay
                var allUserToken = await _context.RefreshToken.Where(x => x.UserAccountId == storedToken.UserAccountId).ToListAsync(cancellationToken);
                foreach (var userToken in allUserToken)
                {
                    userToken.isRevoked = true;
                }
                throw new Exception("Token reused. All sesions revoked");
            }
            if (storedToken.Expires < DateTime.UtcNow) throw new InvalidOperationException("Token expired");
            //rotation
            //danh dau token cu la da dung
            storedToken.IsUsed = true;
            //tao token moi (acc + fre)
            var userAccount = await _context.UserAccount.FirstOrDefaultAsync(x => x.Id == storedToken.UserAccountId, cancellationToken);
            var accessToken = _jwtTokenGenerator.GenerateAccessToken(userAccount);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken(request.IpAdress, storedToken.UserAccountId);
            await _context.SaveChangesAsync(cancellationToken);
            return new RefreshToken
            {
                NewAccessToken = accessToken,
                NewRefreshTokenExpiry = refreshToken.Expires,
                NewRefreshToken = refreshToken.Token,
                NewAccessTokenExpiry = DateTime.UtcNow.AddMinutes(15)
            };
        }
    }
}
