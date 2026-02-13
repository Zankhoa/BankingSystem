using BankingATMSystem.Application.Common.Interfaces;
using System.Net.Http.Json;

namespace BankingATMSystem.Infrastructure.Service.Bank
{
    public class ExternalBankService : IExternalBankService
    {
        private readonly HttpClient _httpClient;

        // SỬA TẠI ĐÂY: Nhận HttpClient thay vì IHttpClientFactory
        public ExternalBankService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string> SendPayoutRequestAsync(ExternalTransferRequest request)
        {
            try
            {
                // Vì đã cấu hình BaseAddress trong Program.cs, bạn chỉ cần gọi path tương đối
                // Senior tip: Không nên dùng port 5173 (React), hãy dùng port WebAPI của bạn
                var response = await _httpClient.PostAsJsonAsync("api/mock-bank/payout", request);
       
                if (response.IsSuccessStatusCode)
                {
                    return "Success";
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[ExternalBank] API Error: {errorContent}");
                return "Failed";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExternalBank] Exception: {ex.Message}");
                return "Error";
            }
        }
    }
}