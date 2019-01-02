using System;
using System.IO;
using System.Security.Cryptography;

namespace Soundboard.Server.Services
{
    public class MD5Hasher : IHasher
    {
        public string GetHashFromFile(string path)
        {
            using (var hasher = MD5.Create())
            using (var file = File.OpenRead(path))
            {
                var hashBytes = hasher.ComputeHash(file);
                return Convert.ToBase64String(hashBytes);
            }
        }
    }
}
