using BankingATMSystem.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Auth
{
    public class RegisterPinHandler : IRequestHandler<RegisterPinCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IPinHash _pinHash;
        private readonly IPasswordHasher _password;
        private IConnectionMultiplexer _redis;
        public RegisterPinHandler(IApplicationDbContext context, IJwtTokenGenerator jwtTokenGenerator, IPinHash pinHash, IPasswordHasher passwordHasher ,IConnectionMultiplexer redis)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
            _pinHash = pinHash;
            _redis = redis;
            _password = passwordHasher;
        }
        public async Task<bool> Handle(RegisterPinCommand request, CancellationToken cancellationToken)
        {
            
            var user = await _context.Users.FirstOrDefaultAsync(x => x.UserAccount.Id == request.userAccountId, cancellationToken);
            var passwordHash = await _context.UserAccount
                .Where(x => x.Id == request.userAccountId)
                .Select(x => x.PassordHash)
                .FirstOrDefaultAsync(cancellationToken); 
            if (user == null)
            {
                throw new Exception("khong co user");
            }
            if (!_password.Verify(request.Password, passwordHash))
            {
                throw new Exception("sai mat khau");
            }
            user.PinHash = _pinHash.Hash(request.Pin);
            _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
