using ChecklistService.Data;
using ChecklistService.DTOs;
using ChecklistService.Models;
using Microsoft.EntityFrameworkCore;

namespace ChecklistService.Services
{
    public class ChecklistItemService
    {
        private readonly AppDbContext _context;

        public ChecklistItemService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChecklistItemResponseDto>> GetAll(int planId)
        {
            return await _context.ChecklistItems
                .Where(c => c.TravelPlanId == planId)
                .OrderBy(c => c.Id)
                .Select(c => MapToDto(c))
                .ToListAsync();
        }

        public async Task<ChecklistItemResponseDto> Create(int planId, CreateChecklistItemDto dto)
        {
            var item = new ChecklistItem
            {
                Name = dto.Name,
                TravelPlanId = planId
            };

            _context.ChecklistItems.Add(item);
            await _context.SaveChangesAsync();
            return MapToDto(item);
        }

        public async Task<ChecklistItemResponseDto?> Toggle(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null) return null;

            item.IsCompleted = !item.IsCompleted;
            await _context.SaveChangesAsync();
            return MapToDto(item);
        }

        public async Task<bool> Delete(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null) return false;

            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task DeleteAllForPlan(int planId)
        {
            var items = await _context.ChecklistItems
                .Where(c => c.TravelPlanId == planId)
                .ToListAsync();

            _context.ChecklistItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }

        private static ChecklistItemResponseDto MapToDto(ChecklistItem c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            IsCompleted = c.IsCompleted
        };
    }
}