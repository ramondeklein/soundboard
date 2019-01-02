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
    public class PlayerController : ControllerBase
    {
        private readonly IPlayerService _playerService;

        public PlayerController(IPlayerService playerService)
        {
            _playerService = playerService;
        }

        [HttpPut]
        public async Task Register(Player player)
        {
            await _playerService.RegisterAsync(player);
        }

        [HttpDelete]
        public async Task Unregister(string id)
        {
            await _playerService.UnregisterAsync(id);
        }

        [HttpPut]
        public async Task SetActive(string id)
        {
            await _playerService.SetActivePlayerAsync(id);
        }
        
        [HttpGet]
        IEnumerable<Player> GetAll() => _playerService.GetPlayers();
        
        [HttpGet]
        Player GetActive() => _playerService.GetActivePlayer();
    }
}
