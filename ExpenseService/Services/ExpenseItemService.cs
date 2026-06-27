using ExpenseService.Data;
using ExpenseService.DTOs;
using ExpenseService.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseService.Services
{
    public class ExpenseItemService
    {
        private readonly AppDbContext _context;

        public ExpenseItemService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ExpenseResponseDto>> GetAll(int planId)
        {
            return await _context.Expenses
                .Where(e => e.TravelPlanId == planId)
                .OrderBy(e => e.Date)
                .Select(e => MapToDto(e))
                .ToListAsync();
        }

        public async Task<ExpenseResponseDto> Create(int planId, CreateExpenseDto dto)
        {
            var expense = new Expense
            {
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description ?? string.Empty,
                TravelPlanId = planId
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return MapToDto(expense);
        }

        public async Task<ExpenseResponseDto?> Update(int id, CreateExpenseDto dto)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return null;

            expense.Name = dto.Name;
            expense.Category = dto.Category;
            expense.Amount = dto.Amount;
            expense.Date = dto.Date;
            expense.Description = dto.Description ?? string.Empty;

            await _context.SaveChangesAsync();
            return MapToDto(expense);
        }

        public async Task<bool> Delete(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return false;

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task DeleteAllForPlan(int planId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TravelPlanId == planId)
                .ToListAsync();

            _context.Expenses.RemoveRange(expenses);
            await _context.SaveChangesAsync();
        }

      
        public async Task<decimal> GetTotalSpent(int planId)
        {
            return await _context.Expenses
                .Where(e => e.TravelPlanId == planId)
                .SumAsync(e => e.Amount);
        }

        private static ExpenseResponseDto MapToDto(Expense e) => new()
        {
            Id = e.Id,
            Name = e.Name,
            Category = e.Category,
            Amount = e.Amount,
            Date = e.Date,
            Description = e.Description
        };
    }
}