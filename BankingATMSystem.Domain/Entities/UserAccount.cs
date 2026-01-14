using System.ComponentModel.DataAnnotations;

namespace BankingATMSystem.Domain.Entities
{
    public class UserAccount
    {
        [Key]   
        public string Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; }    

        [Required]
        public string PassordHash {  get; set; }

        [MaxLength(100)]
        public string Role {  get; set; }

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        //security fields - chong brute force
        public int accesssFailesCount { get; set; } //dem so lan sai
        public DateTime? LockoutEnd { get; set; } // thoi gian mo khoa
        public bool IsActive { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}
