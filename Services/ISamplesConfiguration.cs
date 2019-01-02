namespace Soundboard.Server.Services
{
    public interface ISamplesConfiguration 
    {
        string SamplesRoot { get; }
        string Database { get; }
    }
}
