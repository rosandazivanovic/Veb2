using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelService.DTOs;
using TravelService.Filters;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/activities")]
    [AllowAnonymous]
    [TypeFilter(typeof(SharedTokenOrJwtFilter))]
    public class ActivitiesController : ControllerBase
    {
        private readonly ActivityService _service;

        public ActivitiesController(ActivityService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
        {
            var activities = await _service.GetAll(planId);
            return Ok(activities);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateActivityDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EstimatedCost < 0)
                return BadRequest(new { message = "Procijenjeni trošak ne može biti negativan." });

            var activity = await _service.Create(planId, dto);
            return CreatedAtAction(nameof(GetAll), new { planId }, activity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateActivityDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EstimatedCost < 0)
                return BadRequest(new { message = "Procijenjeni trošak ne može biti negativan." });

            var activity = await _service.Update(id, dto);
            if (activity == null) return NotFound();
            return Ok(activity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}