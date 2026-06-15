using InterviewSimulator.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewSimulator.Services.Interfaces
{
    public interface IAdminService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        
        // User Management
        Task<List<UserAdminDto>> GetAllUsersAsync(string? role = null);
        Task<bool> ToggleUserStatusAsync(int userId);
        Task<UserAdminDto> CreateUserAsync(UserCreateDto dto);
        Task<UserAdminDto> UpdateUserAsync(int userId, UserUpdateDto dto);
        Task<bool> DeleteUserAsync(int userId);
        
        // Job Management
        Task<List<JobAdminDto>> GetAllJobsAsync();
        Task<bool> ToggleJobStatusAsync(int jobId);
        Task<bool> ApproveJobAsync(int jobId, int status);
        Task<JobAdminDto> CreateJobAsync(JobCreateDto dto);
        Task<JobAdminDto> UpdateJobAsync(int jobId, JobUpdateDto dto);
        Task<bool> DeleteJobAsync(int jobId);
        Task<List<JobCategoryDto>> GetJobCategoriesAsync();
        
        // Revenue
        Task<RevenueStatsDto> GetRevenueStatsAsync();
        Task<List<TransactionDto>> GetRecentTransactionsAsync(int count = 10);
    }
}
