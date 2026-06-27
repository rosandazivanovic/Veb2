using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class SharedPlanService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly TokenCacheService _tokenCache;

        public SharedPlanService(
            AppDbContext context,
            IHttpClientFactory httpClientFactory,
            TokenCacheService tokenCache)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _tokenCache = tokenCache;
        }

        public async Task<SharedPlanResponseDto> Create(int planId, CreateSharedPlanDto dto)
        {
            var shared = new SharedPlan
            {
                TravelPlanId = planId,
                AccessType = dto.AccessType,
                ExpiresAt = DateTime.UtcNow.AddDays(dto.ExpiresInDays)
            };

            _context.SharedPlans.Add(shared);
            await _context.SaveChangesAsync();

            await _tokenCache.SetAsync(shared.Token, new SharedPlanCacheEntry
            {
                TravelPlanId = shared.TravelPlanId,
                AccessType = shared.AccessType,
                ExpiresAt = shared.ExpiresAt
            });

            return new SharedPlanResponseDto
            {
                Token = shared.Token,
                AccessType = shared.AccessType,
                ExpiresAt = shared.ExpiresAt
            };
        }

        public async Task<(TravelPlan? plan, string? accessType, List<ChecklistItemDto> checklist)> GetByToken(string token)
        {
            var shared = await _context.SharedPlans
                .Include(s => s.TravelPlan)
                    .ThenInclude(p => p.Destinations)
                .Include(s => s.TravelPlan)
                    .ThenInclude(p => p.Activities)
                .FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);

            if (shared == null) return (null, null, new List<ChecklistItemDto>());

            var checklist = await GetChecklistForPlan(shared.TravelPlan.Id);

            return (shared.TravelPlan, shared.AccessType, checklist);
        }

        private async Task<List<ChecklistItemDto>> GetChecklistForPlan(int planId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("ChecklistService");
                var result = await client.GetFromJsonAsync<List<ChecklistItemDto>>(
                    $"api/travel-plans/{planId}/checklist");
                return result ?? new List<ChecklistItemDto>();
            }
            catch
            {
                return new List<ChecklistItemDto>();
            }
        }
    }
}