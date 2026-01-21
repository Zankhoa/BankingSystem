using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankingATMSystem.Domain.Entities
{
    public class Transactions
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public Users User { get; set; }
        [Column(TypeName = "decimal(19, 4)")]
        public decimal Amount { get; set; }
        [Required]
        [MaxLength(20)]
        public string TransactionType { get; set; }
        public string ReceiverUserId { get; set; }
        public DateTime CreateAt { get; set; }
        [MaxLength(100)]
        public string? Description { get; set; }
    }
}
