using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelService.DTOs;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans")]
    [Authorize]
    public class TravelPlansController : ControllerBase
    {
        private readonly TravelPlanService _service;

        public TravelPlansController(TravelPlanService service)
        {
            _service = service;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value ?? "user";

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (GetUserRole() == "admin")
            {
                var allPlans = await _service.GetAllForAdmin();
                return Ok(allPlans);
            }

            var plans = await _service.GetAll(GetUserId());
            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _service.GetById(id, GetUserId(), GetUserRole());
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTravelPlanDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti prije početnog." });

            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan." });

            var plan = await _service.Create(dto, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTravelPlanDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti prije početnog." });

            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan." });

            var plan = await _service.Update(id, dto, GetUserId(), GetUserRole());
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id, GetUserId(), GetUserRole());
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("internal/by-user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteAllForUser(int userId, [FromServices] IConfiguration config)
        {
            var secret = Request.Headers["X-Internal-Secret"].ToString();
            var expected = config["InternalServiceSecret"];

            if (string.IsNullOrEmpty(expected) || secret != expected)
                return Unauthorized();

            await _service.DeleteAllForUser(userId);
            return NoContent();
        }
    }
}