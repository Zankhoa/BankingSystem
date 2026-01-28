using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Application.Common.Service;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Middleware
{
    public class IdempotencyBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : IIdempotent
    {
        private readonly IIdempotencyService _idempotencyService;
        public IdempotencyBehavior(IIdempotencyService idempotencyService)
        {
            _idempotencyService = idempotencyService;
        }
        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            //kiem tra xem requestId da duoc xu ly chua
            if (await _idempotencyService.ExistsAsync(request.requestId))
            {
                throw new Exception("Giao dịch này đã được thực hiện rồi.");
            }
            // 2. Nếu chưa, cho phép chạy tiếp vào TransferHandler
            var response = await next();
            // sau khi chay xong , neu thanh cong yhi luu request lai
            //ktra response co phai la success khong
            var isSuccessProperty = typeof(TResponse).GetProperty("IsSuccess");
            if (isSuccessProperty != null)
            {
                var isSuccess = (bool)isSuccessProperty.GetValue(response);
                if (isSuccess)
                {
                    await _idempotencyService.CreateAsync(request.requestId);
                }
            }
            return response;
        }
    }
}
