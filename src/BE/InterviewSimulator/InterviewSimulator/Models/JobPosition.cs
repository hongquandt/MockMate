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

    public int? CompanyId { get; set; }

    public int Status { get; set; } = 0; // 0: Pending, 1: Approved, 2: Rejected

    public virtual JobCategory Category { get; set; } = null!;

    public virtual User? Company { get; set; }

    public virtual ICollection<InterviewSession> InterviewSessions { get; set; } = new List<InterviewSession>();
}
