using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BankingATMSystem.Application.Features.Auth
{
    public class GetUserInfoHandler : IRequestHandler<GetUserInforCommand, UserInfoDTO>
    {
        private readonly IApplicationDbContext _context;
        public GetUserInfoHandler(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<UserInfoDTO> Handle(GetUserInforCommand request, CancellationToken cancellationToken)
        {
            //tim user 
            var user = await _context.UserAccount.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng");
            }
            //dong goi ket qua tra ve
            return new UserInfoDTO
            {
                UserName = user.Username
            };
        }
    }
}


