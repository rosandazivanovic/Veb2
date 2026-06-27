using ExpenseService.DTOs;
using ExpenseService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{planId}/expenses")]
    [AllowAnonymous]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseItemService _service;

        public ExpensesController(ExpenseItemService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int planId)
        {
            var expenses = await _service.GetAll(planId);
            return Ok(expenses);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int planId, [FromBody] CreateExpenseDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Amount < 0)
                return BadRequest(new { message = "Iznos troška ne može biti negativan." });

            var expense = await _service.Create(planId, dto);
            return CreatedAtAction(nameof(GetAll), new { planId }, expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateExpenseDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Amount < 0)
                return BadRequest(new { message = "Iznos troška ne može biti negativan." });

            var expense = await _service.Update(id, dto);
            if (expense == null) return NotFound();
            return Ok(expense);
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

        [HttpGet("total")]
        public async Task<IActionResult> GetTotalSpent(int planId,
            [FromServices] IConfiguration config)
        {
            var secret = Request.Headers["X-Internal-Secret"].ToString();
            var expected = config["InternalServiceSecret"];

            if (string.IsNullOrEmpty(expected) || secret != expected)
                return Unauthorized();

            var total = await _service.GetTotalSpent(planId);
            return Ok(new { totalSpent = total });
        }
    }
}