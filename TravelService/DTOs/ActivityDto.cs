using System;
using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateActivityDto
    {
        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public TimeSpan Time { get; set; }

        [Required]
        [StringLength(200)]
        public string Location { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Procijenjeni trošak ne može biti negativan.")]
        public decimal EstimatedCost { get; set; }

        [Required]
        [RegularExpression("^(planned|reserved|completed|cancelled)$",
            ErrorMessage = "Status mora biti planned, reserved, completed ili cancelled.")]
        public string Status { get; set; } = "planned";
    }

    public class ActivityResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string Location { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal EstimatedCost { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}