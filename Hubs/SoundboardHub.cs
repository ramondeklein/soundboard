using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Soundboard.Server.Hubs
{
    public class SoundboardHub : Hub
    {
        public async Task EnqueueSample(string category, string title, string id)
        {
            await Clients.All.SendAsync("sampleEnqueued", new {
                category = category,
                title = title,
                id = id
            });
        }
    }
}
