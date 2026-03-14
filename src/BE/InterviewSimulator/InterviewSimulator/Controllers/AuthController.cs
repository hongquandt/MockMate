using InterviewSimulator.DTOs;
using InterviewSimulator.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InterviewSimulator.Models;

namespace InterviewSimulator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly MockMateDbContext _context;

        public AuthController(IAuthService authService, MockMateDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            try
            {
                await _authService.SendForgotPasswordOtpAsync(request.Email);
                return Ok(new { message = "OTP sent to your email." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpRequest request)
        {
            var isValid = await _authService.VerifyOtpAsync(request.Email, request.Otp);
            if (isValid)
            {
                return Ok(new { message = "OTP verified successfully." });
            }
            return BadRequest(new { message = "Invalid or expired OTP." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request);
                return Ok(new { message = "Password reset successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("social-login")]
        public async Task<ActionResult<AuthResponse>> SocialLogin(SocialLoginRequest request)
        {
            try
            {
                var response = await _authService.SocialLoginAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

                var userId = int.Parse(userIdStr);
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null) return NotFound(new { message = "User not found" });

                return Ok(new
                {
                    userId = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    isVip = user.IsVip,
                    vipExpirationDate = user.VipExpirationDate,
                    phoneNumber = user.PhoneNumber, // Ensure these are returned too
                    avatarUrl = user.AvatarUrl
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

                var userId = int.Parse(userIdStr);
                var user = await _context.Users.FindAsync(userId);

                if (user == null) return NotFound(new { message = "User not found" });

                // Update fields
                if (!string.IsNullOrEmpty(request.FullName)) user.FullName = request.FullName;
                if (!string.IsNullOrEmpty(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber;
                if (!string.IsNullOrEmpty(request.AvatarUrl)) user.AvatarUrl = request.AvatarUrl;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Profile updated successfully.",
                    user = new
                    {
                        userId = user.Id,
                        fullName = user.FullName,
                        email = user.Email,
                        phoneNumber = user.PhoneNumber,
                        avatarUrl = user.AvatarUrl,
                        isVip = user.IsVip,
                        vipExpirationDate = user.VipExpirationDate
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
