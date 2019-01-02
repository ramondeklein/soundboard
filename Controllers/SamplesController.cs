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
    public class SamplesController : ControllerBase
    {
        private readonly ISamplesService _samplesService;
        private readonly IHubContext<SoundboardHub> _hubContext;

        public SamplesController(ISamplesService samplesService, IHubContext<SoundboardHub> hubContext)
        {
            _samplesService = samplesService;
            _hubContext = hubContext;
        }

        [HttpGet]
        public IEnumerable<Sample> GetSamples()
        {
            return _samplesService.GetSamples();
        }

        [HttpGet()]
        public ActionResult<Stream> GetSample([FromQuery(Name = "id")] string id)
        {
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
        public void Scan()
        {
            _samplesService.Scan();
        }
    }
}
