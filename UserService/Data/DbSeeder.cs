using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using UserService.Models;

namespace UserService.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminAsync(UserDbContext context)
        {
            var adminExists = await context.Users.AnyAsync(u => u.Role == "admin");
            if (adminExists)
                return;

            var admin = new User
            {
                Name = "Administrator",
                Email = "admin@travelplanner.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = "admin",
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}