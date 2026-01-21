using System;
using System.Collections.Generic;

namespace InterviewSimulator.Models;

public partial class JobPosition
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? Requirements { get; set; }

    public bool? IsActive { get; set; }

    public virtual JobCategory Category { get; set; } = null!;

    public virtual ICollection<InterviewSession> InterviewSessions { get; set; } = new List<InterviewSession>();
}
