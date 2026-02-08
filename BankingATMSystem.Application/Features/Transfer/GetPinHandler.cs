using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Features.Transfer
{
    public class GetPinHandler : IRequestHandler<GetPinCommand, string>
    {
        private readonly IApplicationDbContext _context;
        private readonly IPinHash _pinHash;
        public GetPinHandler(IApplicationDbContext context, IPinHash pinHash)
        {
            _context = context;
            _pinHash = pinHash;
        }
        public async Task<string> Handle(GetPinCommand request, CancellationToken cancellationToken)
        {
            try
            {
                string message = "";
                var user = await _context.Users.Include(x => x.UserAccount).FirstOrDefaultAsync(x => x.UserAccount.Id == request.UserAccountId, cancellationToken);
                var pinHashed = _pinHash.Hash(request.PinHash);
                var updatePin = new Users
                {
                    PinHash = pinHashed,
                };
                await _context.SaveChangesAsync(cancellationToken);
                return message = "Khoa oke";
            } 
            catch(Exception ex) 
            {
                throw new Exception("khoa oke");
            }
        }
    }
}
