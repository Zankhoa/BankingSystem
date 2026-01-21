
using BankingATMSystem.Application.Common.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace BankingATMSystem.Infrastructure.Security
{
    public class RsaService 
    {
        private readonly RSA _rsa;
        public RsaService()
        {
            _rsa = RSA.Create(2048); //tao key 2048 bit
        }
        public string GetPublicKey()
        {
            var publicKey = _rsa.ExportSubjectPublicKeyInfo();
            var base64Key = Convert.ToBase64String(publicKey);
            return ChunkString(base64Key, 64);
        }

        public string Decrypt(string encryptedText)
        {
            var dataToDecrypt = Convert.FromBase64String(encryptedText);
            var decryptedData = _rsa.Decrypt(dataToDecrypt, RSAEncryptionPadding.Pkcs1);
            return Encoding.UTF8.GetString(decryptedData);
        }

        private string ChunkString(string str, int chunkSize)
        {
            return string.Join("\n", Enumerable.Range(0, str.Length / chunkSize + 1)
                .Select(i => i * chunkSize).Where(i => i < str.Length)
                .Select(i => str.Substring(i, Math.Min(chunkSize, str.Length - i))));
        }

    }
}
