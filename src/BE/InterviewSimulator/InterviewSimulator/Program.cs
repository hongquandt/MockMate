
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace InterviewSimulator
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            // DB Configuration
            builder.Services.AddDbContext<InterviewSimulator.Models.MockMateDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DBDefault")));

            // Auth Configuration
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                        System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                };
            });

            // Services Injection
            builder.Services.AddScoped<InterviewSimulator.Services.Interfaces.IAuthService, InterviewSimulator.Services.Implementations.AuthService>();
            builder.Services.AddScoped<InterviewSimulator.Services.Interfaces.IEmailService, InterviewSimulator.Services.Implementations.EmailService>();
            builder.Services.AddScoped<InterviewSimulator.Services.Interfaces.IAdminService, InterviewSimulator.Services.Implementations.AdminService>();
            builder.Services.AddMemoryCache();

            // HttpClient for PayOS API
            builder.Services.AddHttpClient();

            // CORS Configuration
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
            });

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "MockMate API", Version = "v1" });

                // Define Security Scheme
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                // Add Security Requirement
                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                        },
                        new List<string>()
                    }
                });
            });

            var app = builder.Build();

            // Seed Data
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<InterviewSimulator.Models.MockMateDbContext>();
                    
                    if (!context.Roles.Any())
                    {
                        var adminRole = new InterviewSimulator.Models.Role { RoleName = "Admin", Description = "Administrator" };
                        var userRole = new InterviewSimulator.Models.Role { RoleName = "User", Description = "Candidate/User" };
                        
                        // EF Core will assign IDs 1 and 2 by default for a fresh table
                        context.Roles.AddRange(adminRole, userRole);
                        context.SaveChanges();
                    }

                    // Seed Admin User
                    if (!context.Users.Any(u => u.Email == "admin@mockmate.com"))
                    {
                        var adminRole = context.Roles.FirstOrDefault(r => r.RoleName == "Admin");
                        if (adminRole != null)
                        {
                            string hash;
                            using (var sha256 = System.Security.Cryptography.SHA256.Create())
                            {
                                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("Admin@123"));
                                hash = Convert.ToBase64String(hashedBytes);
                            }

                            var adminUser = new InterviewSimulator.Models.User
                            {
                                FullName = "System Admin",
                                Email = "admin@mockmate.com",
                                PasswordHash = hash,
                                RoleId = adminRole.Id,
                                CreatedAt = DateTime.UtcNow,
                                IsDeleted = false,
                                IsVip = true
                            };
                            context.Users.Add(adminUser);
                            context.SaveChanges();
                        }
                    }
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred seeding the DB.");
                }
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            
            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
