

namespace BankingATMSystem.Domain.Entities
{
    public class RefreshToken
    {
        public string Id { get; set; }
        public string Token { get; set; }
        public DateTime Expires { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedByIp { get; set; }
        public string UserAccountId { get; set; }



    }
}
