using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Soundboard.Server;
using Soundboard.Server.Hubs;
using Soundboard.Server.Model;
using Soundboard.Server.Services;

namespace Soundboard.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class RegistrationController : ControllerBase
    {
        private readonly IRegistrationService _registration;

        public RegistrationController(IRegistrationService registrationService)
        {
            _registration = registrationService;
        }

        [HttpPut]
        public async Task Register(Registration player)
        {
            await _registration.RegisterAsync(player);
        }

        [HttpDelete]
        public async Task Unregister(string id)
        {
            await _registration.UnregisterAsync(id);
        }

        [HttpGet]
        public IEnumerable<Registration> GetAll()
        {
            return _registration.GetRegistrations();
        }

        [HttpGet]
        public Registration GetActive()
        {
            return _registration.GetActiveRegistration();
        }

        [HttpPut]
        public async Task SetActive(string id)
        {
            await _registration.SetActiveAsync(id);
        }
    }
}
