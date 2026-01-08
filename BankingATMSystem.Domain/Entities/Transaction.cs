using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankingATMSystem.Domain.Entities
{
    public class Transaction
    {
        [Key]
        public int Id { get; set; }
        public string AccountId { get; set; }
        [ForeignKey("AccountId")]
        public Account Account { get; set; }
        [Column(TypeName = "decimal(19, 4)")]
        public decimal Amount { get; set; }
        [Required]
        [MaxLength(20)]
        public string TransactionType { get; set; }
        public DateTime CreateAt { get; set; }
        [MaxLength(100)]
        public string? Description { get; set; }
    }
}
