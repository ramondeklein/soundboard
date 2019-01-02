using System.Collections.Generic;
using Soundboard.Server.Model;

namespace Soundboard.Server.Services
{
    public interface ISamplesService
    {
        void Scan();
        IEnumerable<Sample> GetSamples();
        void EnqueueSample(QueuedSample sample);
        QueuedSample PopSample();
        void ClearPlayList();
        string GetSampleFile(string id);
        Sample MarkSampleAsPlayed(string id);
    }
}
