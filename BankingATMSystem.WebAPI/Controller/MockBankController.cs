using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace BankingATMSystem.WebAPI.Controller
{
    [ApiController]
    [Route("api/mock-bank")]
    public class MockBankController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _webhookSecret = "Key_Security-63839dkdkldjaud7e9kkvnonve79vovk"; // Khớp với Middleware

        public MockBankController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("payout")]
        [AllowAnonymous]
        public async Task<IActionResult> Payout([FromBody] ExternalTransferRequest request)
        {
            if (request.Amount <= 0) return BadRequest("Số tiền không hợp lệ.");
            bool simulateFailure = (request.Amount == 999);

            string status = simulateFailure ? "FAILED" : "SUCCESS";
            string note = simulateFailure ? "Số dư ngân hàng đối tác không đủ" : "Chuyển tiền thành công qua NAPAS";

            // 2. Trả về 202 Accepted ngay lập tức
            _ = Task.Run(async () =>
            {
                await Task.Delay(5000); // Đợi 5s để bạn kịp nhìn thấy trạng thái "Processing" trên giao diện
                await CallbackWebhook(request.TransactionExternalId, status, note, request.ToAccount, request.Amount);
            });

            return Accepted(new { status = "Processing", message = "Yêu cầu đã được gửi sang cổng thanh toán." });
        }

        private async Task CallbackWebhook(string txnId, string status, string note, string fromAccountNumber, decimal money)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();

                // 1. Tạo data duy nhất
                var payload = new
                {
                    TransactionExtenalId = txnId,
                    Amount = money,
                    AccountNumber = fromAccountNumber,
                    Status = status,
                    Message = note
                };
                string signature = GenerateSignature(payload);
                var jsonContent = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, "https://localhost:7046/api/webhooks/bank/callback");
                request.Content = content;

                // 2. THÊM HEADER VÀO REQUEST (Không thêm vào content nữa)
                request.Headers.Add("X-Webhook-Signature", signature);

                // 3. GỬI REQUEST ĐI BẰNG SendAsync
                var response = await client.SendAsync(request); 

                if (response.IsSuccessStatusCode)
                    Console.WriteLine($"[MockBank] Webhook SENT: {txnId} | Status: {status} | Signature: {signature.Substring(0, 8)}...");
                else
                    Console.WriteLine($"[MockBank Error] Webhook FAILED with code: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MockBank Critical Error]: {ex.Message}");
            }
        }

        private string GenerateSignature(object data)
        {
            var json = JsonSerializer.Serialize(data);
            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(_webhookSecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(json));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
    //content.Headers.Add("X-Webhook-Signature", signature);

    //// Gọi về Webhook của bạn
    //var response = await client.PostAsJsonAsync("https://localhost:7046/api/webhooks/bank/callback", content);
    public record ExternalTransferRequest(string TransactionExternalId, decimal Amount, string ToAccount, string message);
}