using System.ComponentModel.DataAnnotations;

namespace ChecklistService.DTOs
{
    public class CreateChecklistItemDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;
    }

    public class ChecklistItemResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}