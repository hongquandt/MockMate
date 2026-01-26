using System.ComponentModel.DataAnnotations;

namespace InterviewSimulator.DTOs
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyOtpRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Otp { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Otp { get; set; } = string.Empty; // Verify again or use a token, but OTP is fine for this flow if validated

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;

        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
