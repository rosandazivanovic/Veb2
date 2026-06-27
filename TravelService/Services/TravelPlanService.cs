using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class TravelPlanService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly TokenCacheService _tokenCache;

        public TravelPlanService(
            AppDbContext context,
            IHttpClientFactory httpClientFactory,
            TokenCacheService tokenCache)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _tokenCache = tokenCache;
        }

        public async Task<List<TravelPlanResponseDto>> GetAll(int userId)
        {
            var plans = await _context.TravelPlans
                .Where(p => p.UserId == userId)
                .ToListAsync();

            var result = new List<TravelPlanResponseDto>();
            foreach (var plan in plans)
                result.Add(await MapToDto(plan));

            return result;
        }

        public async Task<List<TravelPlanResponseDto>> GetAllForAdmin()
        {
            var plans = await _context.TravelPlans.ToListAsync();

            var result = new List<TravelPlanResponseDto>();
            foreach (var plan in plans)
                result.Add(await MapToDto(plan));

            return result;
        }

        public async Task<TravelPlanResponseDto?> GetById(int id, int userId, string role)
        {
            TravelPlan? plan;
            if (role == "admin")
                plan = await _context.TravelPlans.FirstOrDefaultAsync(p => p.Id == id);
            else
                plan = await _context.TravelPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            return plan == null ? null : await MapToDto(plan);
        }

        public async Task<TravelPlanResponseDto> Create(CreateTravelPlanDto dto, int userId)
        {
            var plan = new TravelPlan
            {
                Title = dto.Title,
                Description = dto.Description ?? string.Empty,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Budget = dto.Budget,
                Notes = dto.Notes ?? string.Empty,
                UserId = userId
            };

            _context.TravelPlans.Add(plan);
            await _context.SaveChangesAsync();
            return await MapToDto(plan);
        }

        public async Task<TravelPlanResponseDto?> Update(int id, UpdateTravelPlanDto dto, int userId, string role)
        {
            TravelPlan? plan;
            if (role == "admin")
                plan = await _context.TravelPlans.FirstOrDefaultAsync(p => p.Id == id);
            else
                plan = await _context.TravelPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) return null;

            plan.Title = dto.Title;
            plan.Description = dto.Description ?? string.Empty;
            plan.StartDate = dto.StartDate;
            plan.EndDate = dto.EndDate;
            plan.Budget = dto.Budget;
            plan.Notes = dto.Notes ?? string.Empty;

            await _context.SaveChangesAsync();
            return await MapToDto(plan);
        }

        public async Task<bool> Delete(int id, int userId, string role)
        {
            TravelPlan? plan;
            if (role == "admin")
                plan = await _context.TravelPlans.FirstOrDefaultAsync(p => p.Id == id);
            else
                plan = await _context.TravelPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (plan == null) return false;

            await DeleteCrossServiceDataAsync(id);

            await _tokenCache.RemoveByPlanIdAsync(id);

            _context.TravelPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task DeleteAllForUser(int userId)
        {
            var plans = await _context.TravelPlans
                .Where(p => p.UserId == userId)
                .ToListAsync();

            foreach (var plan in plans)
                await DeleteCrossServiceDataAsync(plan.Id);

            await _tokenCache.RemoveByPlanIdsAsync(plans.Select(p => p.Id));

            _context.TravelPlans.RemoveRange(plans);
            await _context.SaveChangesAsync();
        }

        private async Task DeleteCrossServiceDataAsync(int planId)
        {
            try
            {
                var expClient = _httpClientFactory.CreateClient("ExpenseService");
                await expClient.DeleteAsync($"api/travel-plans/{planId}/expenses");
            }
            catch { }

            try
            {
                var chkClient = _httpClientFactory.CreateClient("ChecklistService");
                await chkClient.DeleteAsync($"api/travel-plans/{planId}/checklist");
            }
            catch {  }
        }

        private async Task<decimal> GetTotalSpent(int planId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("ExpenseService");
                var response = await client.GetFromJsonAsync<TotalSpentDto>(
                    $"api/travel-plans/{planId}/expenses/total");
                return response?.TotalSpent ?? 0;
            }
            catch
            {
                return 0;
            }
        }

        private async Task<TravelPlanResponseDto> MapToDto(TravelPlan plan)
        {
            var totalSpent = await GetTotalSpent(plan.Id);

            return new TravelPlanResponseDto
            {
                Id = plan.Id,
                Title = plan.Title,
                Description = plan.Description,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                Budget = plan.Budget,
                Notes = plan.Notes,
                TotalSpent = totalSpent,
                RemainingBudget = plan.Budget - totalSpent,
                CreatedAt = plan.CreatedAt
            };
        }
    }
}