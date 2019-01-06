using System.Collections.Generic;
using System.Threading.Tasks;
using Soundboard.Server.Model;

namespace Soundboard.Server.Services
{
    public interface ISamplesService
    {
        Task ScanAsync();
        IEnumerable<Sample> GetSamples();
        IEnumerable<QueuedSample> GetAllEnqueued();
        Task EnqueueSampleAsync(QueuedSample sample);
        Task<QueuedSample> PopSampleAsync();
        
        Task ClearPlayListAsync();
        string GetSampleFile(string id);
        Task MarkSampleAsPlayedAsync(string id);
    }
}
