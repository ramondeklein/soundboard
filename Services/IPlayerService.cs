using System.Collections.Generic;
using System.Threading.Tasks;
using Soundboard.Server.Model;

namespace Soundboard.Server.Services
{
    public interface IPlayerService
    {
        Task RegisterAsync(Player player);
        Task UnregisterAsync(string id);
        IEnumerable<Player> GetPlayers();
        Task SetActivePlayerAsync(string id);
        Player GetActivePlayer();
    }
}
