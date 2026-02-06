using System.ComponentModel.DataAnnotations;

namespace InterviewSimulator.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public string? CaptchaToken { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class SocialLoginRequest
    {
        [Required]
        public string Provider { get; set; } = string.Empty; // "Google" or "Facebook"

        [Required]
        public string Token { get; set; } = string.Empty;
        
        // Optional: Send these if we don't want to validate token on backend for this MVP
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int RoleId { get; set; }
    }
}
