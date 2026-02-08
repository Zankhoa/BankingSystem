using BankingATMSystem.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Transfer
{
    public class CheckPinHandler : IRequestHandler<CheckPinCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        public CheckPinHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<bool> Handle(CheckPinCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.UserAccount.Id == request.userId);
            if (user.PinHash == null) return false;
            return true;
        }
    }
}
