using System;
using System.Collections.Generic;

namespace InterviewSimulator.Models;

public partial class JobCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<JobPosition> JobPositions { get; set; } = new List<JobPosition>();
}
