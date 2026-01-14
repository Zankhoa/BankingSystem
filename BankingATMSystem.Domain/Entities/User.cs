using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankingATMSystem.Domain.Entities
{
    public class User
    {
        [Key]
        public string Id { get; set;}

        //so tai khoan
        [Required]
        [MaxLength(20)]
        public string AccountNumber { get; set;}
        
        //so du tai khoan
        [Column(TypeName = "decimal(19, 4)")]
        public decimal Balance { get; set;}
        public string Name { get; set;}
        public string Phone { get; set;}
        public string Email { get; set;}
        public UserAccount UserAccount { get; set; }

        [Timestamp] // Dung cho optimistic concurrency (chong ghi de)
        public byte[] RowVersion { get; set;}

    }
}
