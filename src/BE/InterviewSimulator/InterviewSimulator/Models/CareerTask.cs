using System;
using System.Collections.Generic;

namespace InterviewSimulator.Models;

public partial class CareerTask
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? SessionId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? ResourceLink { get; set; }

    public byte? Status { get; set; }

    public DateTime? Deadline { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual InterviewSession? Session { get; set; }

    public virtual User User { get; set; } = null!;
}
