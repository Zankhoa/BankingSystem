

using BankingATMSystem.Application.Common.Interfaces;
using BankingATMSystem.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BankingATMSystem.Infrastructure.Security
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public string GenerateAccessToken(UserAccount user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSetting:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSetting:Issuer"],
                audience: _configuration["JwtSettings: Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // access token chi song 15p
                signingCredentials: creds 
                );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public RefreshToken GenerateRefreshToken(string ipAddress)
        {
            //su dung rng de tao chuoi ngau nhien an tan tuyet doi
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                Expires = DateTime.UtcNow.AddDays(7),//token song trong 7 ngay
                CreatedByIp = ipAddress,
            };
        }

    }
}
