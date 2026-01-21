using System;
using System.Collections.Generic;

namespace InterviewSimulator.Models;

public partial class InterviewSession
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int JobPositionId { get; set; }

    public byte DifficultyLevel { get; set; }

    public byte DurationMode { get; set; }

    public byte? Status { get; set; }

    public double? TotalScore { get; set; }

    public byte? CareerFitRating { get; set; }

    public string? OverallFeedback { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public virtual ICollection<CareerTask> CareerTasks { get; set; } = new List<CareerTask>();

    public virtual JobPosition JobPosition { get; set; } = null!;

    public virtual ICollection<SessionDetail> SessionDetails { get; set; } = new List<SessionDetail>();

    public virtual User User { get; set; } = null!;
}
