using System.Collections.Generic;
using System.Threading.Tasks;
using Soundboard.Server.Model;

namespace Soundboard.Server.Services
{
    public interface IRegistrationService
    {
        Task RegisterAsync(Registration player);
        Task UnregisterAsync(string id);
        IEnumerable<Registration> GetRegistrations();
        Task SetActiveAsync(string id);
        Registration GetActiveRegistration();
    }
}
