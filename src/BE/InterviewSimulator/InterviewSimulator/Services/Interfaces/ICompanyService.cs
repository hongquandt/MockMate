using InterviewSimulator.DTOs;

namespace InterviewSimulator.Services.Interfaces
{
    public interface ICompanyService
    {
        Task<CompanyDashboardStatsDto> GetDashboardStatsAsync(int companyId);
        
        // Jobs
        Task<List<JobCompanyDto>> GetMyJobsAsync(int companyId);
        Task<JobCompanyDto> CreateJobAsync(int companyId, CompanyJobCreateDto dto);
        Task<JobCompanyDto> UpdateJobAsync(int companyId, int jobId, CompanyJobUpdateDto dto);
        Task<bool> DeleteJobAsync(int companyId, int jobId);
        Task<bool> ToggleJobStatusAsync(int companyId, int jobId);
        
        // Candidates
        Task<List<CandidateDto>> GetCandidatesAsync(int companyId, int? jobId = null);
        Task<CandidateResultDto> GetCandidateResultAsync(int companyId, int sessionId);
    }
}
