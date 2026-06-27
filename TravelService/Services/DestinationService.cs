using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class DestinationService
    {
        private readonly AppDbContext _context;

        public DestinationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DestinationResponseDto>> GetAll(int planId)
        {
            return await _context.Destinations
                .Where(d => d.TravelPlanId == planId)
                .OrderBy(d => d.ArrivalDate)
                .ThenBy(d => d.DepartureDate)
                .Select(d => MapToDto(d))
                .ToListAsync();
        }

        public async Task<DestinationResponseDto> Create(int planId, CreateDestinationDto dto)
        {
            var destination = new Destination
            {
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Description = dto.Description ?? string.Empty,
                Notes = dto.Notes ?? string.Empty,
                TravelPlanId = planId
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();
            return MapToDto(destination);
        }

        public async Task<DestinationResponseDto?> Update(int id, CreateDestinationDto dto)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null) return null;

            destination.Name = dto.Name;
            destination.Location = dto.Location;
            destination.ArrivalDate = dto.ArrivalDate;
            destination.DepartureDate = dto.DepartureDate;
            destination.Description = dto.Description ?? string.Empty;
            destination.Notes = dto.Notes ?? string.Empty;

            await _context.SaveChangesAsync();
            return MapToDto(destination);
        }

        public async Task<bool> Delete(int id)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null) return false;

            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
            return true;
        }

        private static DestinationResponseDto MapToDto(Destination d) => new()
        {
            Id = d.Id,
            Name = d.Name,
            Location = d.Location,
            ArrivalDate = d.ArrivalDate,
            DepartureDate = d.DepartureDate,
            Description = d.Description,
            Notes = d.Notes
        };
    }
}