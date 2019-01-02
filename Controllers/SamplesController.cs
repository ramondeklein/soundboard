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
    public class SamplesController : ControllerBase
    {
        private readonly ISamplesService _samplesService;

        public SamplesController(ISamplesService samplesService)
        {
            _samplesService = samplesService;
        }

        [HttpGet]
        public IEnumerable<Sample> GetAll()
        {
            return _samplesService.GetSamples();
        }

        [HttpGet]
        public ActionResult<Stream> GetStream([FromQuery(Name = "id")] string id)
        {
            // TODO: Make sure this one will be cached
            try
            {
                var sampleFile = _samplesService.GetSampleFile(id);
                return File(System.IO.File.OpenRead(sampleFile), "audio/mpeg");
            }
            catch (SampleNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task Scan()
        {
            await _samplesService.ScanAsync();
        }

        public class IdClass { public string Id; }

        [HttpPost]
        public async Task<ActionResult> MarkAsPlayed(IdClass id)
        {
            try
            {
                await _samplesService.MarkSampleAsPlayedAsync(id.Id);
                return Ok();
            }
            catch (SampleNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
