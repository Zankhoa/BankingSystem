using BankingATMSystem.Application.Common.Service;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BankingATMSystem.Infrastructure.Service
{
    public class IdempotencyService : IIdempotencyService
    {
        private readonly IConnectionMultiplexer _redis;
        public IdempotencyService(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }
        public async Task CreateAsync(string requestId)
        {
            var db = _redis.GetDatabase();
            var key = $"idempotency:{requestId}";
            //luu key nay trong 24 gio
            await db.StringSetAsync(key, "processed", TimeSpan.FromHours(24));
        }

        public async Task<bool> ExistsAsync(string requestId)
        {
            var db = _redis.GetDatabase();
            var key = $"idempotency:{requestId}";
            // Check key tồn tại
            return await db.KeyExistsAsync(key);
        }

    }
}
