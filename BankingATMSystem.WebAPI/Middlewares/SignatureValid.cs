using StackExchange.Redis;
using System.IO;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BankingATMSystem.WebAPI.Middlewares
{
    public class SignatureValid
    {
        private readonly RequestDelegate _next;
        private readonly IConnectionMultiplexer _redis;

        public SignatureValid(RequestDelegate next, IConnectionMultiplexer redis)
        {
            _next = next;
            _redis = redis;

        }
        public async Task Invoke(HttpContext context)
        
        {
            string path = context.Request.Path.Value?.ToLower() ?? "";
            if (path.Contains("/login") ||
                path.Contains("/register") ||
                path.Contains("/refresh-token"))
            {
                await _next(context);
                return;
            }
            //check method post
            if (context.Request.Method == "GET")
            {
                await _next(context);
                return;
            }
            //lay userId tu accesstoke tu auth middleware
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                context.Response.StatusCode = 401;
                return;
            }
            //lay header signature
            if (!context.Request.Headers.TryGetValue("X-Signature", out var clientSignature))
            {
                context.Response.StatusCode = 400;
                return;
            }
            //lay secret tu redis
            var secret = await _redis.GetDatabase().StringGetAsync($"secret:{userId}");
            if (secret.IsNullOrEmpty)
            {
                context.Response.StatusCode = 403;
                return;
            }
            //hash body va so sanh
            context.Request.EnableBuffering();
            var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
            context.Request.Body.Position = 0;

            var severSig = ComputeHmac(body, secret);
            if (severSig != clientSignature)
            {
                context.Response.StatusCode = 403;
                return;
            }
            await _next(context);
        }
        private string ComputeHmac(string message, string secretKey)
        {
            //1 doi scret key sang dang byte
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            //2 chuyen doi noi dung body sang dangbyte
            var messageBytes = Encoding.UTF8.GetBytes(message);
            //3 tao thuan toan hmcsha256
            using (var hmac = new HMACSHA256(keyBytes))
            {
                //tinh toan hash
                var hashByte = hmac.ComputeHash(messageBytes); ;
                //chuyen byte thanh hẽ de so sanh
                return Convert.ToHexString(hashByte).ToLower();
            }
        }
    }
}
