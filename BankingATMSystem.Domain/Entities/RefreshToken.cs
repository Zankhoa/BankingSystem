

namespace BankingATMSystem.Domain.Entities
{
    public class RefreshToken
    {
        public string Id { get; set; }
        public string Token { get; set; }
        public DateTime Expires { get; set; }
        public DateTime Created { get; set; }
        public string? CreatedByIp { get; set; }
        public DateTime? Revoked { get; set; } // Thời điểm bị hủy (nếu có)
        public string? RevokedByIp { get; set; }
        public string? ReplacedByToken { get; set; } //token moi thay the token nay
        //public bool IsRevoked { get; set; } // danh dau neu token bi huy
        public string UserId { get; set; }

        public bool IsExpired => DateTime.UtcNow >= Expires;
        public bool IsRevoked => Revoked != null; // danh dau neu token bi huy
        public bool IsActive => !IsRevoked && !IsExpired;


    }
}
