using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class ActivityService
    {
        private readonly AppDbContext _context;

        public ActivityService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ActivityResponseDto>> GetAll(int planId)
        {
            return await _context.Activities
                .Where(a => a.TravelPlanId == planId)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .Select(a => MapToDto(a))
                .ToListAsync();
        }

        public async Task<ActivityResponseDto> Create(int planId, CreateActivityDto dto)
        {
            var activity = new Activity
            {
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description ?? string.Empty,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status,
                TravelPlanId = planId
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();
            return MapToDto(activity);
        }

        public async Task<ActivityResponseDto?> Update(int id, CreateActivityDto dto)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return null;

            activity.Name = dto.Name;
            activity.Date = dto.Date;
            activity.Time = dto.Time;
            activity.Location = dto.Location;
            activity.Description = dto.Description ?? string.Empty;
            activity.EstimatedCost = dto.EstimatedCost;
            activity.Status = dto.Status;

            await _context.SaveChangesAsync();
            return MapToDto(activity);
        }

        public async Task<bool> Delete(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return false;

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ActivityResponseDto MapToDto(Activity a) => new()
        {
            Id = a.Id,
            Name = a.Name,
            Date = a.Date,
            Time = a.Time,
            Location = a.Location,
            Description = a.Description,
            EstimatedCost = a.EstimatedCost,
            Status = a.Status
        };
    }
}