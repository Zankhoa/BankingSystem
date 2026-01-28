using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Common.Models;
using BankingATMSystem.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.UserInfo
{
    public class GetUserHandler : IRequestHandler<GetUserCommand, UserResponse>
    {
        private IApplicationDbContext _context;
        public GetUserHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<UserResponse> Handle(GetUserCommand request, CancellationToken cancellationToken)
        {
            var users = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.AccountNumber == request.AccountNumber, cancellationToken);
            if (users == null) throw new Exception("Dont user exist");
            return new UserResponse
            {
              userName = users.Name
            };
        }

    }
}
