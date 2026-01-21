using System;
using System.Collections.Generic;

namespace InterviewSimulator.Models;

public partial class User
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? AvatarUrl { get; set; }

    public string? PhoneNumber { get; set; }

    public string? CvUrl { get; set; }

    public string? CvExtractedText { get; set; }

    public int? ExperienceYears { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<CareerTask> CareerTasks { get; set; } = new List<CareerTask>();

    public virtual ICollection<InterviewSession> InterviewSessions { get; set; } = new List<InterviewSession>();

    public virtual Role Role { get; set; } = null!;
}
