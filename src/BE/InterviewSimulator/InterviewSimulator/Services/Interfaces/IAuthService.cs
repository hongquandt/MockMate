using InterviewSimulator.DTOs;

namespace InterviewSimulator.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task SendForgotPasswordOtpAsync(string email);
        Task<bool> VerifyOtpAsync(string email, string otp);
        Task ResetPasswordAsync(ResetPasswordRequest request);
        Task<AuthResponse> SocialLoginAsync(SocialLoginRequest request);
    }
}
