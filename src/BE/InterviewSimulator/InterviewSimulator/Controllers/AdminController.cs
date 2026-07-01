using InterviewSimulator.DTOs;
using InterviewSimulator.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Security.Claims;

namespace InterviewSimulator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require Login
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        private bool IsAdmin()
        {
            var roleIdClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            // Assuming we set RoleID 1 as admin during token gen or just checking RoleName
            return roleIdClaim == "Admin" || roleIdClaim == "1";
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            if (!IsAdmin()) return Forbid(); // Check authorization

            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? role = null)
        {
            if (!IsAdmin()) return Forbid();

            var users = await _adminService.GetAllUsersAsync(role);
            return Ok(users);
        }

        [HttpPost("users/{userId}/toggle")]
        public async Task<IActionResult> ToggleUserStatus(int userId)
        {
            if (!IsAdmin()) return Forbid();

            var success = await _adminService.ToggleUserStatusAsync(userId);
            if (!success) return BadRequest(new { message = "Giao dịch lỗi hoặc bạn không thể khóa Admin." });

            return Ok(new { message = "Đã cập nhật trạng thái User thành công." });
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto request)
        {
            if (!IsAdmin()) return Forbid();
            try { return Ok(await _adminService.CreateUserAsync(request)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UserUpdateDto request)
        {
            if (!IsAdmin()) return Forbid();
            try { return Ok(await _adminService.UpdateUserAsync(userId, request)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            if (!IsAdmin()) return Forbid();
            try 
            {
                var success = await _adminService.DeleteUserAsync(userId);
                if (success) return Ok();
                return BadRequest(new { message = "Không thể xóa user này." });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpGet("jobs")]
        public async Task<IActionResult> GetAllJobs()
        {
            if (!IsAdmin()) return Forbid();

            var jobs = await _adminService.GetAllJobsAsync();
            return Ok(jobs);
        }

        [HttpPost("jobs/{jobId}/toggle")]
        public async Task<IActionResult> ToggleJobStatus(int jobId)
        {
            if (!IsAdmin()) return Forbid();

            var success = await _adminService.ToggleJobStatusAsync(jobId);
            if (!success) return NotFound(new { message = "Không tìm thấy công việc này." });

            return Ok(new { message = "Đã thay đổi trạng thái bài đăng." });
        }

        [HttpPost("jobs/{jobId}/approve")]
        public async Task<IActionResult> ApproveJob(int jobId, [FromQuery] int status)
        {
            if (!IsAdmin()) return Forbid();

            var success = await _adminService.ApproveJobAsync(jobId, status);
            if (!success) return NotFound(new { message = "Không tìm thấy công việc này." });

            var statusMsg = status == 1 ? "Đã duyệt" : status == 2 ? "Đã từ chối" : "Đã đưa về chờ duyệt";
            return Ok(new { message = $"Cập nhật thành công: {statusMsg}." });
        }

        [HttpPost("jobs")]
        public async Task<IActionResult> CreateJob([FromBody] JobCreateDto request)
        {
            if (!IsAdmin()) return Forbid();
            try { return Ok(await _adminService.CreateJobAsync(request)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPut("jobs/{jobId}")]
        public async Task<IActionResult> UpdateJob(int jobId, [FromBody] JobUpdateDto request)
        {
            if (!IsAdmin()) return Forbid();
            try { return Ok(await _adminService.UpdateJobAsync(jobId, request)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("jobs/{jobId}")]
        public async Task<IActionResult> DeleteJob(int jobId)
        {
            if (!IsAdmin()) return Forbid();
            try 
            {
                var success = await _adminService.DeleteJobAsync(jobId);
                if (success) return Ok();
                return BadRequest(new { message = "Không thể xóa job này." });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpGet("jobs/categories")]
        public async Task<IActionResult> GetJobCategories()
        {
            if (!IsAdmin()) return Forbid();
            return Ok(await _adminService.GetJobCategoriesAsync());
        }

        [HttpGet("revenue/stats")]
        public async Task<IActionResult> GetRevenueStats()
        {
            if (!IsAdmin()) return Forbid();

            var stats = await _adminService.GetRevenueStatsAsync();
            return Ok(stats);
        }

        [HttpGet("revenue/transactions")]
        public async Task<IActionResult> GetRecentTransactions()
        {
            if (!IsAdmin()) return Forbid();

            var txns = await _adminService.GetRecentTransactionsAsync();
            return Ok(txns);
        }
    }
}
