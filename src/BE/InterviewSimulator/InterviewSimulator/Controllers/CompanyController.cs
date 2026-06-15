using InterviewSimulator.DTOs;
using InterviewSimulator.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewSimulator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require Login
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _companyService;
        private readonly IAdminService _adminService; // To reuse Category Fetching

        public CompanyController(ICompanyService companyService, IAdminService adminService)
        {
            _companyService = companyService;
            _adminService = adminService;
        }

        private bool IsCompany()
        {
            var roleIdClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            return roleIdClaim == "Company" || roleIdClaim == "3" || roleIdClaim == "1" || roleIdClaim == "Admin";
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            if (!IsCompany()) return Forbid();
            var stats = await _companyService.GetDashboardStatsAsync(GetUserId());
            return Ok(stats);
        }

        [HttpGet("jobs")]
        public async Task<IActionResult> GetMyJobs()
        {
            if (!IsCompany()) return Forbid();
            return Ok(await _companyService.GetMyJobsAsync(GetUserId()));
        }

        [HttpPost("jobs")]
        public async Task<IActionResult> CreateJob([FromBody] CompanyJobCreateDto request)
        {
            if (!IsCompany()) return Forbid();
            try { return Ok(await _companyService.CreateJobAsync(GetUserId(), request)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPut("jobs/{jobId}")]
        public async Task<IActionResult> UpdateJob(int jobId, [FromBody] CompanyJobUpdateDto request)
        {
            if (!IsCompany()) return Forbid();
            try { return Ok(await _companyService.UpdateJobAsync(GetUserId(), jobId, request)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("jobs/{jobId}")]
        public async Task<IActionResult> DeleteJob(int jobId)
        {
            if (!IsCompany()) return Forbid();
            var success = await _companyService.DeleteJobAsync(GetUserId(), jobId);
            if (!success) return BadRequest(new { message = "Lỗi khi xóa Job." });
            return Ok();
        }

        [HttpPost("jobs/{jobId}/toggle")]
        public async Task<IActionResult> ToggleJobStatus(int jobId)
        {
            if (!IsCompany()) return Forbid();
            var success = await _companyService.ToggleJobStatusAsync(GetUserId(), jobId);
            if (!success) return NotFound();
            return Ok(new { message = "Cập nhật thành công." });
        }

        [HttpGet("candidates")]
        public async Task<IActionResult> GetCandidates([FromQuery] int? jobId = null)
        {
            if (!IsCompany()) return Forbid();
            return Ok(await _companyService.GetCandidatesAsync(GetUserId(), jobId));
        }

        [HttpGet("candidates/{sessionId}")]
        public async Task<IActionResult> GetCandidateResult(int sessionId)
        {
            if (!IsCompany()) return Forbid();
            try { return Ok(await _companyService.GetCandidateResultAsync(GetUserId(), sessionId)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpGet("job-categories")]
        public async Task<IActionResult> GetJobCategories()
        {
            if (!IsCompany()) return Forbid();
            return Ok(await _adminService.GetJobCategoriesAsync());
        }
    }
}
