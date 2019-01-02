namespace Soundboard.Server.Services
{
    public interface IHasher
    {
        string GetHashFromFile(string path);
    }
}
