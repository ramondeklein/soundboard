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
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class PlayListController : ControllerBase
    {
        private readonly ISamplesService _samplesService;
        private readonly IHubContext<SoundboardHub> _hubContext;

        public PlayListController(ISamplesService samplesService, IHubContext<SoundboardHub> hubContext)
        {
            _samplesService = samplesService;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<ActionResult> Enqueue(QueuedSample queuedSample)
        {
            try
            {
                _samplesService.EnqueueSample(queuedSample);
                await _hubContext.Clients.All.SendAsync("enqueued", queuedSample);
                return Ok();
            }
            catch (SampleNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<ActionResult<QueuedSample>> Pop()
        {
            var poppedSample = _samplesService.PopSample();
            if (poppedSample == null)
                return NotFound();

            await _hubContext.Clients.All.SendAsync("popped", poppedSample);
            return Ok(poppedSample);
        }

        [HttpPost]
        public async Task<ActionResult> Clear()
        {
            _samplesService.ClearPlayList();
            await _hubContext.Clients.All.SendAsync("clearPlayList");
            return Ok();
        }

        [HttpPost]
        public async Task<ActionResult> MarkAsPlayed(QueuedSample queuedSample)
        {
            try
            {
                var sample = _samplesService.MarkSampleAsPlayed(queuedSample.SampleId);
                await _hubContext.Clients.All.SendAsync("update", sample);
                return Ok();
            }
            catch (SampleNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
