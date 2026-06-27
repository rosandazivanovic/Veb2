using System;

namespace TravelService.Models
{
    public class SharedPlan
    {
        public int Id { get; set; }

        public string Token { get; set; } = Guid.NewGuid().ToString();

        public string AccessType { get; set; } = "VIEW";

        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int TravelPlanId { get; set; }
        public TravelPlan TravelPlan { get; set; } = null!;
    }
}