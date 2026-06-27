using System;
using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateSharedPlanDto
    {
        [Required]
        [RegularExpression("^(VIEW|EDIT)$", ErrorMessage = "AccessType mora biti VIEW ili EDIT.")]
        public string AccessType { get; set; } = "VIEW";

        [Range(1, 365, ErrorMessage = "ExpiresInDays mora biti između 1 i 365.")]
        public int ExpiresInDays { get; set; } = 7;
    }

    public class SharedPlanResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string AccessType { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}