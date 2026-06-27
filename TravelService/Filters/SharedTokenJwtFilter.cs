using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TravelService.Data;
using TravelService.Services;

namespace TravelService.Filters
{
    
    public class SharedTokenOrJwtFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var dbContext = context.HttpContext.RequestServices.GetService(typeof(AppDbContext)) as AppDbContext;
            var tokenCache = context.HttpContext.RequestServices.GetService(typeof(TokenCacheService)) as TokenCacheService;

            if (dbContext == null)
            {
                context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult(
                    new { message = "Niste autorizovani za ovu operaciju." });
                return;
            }

            if (!context.RouteData.Values.TryGetValue("planId", out var planIdValue) ||
                !int.TryParse(planIdValue?.ToString(), out var planId))
            {
                context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult(
                    new { message = "Nevažeća putanja za provjeru pristupa." });
                return;
            }

            if (context.HttpContext.User?.Identity?.IsAuthenticated == true)
            {
                var role = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

                if (role == "admin")
                {
                    await next();
                    return;
                }

                var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out var userId))
                {
                    var ownsPlan = await dbContext.TravelPlans
                        .AnyAsync(p => p.Id == planId && p.UserId == userId);

                    if (ownsPlan)
                    {
                        await next();
                        return;
                    }
                }

                context.Result = new Microsoft.AspNetCore.Mvc.ObjectResult(
                    new { message = "Nemate pristup ovom planu putovanja." })
                {
                    StatusCode = 403
                };
                return;
            }

            var sharedToken = context.HttpContext.Request.Headers["X-Shared-Token"].ToString();
            if (string.IsNullOrWhiteSpace(sharedToken))
            {
                context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult(
                    new { message = "Niste autorizovani za ovu operaciju." });
                return;
            }

            string? accessType = null;

            if (tokenCache != null)
            {
                var cacheEntry = await tokenCache.GetAsync(sharedToken);
                if (cacheEntry != null && cacheEntry.TravelPlanId == planId)
                {
                    accessType = cacheEntry.AccessType;
                }
            }

            if (accessType == null)
            {
                var shared = await dbContext.SharedPlans
                    .FirstOrDefaultAsync(s => s.Token == sharedToken
                                            && s.TravelPlanId == planId
                                            && s.ExpiresAt > DateTime.UtcNow);

                if (shared == null)
                {
                    context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult(
                        new { message = "Token nije validan ili je istekao." });
                    return;
                }

                accessType = shared.AccessType;

                if (tokenCache != null)
                {
                    await tokenCache.SetAsync(sharedToken, new Models.SharedPlanCacheEntry
                    {
                        TravelPlanId = shared.TravelPlanId,
                        AccessType = shared.AccessType,
                        ExpiresAt = shared.ExpiresAt
                    });
                }
            }

            if (accessType == null)
            {
                context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult(
                    new { message = "Token nije validan ili je istekao." });
                return;
            }

            var httpMethod = context.HttpContext.Request.Method;
            var isWriteOperation = httpMethod is "POST" or "PUT" or "PATCH" or "DELETE";

            if (isWriteOperation && accessType != "EDIT")
            {
                context.Result = new Microsoft.AspNetCore.Mvc.ObjectResult(
                    new { message = "Ovaj link dozvoljava samo pregled, ne i izmjenu podataka." })
                {
                    StatusCode = 403
                };
                return;
            }

            await next();
        }
    }
}