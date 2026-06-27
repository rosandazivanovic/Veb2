using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Data;
using System;
using System.Text;
using TravelService.Data;
using TravelService.Services;

namespace TravelService
{
    public class TravelStartup
    {
        private readonly IConfiguration _configuration;

        public TravelStartup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            var allowedOrigins = _configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                                  ?? Array.Empty<string>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials());
            });

            services.AddHttpClient("ExpenseService", c =>
            {
                c.BaseAddress = new Uri(_configuration["Services:ExpenseServiceUrl"]!);
                c.DefaultRequestHeaders.Add("X-Internal-Secret",
                    _configuration["InternalServiceSecret"]);
            });

            services.AddHttpClient("ChecklistService", c =>
            {
                c.BaseAddress = new Uri(_configuration["Services:ChecklistServiceUrl"]!);
                c.DefaultRequestHeaders.Add("X-Internal-Secret",
                    _configuration["InternalServiceSecret"]);
            });

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(_configuration.GetConnectionString("DefaultConnection")));

            services.AddSingleton<TokenCacheService>();

            services.AddScoped<TravelPlanService>();
            services.AddScoped<DestinationService>();
            services.AddScoped<ActivityService>();
            services.AddScoped<SharedPlanService>();
            services.AddScoped<PdfService>();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidIssuer = _configuration["Jwt:Issuer"],
                        ValidAudience = _configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)),
                        ClockSkew = TimeSpan.Zero
                    };
                });

            services.AddAuthorization();
            services.AddControllers();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors("AllowFrontend");
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints => endpoints.MapControllers());
        }
    }
}