using System;
using System.Collections.Generic;

namespace InterviewSimulator.DTOs
{
    public class CompanyDashboardStatsDto
    {
        public int TotalJobs { get; set; }
        public int ActiveJobs { get; set; }
        public int TotalCandidates { get; set; }
        public int PendingReviews { get; set; }
    }

    public class JobCompanyDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public bool IsActive { get; set; }
        public string Requirements { get; set; }
        public string? Description { get; set; }
        public int CandidateCount { get; set; }
    }

    public class CompanyJobCreateDto
    {
        public int CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Requirements { get; set; }
    }

    public class CompanyJobUpdateDto
    {
        public int CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public bool IsActive { get; set; }
    }

    public class CandidateDto
    {
        public int SessionId { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; } = null!;
        public string CandidateName { get; set; } = null!;
        public string CandidateEmail { get; set; } = null!;
        public string? CvUrl { get; set; }
        public DateTime InterviewDate { get; set; }
        public string Status { get; set; } = null!; // Completed, Pending
    }

    public class CandidateResultDto
    {
        public int SessionId { get; set; }
        public string CandidateName { get; set; } = null!;
        public string OverviewFeedback { get; set; } = null!;
        public int Score { get; set; }
        public List<CandidateAnswerDto> Answers { get; set; } = new List<CandidateAnswerDto>();
    }

    public class CandidateAnswerDto
    {
        public string Question { get; set; } = null!;
        public string Answer { get; set; } = null!;
        public string Feedback { get; set; } = null!;
        public int Score { get; set; }
    }
}
