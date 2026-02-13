using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace BankingATMSystem.WebAPI.Middlewares
{
    public class WebhookSignatureMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _secretKey;

        
  public WebhookSignatureMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _secretKey = configuration["BankSettings:WebhookSecret"];
        }
        public async Task InvokeAsync(HttpContext context)
        {
            //chi loc cac request gui den webhook
            if (context.Request.Path.StartsWithSegments("/api/webhooks"))
            {
                if (!context.Request.Headers.TryGetValue("X-Webhook-Signature", out var signatureValues))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("Security Violation: Missing Signature Header.");
                    return;
                }
                string receiveSignature = signatureValues.ToString();

                context.Request.EnableBuffering();
                using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;

                if (!string.IsNullOrEmpty(body))
                {
                    // Hash trực tiếp toàn bộ body vì lúc này body không chứa trường signature bên trong nữa
                    string computedSignature = ComputeHmac(body);

                    if (computedSignature != receiveSignature)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return;
                    }
                }
            }
            await _next(context);
        }
        private string ComputeHmac(string body)
        {
            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(_secretKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }
}
