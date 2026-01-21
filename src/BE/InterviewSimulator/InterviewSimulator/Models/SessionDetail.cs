using System;
using System.Collections.Generic;

namespace InterviewSimulator.Models;

public partial class SessionDetail
{
    public int Id { get; set; }

    public int SessionId { get; set; }

    public int OrderIndex { get; set; }

    public string QuestionContent { get; set; } = null!;

    public string? AnswerContent { get; set; }

    public string? AnswerAudioUrl { get; set; }

    public string? AiFeedback { get; set; }

    public double? Score { get; set; }

    public int? TimeTakenSeconds { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual InterviewSession Session { get; set; } = null!;
}
