using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelService.DTOs;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/shared-plans")]
    public class SharedPlansController : ControllerBase
    {
        private readonly SharedPlanService _service;
        private readonly TravelPlanService _travelPlanService;

        public SharedPlansController(SharedPlanService service, TravelPlanService travelPlanService)
        {
            _service = service;
            _travelPlanService = travelPlanService;
        }

        [HttpPost("{planId}")]
        [Authorize]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateSharedPlanDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.AccessType != "VIEW" && dto.AccessType != "EDIT")
                return BadRequest(new { message = "AccessType mora biti VIEW ili EDIT." });

            var result = await _service.Create(planId, dto);
            return Ok(result);
        }

        [HttpGet("{token}")]
        public async Task<IActionResult> GetByToken(string token)
        {
            var (plan, accessType, checklist) = await _service.GetByToken(token);
            if (plan == null)
                return Unauthorized(new { message = "Token nije validan ili je istekao." });

            return Ok(new
            {
                plan = new
                {
                    plan.Id,
                    plan.Title,
                    plan.Description,
                    plan.StartDate,
                    plan.EndDate,
                    plan.Budget,
                    plan.Notes,
                    destinations = plan.Destinations?.Select(d => new
                    {
                        d.Id,
                        d.Name,
                        d.Location,
                        d.ArrivalDate,
                        d.DepartureDate,
                        d.Description,
                        d.Notes
                    }),
                    activities = plan.Activities?.Select(a => new
                    {
                        a.Id,
                        a.Name,
                        a.Date,
                        a.Time,
                        a.Location,
                        a.Description,
                        a.EstimatedCost,
                        a.Status
                    }),
                    checklist = checklist.Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.IsCompleted
                    })
                },
                accessType
            });
        }
    }
}