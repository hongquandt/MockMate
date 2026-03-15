using InterviewSimulator.Models;
using InterviewSimulator.DTOs;
using InterviewSimulator.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InterviewSimulator.Services.Implementations
{
    public class CompanyService : ICompanyService
    {
        private readonly MockMateDbContext _context;

        public CompanyService(MockMateDbContext context)
        {
            _context = context;
        }

        public async Task<CompanyDashboardStatsDto> GetDashboardStatsAsync(int companyId)
        {
            var myJobs = await _context.JobPositions.Where(j => j.CompanyId == companyId).ToListAsync();
            var myJobIds = myJobs.Select(j => j.Id).ToList();

            var candidates = await _context.InterviewSessions
                .Where(s => myJobIds.Contains(s.JobPositionId))
                .ToListAsync();

            return new CompanyDashboardStatsDto
            {
                TotalJobs = myJobs.Count,
                ActiveJobs = myJobs.Count(j => j.IsActive == true),
                TotalCandidates = candidates.Count,
                PendingReviews = candidates.Count(s => s.Status == 0)
            };
        }

        public async Task<List<JobCompanyDto>> GetMyJobsAsync(int companyId)
        {
            var jobs = await _context.JobPositions
                .Include(j => j.Category)
                .Include(j => j.InterviewSessions)
                .Where(j => j.CompanyId == companyId)
                .OrderByDescending(j => j.Id)
                .ToListAsync();

            return jobs.Select(j => new JobCompanyDto
            {
                Id = j.Id,
                Title = j.Title,
                CategoryId = j.CategoryId,
                CategoryName = j.Category?.Name ?? "N/A",
                Requirements = j.Requirements ?? "",
                Description = j.Description ?? "",
                IsActive = j.IsActive ?? false,
                CandidateCount = j.InterviewSessions.Count
            }).ToList();
        }

        public async Task<JobCompanyDto> CreateJobAsync(int companyId, CompanyJobCreateDto dto)
        {
            var job = new JobPosition
            {
                CompanyId = companyId,
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                Requirements = dto.Requirements,
                IsActive = true
            };

            _context.JobPositions.Add(job);
            await _context.SaveChangesAsync();

            await _context.Entry(job).Reference(j => j.Category).LoadAsync();

            return new JobCompanyDto
            {
                Id = job.Id,
                Title = job.Title,
                CategoryId = job.CategoryId,
                CategoryName = job.Category?.Name ?? "N/A",
                Requirements = job.Requirements ?? "",
                Description = job.Description ?? "",
                IsActive = job.IsActive ?? false,
                CandidateCount = 0
            };
        }

        public async Task<JobCompanyDto> UpdateJobAsync(int companyId, int jobId, CompanyJobUpdateDto dto)
        {
            var job = await _context.JobPositions.Include(j => j.Category).FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);
            if (job == null) throw new Exception("Không tìm thấy Job hoặc bạn không có quyền.");

            job.CategoryId = dto.CategoryId;
            job.Title = dto.Title;
            job.Description = dto.Description;
            job.Requirements = dto.Requirements;
            job.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            await _context.Entry(job).Reference(j => j.Category).LoadAsync();

            var candidatesCount = await _context.InterviewSessions.CountAsync(s => s.JobPositionId == job.Id);

            return new JobCompanyDto
            {
                Id = job.Id,
                Title = job.Title,
                CategoryId = job.CategoryId,
                CategoryName = job.Category?.Name ?? "N/A",
                Requirements = job.Requirements ?? "",
                Description = job.Description ?? "",
                IsActive = job.IsActive ?? false,
                CandidateCount = candidatesCount
            };
        }

        public async Task<bool> DeleteJobAsync(int companyId, int jobId)
        {
            var job = await _context.JobPositions.FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);
            if (job == null) return false;

            _context.JobPositions.Remove(job);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleJobStatusAsync(int companyId, int jobId)
        {
            var job = await _context.JobPositions.FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);
            if (job == null) return false;

            job.IsActive = !(job.IsActive ?? false);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<CandidateDto>> GetCandidatesAsync(int companyId, int? jobId = null)
        {
            var query = _context.InterviewSessions
                .Include(s => s.User)
                .Include(s => s.JobPosition)
                .Where(s => s.JobPosition.CompanyId == companyId);

            if (jobId.HasValue && jobId.Value > 0)
                query = query.Where(s => s.JobPositionId == jobId.Value);

            var sessions = await query.OrderByDescending(s => s.StartedAt).ToListAsync();

            return sessions.Select(s => new CandidateDto
            {
                SessionId = s.Id,
                JobId = s.JobPositionId,
                JobTitle = s.JobPosition?.Title ?? "N/A",
                CandidateName = s.User?.FullName ?? "Unknown",
                CandidateEmail = s.User?.Email ?? "Unknown",
                CvUrl = s.User?.CvUrl,
                InterviewDate = s.StartedAt ?? DateTime.UtcNow,
                Status = s.Status == 1 ? "Completed" : "Pending"
            }).ToList();
        }

        public async Task<CandidateResultDto> GetCandidateResultAsync(int companyId, int sessionId)
        {
            var session = await _context.InterviewSessions
                .Include(s => s.User)
                .Include(s => s.JobPosition)
                .Include(s => s.SessionDetails)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.JobPosition.CompanyId == companyId);

            if (session == null) throw new Exception("Không tìm thấy kết quả hoặc không có quyền truy cập.");

            var details = session.SessionDetails.OrderBy(d => d.Id).ToList();
            var answerDtos = details.Select(d => new CandidateAnswerDto
            {
                Question = d.QuestionContent ?? "No question",
                Answer = d.AnswerContent ?? "No answer provided",
                Feedback = d.AiFeedback ?? "No feedback",
                Score = (int)(d.Score ?? 0)
            }).ToList();

            var totalScore = answerDtos.Any() ? (int)answerDtos.Average(a => a.Score) : 0;
            string overview = session.OverallFeedback ?? "Candidate completed the session.";

            return new CandidateResultDto
            {
                SessionId = session.Id,
                CandidateName = session.User?.FullName ?? "Unknown",
                OverviewFeedback = overview,
                Score = totalScore,
                Answers = answerDtos
            };
        }
    }
}
