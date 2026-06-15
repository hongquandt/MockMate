using InterviewSimulator.Models;
using InterviewSimulator.DTOs;
using InterviewSimulator.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace InterviewSimulator.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly MockMateDbContext _context;

        public AdminService(MockMateDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.RoleId != 1);
            
            // Sessions started but maybe not finished or just getting all mock sessions
            var activeSessions = await _context.InterviewSessions.CountAsync(); 
            
            // Status == 0 means pending approval constraint
            var pendingJobs = await _context.JobPositions.CountAsync(j => j.Status == 0);
            
            var totalRevenue = await _context.PaymentTransactions.Where(t => t.Status == 1).SumAsync(t => t.Amount);

            return new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                ActiveSessions = activeSessions,
                PendingJobs = pendingJobs,
                TotalRevenue = totalRevenue
            };
        }

        public async Task<List<UserAdminDto>> GetAllUsersAsync(string? role = null)
        {
            var query = _context.Users.Include(u => u.Role).AsQueryable();
            
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role.RoleName == role);
            }

            return await query.Select(u => new UserAdminDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.RoleName,
                IsDeleted = u.IsDeleted ?? false,
                IsVip = u.IsVip,
                CreatedAt = u.CreatedAt ?? DateTime.UtcNow
            }).OrderByDescending(u => u.CreatedAt).ToListAsync();
        }

        public async Task<bool> ToggleUserStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            // Protect Admin from being banned
            if (user == null || user.RoleId == 1) return false;

            user.IsDeleted = !(user.IsDeleted ?? false);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UserAdminDto> CreateUserAsync(UserCreateDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new Exception("Email đã tồn tại trên hệ thống.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                RoleId = dto.RoleId,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.Password));
                user.PasswordHash = Convert.ToBase64String(hashedBytes);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            return new UserAdminDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.RoleName,
                IsDeleted = user.IsDeleted ?? false,
                IsVip = user.IsVip,
                CreatedAt = user.CreatedAt ?? DateTime.UtcNow
            };
        }

        public async Task<UserAdminDto> UpdateUserAsync(int userId, UserUpdateDto dto)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new Exception("Không tìm thấy người dùng.");

            user.FullName = dto.FullName;
            user.RoleId = dto.RoleId;
            user.IsDeleted = dto.IsDeleted;
            await _context.SaveChangesAsync();

            if (user.RoleId != dto.RoleId) 
                await _context.Entry(user).Reference(u => u.Role).LoadAsync();

            return new UserAdminDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role?.RoleName ?? "Unknown",
                IsDeleted = user.IsDeleted ?? false,
                IsVip = user.IsVip,
                CreatedAt = user.CreatedAt ?? DateTime.UtcNow
            };
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.RoleId == 1) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<JobAdminDto>> GetAllJobsAsync()
        {
            return await _context.JobPositions
                .Include(j => j.Category)
                .Include(j => j.Company)
                .OrderByDescending(j => j.Id)
                .Select(j => new JobAdminDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    CategoryId = j.CategoryId,
                    CategoryName = j.Category != null ? j.Category.Name : "General",
                    Requirements = j.Requirements ?? "",
                    Description = j.Description ?? "",
                    IsActive = j.IsActive ?? false,
                    Status = j.Status,
                    CompanyName = j.Company != null ? j.Company.FullName : "Unknown"
                }).ToListAsync();
        }

        public async Task<bool> ToggleJobStatusAsync(int jobId)
        {
            var job = await _context.JobPositions.FindAsync(jobId);
            if (job == null) return false;

            job.IsActive = !(job.IsActive ?? false);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveJobAsync(int jobId, int status)
        {
            var job = await _context.JobPositions.FindAsync(jobId);
            if (job == null) return false;

            job.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<JobAdminDto> CreateJobAsync(JobCreateDto dto)
        {
            var job = new JobPosition
            {
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = string.IsNullOrEmpty(dto.Description) ? "" : dto.Description,
                Requirements = string.IsNullOrEmpty(dto.Requirements) ? "" : dto.Requirements,
                IsActive = dto.IsActive
            };
            _context.JobPositions.Add(job);
            await _context.SaveChangesAsync();
            
            await _context.Entry(job).Reference(j => j.Category).LoadAsync();

            return new JobAdminDto
            {
                Id = job.Id,
                Title = job.Title,
                CategoryName = job.Category?.Name ?? "General",
                Requirements = job.Requirements,
                IsActive = job.IsActive ?? false,
                Status = job.Status,
                CompanyName = "Unknown"
            };
        }

        public async Task<JobAdminDto> UpdateJobAsync(int jobId, JobUpdateDto dto)
        {
            var job = await _context.JobPositions.Include(j => j.Category).FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null) throw new Exception("Không tìm thấy Job.");

            job.CategoryId = dto.CategoryId;
            job.Title = dto.Title;
            job.Description = dto.Description;
            job.Requirements = dto.Requirements;
            job.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            if (job.CategoryId != dto.CategoryId)
                await _context.Entry(job).Reference(j => j.Category).LoadAsync();

            return new JobAdminDto
            {
                Id = job.Id,
                Title = job.Title,
                CategoryName = job.Category?.Name ?? "General",
                Requirements = job.Requirements,
                IsActive = job.IsActive ?? false,
                Status = job.Status,
                CompanyName = job.Company?.FullName ?? "Unknown"
            };
        }

        public async Task<bool> DeleteJobAsync(int jobId)
        {
            var job = await _context.JobPositions.FindAsync(jobId);
            if (job == null) return false;

            _context.JobPositions.Remove(job);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<JobCategoryDto>> GetJobCategoriesAsync()
        {
            return await _context.JobCategories.Select(c => new JobCategoryDto
            {
                Id = c.Id,
                Name = c.Name
            }).ToListAsync();
        }

        public async Task<RevenueStatsDto> GetRevenueStatsAsync()
        {
            var successfulTransactions = await _context.PaymentTransactions
                .Where(t => t.Status == 1) // 1: Success
                .ToListAsync();
            
            var total = successfulTransactions.Sum(t => t.Amount);
            
            // Assuming standard MockMate usage:
            // "VIP" upgrades might be an exact amount or we just distribute it.
            // In a real app we'd have a column for TransactionType, here we mock the split.
            var vipRev = total * 0.4m; 
            var jobRev = total * 0.6m;

            return new RevenueStatsDto
            {
                TotalRevenue = total,
                VipRevenue = vipRev,
                JobPostingRevenue = jobRev,
                TotalTransactions = successfulTransactions.Count
            };
        }

        public async Task<List<TransactionDto>> GetRecentTransactionsAsync(int count = 10)
        {
            return await _context.PaymentTransactions
                .Include(t => t.User)
                .Where(t => t.Status == 1)
                .OrderByDescending(t => t.TransactionDate)
                .Take(count)
                .Select(t => new TransactionDto
                {
                    Id = t.Id,
                    TransactionCode = t.TransactionCode ?? "N/A",
                    Amount = t.Amount,
                    TransactionDate = t.TransactionDate,
                    UserEmail = t.User.Email,
                    Type = "VIP Upgrade" // Placeholder since we don't have transaction type field yet
                }).ToListAsync();
        }
    }
}
