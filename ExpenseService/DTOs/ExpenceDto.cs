using System.ComponentModel.DataAnnotations;

namespace ExpenseService.DTOs
{
    public class CreateExpenseDto
    {
        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(transport|accommodation|food|tickets|shopping|other)$",
            ErrorMessage = "Kategorija mora biti transport, accommodation, food, tickets, shopping ili other.")]
        public string Category { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Iznos troška ne može biti negativan.")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }
    }

    public class ExpenseResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
    }
}