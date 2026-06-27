using Microsoft.EntityFrameworkCore;
using TravelService.Models;

namespace TravelService.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<TravelPlan> TravelPlans { get; set; } = null!;
        public DbSet<Destination> Destinations { get; set; } = null!;
        public DbSet<Activity> Activities { get; set; } = null!;
        public DbSet<SharedPlan> SharedPlans { get; set; } = null!;

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TravelPlan>()
                .HasMany(p => p.Destinations)
                .WithOne(d => d.TravelPlan)
                .HasForeignKey(d => d.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TravelPlan>()
                .HasMany(p => p.Activities)
                .WithOne(a => a.TravelPlan)
                .HasForeignKey(a => a.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TravelPlan>()
                .HasMany(p => p.SharedPlans)
                .WithOne(s => s.TravelPlan)
                .HasForeignKey(s => s.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TravelPlan>()
                .Property(p => p.Budget)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Activity>()
                .Property(a => a.EstimatedCost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SharedPlan>()
                .Property(s => s.Token)
                .IsRequired();

            modelBuilder.Entity<SharedPlan>()
                .Property(s => s.AccessType)
                .IsRequired();

            base.OnModelCreating(modelBuilder);
        }
    }
}