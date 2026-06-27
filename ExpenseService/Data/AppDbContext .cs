using ExpenseService.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace ExpenseService.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Expense> Expenses { get; set; } = null!;

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Expense>()
                .Property(e => e.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Expense>()
                .Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150);

            modelBuilder.Entity<Expense>()
                .Property(e => e.Category)
                .IsRequired();

            base.OnModelCreating(modelBuilder);
        }
    }
}