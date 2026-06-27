using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.DTOs;
using UserService.Models;

namespace UserService.Services
{
    public class UserAdminService
    {
        private readonly UserDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public UserAdminService(UserDbContext context, HttpClient httpClient, IConfiguration config)
        {
            _context = context;
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<List<UserResponseDto>> GetAllAsync()
        {
            return await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<UserResponseDto?> GetByIdAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return null;

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<UserResponseDto?> UpdateRoleAsync(int id, string role)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return null;

            user.Role = role;
            await _context.SaveChangesAsync();

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return false;

            var request = new HttpRequestMessage(HttpMethod.Delete,
                $"{_config["TravelServiceUrl"]}/api/travel-plans/internal/by-user/{id}");
            request.Headers.Add("X-Internal-Secret", _config["InternalServiceSecret"]);

            await _httpClient.SendAsync(request);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}