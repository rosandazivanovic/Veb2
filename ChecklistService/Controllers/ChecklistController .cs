using ChecklistService.DTOs;
using ChecklistService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChecklistService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/checklist")]
    [AllowAnonymous]
    public class ChecklistController : ControllerBase
    {
        private readonly ChecklistItemService _service;

        public ChecklistController(ChecklistItemService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
        {
            var items = await _service.GetAll(planId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateChecklistItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var item = await _service.Create(planId, dto);
            return CreatedAtAction(nameof(GetAll), new { planId }, item);
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(int id)
        {
            var item = await _service.Toggle(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAllForPlan(int planId,
            [FromServices] IConfiguration config)
        {
            var secret = Request.Headers["X-Internal-Secret"].ToString();
            var expected = config["InternalServiceSecret"];

            if (string.IsNullOrEmpty(expected) || secret != expected)
                return Unauthorized();

            await _service.DeleteAllForPlan(planId);
            return NoContent();
        }
    }
}