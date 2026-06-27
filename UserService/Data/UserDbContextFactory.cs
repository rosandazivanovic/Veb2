using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace UserService.Data
{
    public class UserDbContextFactory : IDesignTimeDbContextFactory<UserDbContext>
    {
        public UserDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<UserDbContext>();
            optionsBuilder.UseSqlServer("Server=DESKTOP-6FSS16F\\SQLEXPRESS;Database=UserServiceDB;Trusted_Connection=True;TrustServerCertificate=True;");

            return new UserDbContext(optionsBuilder.Options);
        }
    }
}