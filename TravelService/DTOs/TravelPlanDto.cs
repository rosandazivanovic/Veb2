using System;
using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateTravelPlanDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Budžet ne može biti negativan.")]
        public decimal Budget { get; set; }

        [StringLength(4000)]
        public string? Notes { get; set; }
    }

    public class UpdateTravelPlanDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Budžet ne može biti negativan.")]
        public decimal Budget { get; set; }

        [StringLength(4000)]
        public string? Notes { get; set; }
    }

    public class TravelPlanResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string? Notes { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal RemainingBudget { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TotalSpentDto
    {
        public decimal TotalSpent { get; set; }
    }
}