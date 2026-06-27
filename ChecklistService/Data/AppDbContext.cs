using ChecklistService.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace ChecklistService.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<ChecklistItem> ChecklistItems { get; set; } = null!;

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChecklistItem>()
                .Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(200);

            base.OnModelCreating(modelBuilder);
        }
    }
}