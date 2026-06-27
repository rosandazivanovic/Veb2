using System;
using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateDestinationDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public DateTime ArrivalDate { get; set; }

        [Required]
        public DateTime DepartureDate { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }
    }

    public class DestinationResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string? Description { get; set; }
        public string? Notes { get; set; }
    }
}