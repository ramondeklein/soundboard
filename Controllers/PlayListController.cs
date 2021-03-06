﻿using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
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

        [HttpPost]
        public async Task<ActionResult> PlayStarted(QueuedSample queuedSample)
        {
            await _samplesService.PlayingStarted(queuedSample);
            return Ok();
        }

        [HttpPost]
        public async Task<ActionResult> PlayFinished(QueuedSample queuedSample)
        {
            await _samplesService.MarkSampleAsPlayedAsync(queuedSample.SampleId);
            await _samplesService.PlayingFinished(queuedSample);
            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> Clear()
        {
            await _samplesService.ClearPlayListAsync();
            return Ok();
        }
    }
}
