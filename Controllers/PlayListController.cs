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
    public class PlayListController : ControllerBase
    {
        private readonly ISamplesService _samplesService;

        public PlayListController(ISamplesService samplesService)
        {
            _samplesService = samplesService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<QueuedSample>> GetAll()
        {
            var queuedSamples = _samplesService.GetAllEnqueued();
            return Ok(queuedSamples);
        }

        [HttpPost]
        public async Task<ActionResult> Enqueue(QueuedSample queuedSample)
        {
            try
            {
                await _samplesService.EnqueueSampleAsync(queuedSample);
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
            var poppedSample = await _samplesService.PopSampleAsync();
            if (poppedSample == null)
                return NoContent();

            return Ok(poppedSample);
        }

        [HttpDelete]
        public async Task<ActionResult> Clear()
        {
            await _samplesService.ClearPlayListAsync();
            return Ok();
        }
    }
}
