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
            var userAccount = await _context.UserAccount.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);
            if (userAccount == null)
            {
                throw new Exception("Không tìm thấy người dùng");
            }
            var users = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userAccount.UserId, cancellationToken);
            if (users == null) throw new Exception("khong tim thay nguoi dung");
            //dong goi ket qua tra ve
            return new UserInfoDTO
            {
                UserName = users.Name,
                Balance = users.Balance
            };
        }
    }
}


