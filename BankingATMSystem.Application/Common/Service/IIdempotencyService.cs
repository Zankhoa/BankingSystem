using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Application.Common.Service
{
    public interface IIdempotencyService
    {
        // Kiểm tra xem RequestId đã tồn tại chưa
        Task<bool> ExistsAsync(string requestId);

        // Lưu RequestId sau khi xử lý thành công (kèm thời gian hết hạn, ví dụ 24h)
        Task CreateAsync(string requestId);
    }
}
