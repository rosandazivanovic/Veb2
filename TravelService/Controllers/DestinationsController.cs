using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelService.DTOs;
using TravelService.Filters;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/destinations")]
    [AllowAnonymous]
    [TypeFilter(typeof(SharedTokenOrJwtFilter))]
    public class DestinationsController : ControllerBase
    {
        private readonly DestinationService _service;

        public DestinationsController(DestinationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
        {
            var destinations = await _service.GetAll(planId);
            return Ok(destinations);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateDestinationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti prije datuma dolaska." });

            var destination = await _service.Create(planId, dto);
            return CreatedAtAction(nameof(GetAll), new { planId }, destination);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateDestinationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti prije datuma dolaska." });

            var destination = await _service.Update(id, dto);
            if (destination == null) return NotFound();
            return Ok(destination);
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