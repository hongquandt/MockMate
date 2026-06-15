using System;

namespace InterviewSimulator.DTOs
{
    public class UserAdminDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsVip { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class JobAdminDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public bool IsActive { get; set; }
        public string Requirements { get; set; }
        public string? Description { get; set; }
        public int Status { get; set; }
        public string? CompanyName { get; set; }
    }

    public class RevenueStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal VipRevenue { get; set; }
        public decimal JobPostingRevenue { get; set; }
        public int TotalTransactions { get; set; }
    }

    public class TransactionDto
    {
        public int Id { get; set; }
        public string TransactionCode { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string UserEmail { get; set; }
        public string Type { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveSessions { get; set; }
        public int PendingJobs { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class UserCreateDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public int RoleId { get; set; }
    }

    public class UserUpdateDto
    {
        public string FullName { get; set; } = null!;
        public int RoleId { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class JobCreateDto
    {
        public int CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public bool IsActive { get; set; }
    }

    public class JobUpdateDto
    {
        public int CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public bool IsActive { get; set; }
    }

    public class JobCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }
}
