using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewSimulator.Models;
using System.Security.Claims;
using System.Text.Json;

namespace InterviewSimulator.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InterviewController : ControllerBase
    {
        private readonly MockMateDbContext _context;

        public InterviewController(MockMateDbContext context)
        {
            _context = context;
        }

        // POST: api/interview/start
        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // 1. Create Interview Session
            var session = new InterviewSession
            {
                UserId = userId,
                JobPositionId = request.JobPositionId > 0 ? request.JobPositionId : 1, // Default if not provided
                StartedAt = DateTime.UtcNow,
                Status = 0, // In Progress
                CvAnalysisJson = JsonSerializer.Serialize(request.CvAnalysisData),
                OverallFeedback = "Interview Started"
            };

            _context.InterviewSessions.Add(session);
            await _context.SaveChangesAsync();

            // 2. Add Questions as SessionDetails
            if (request.Questions != null && request.Questions.Any())
            {
                var details = request.Questions.Select((q, index) => new SessionDetail
                {
                    SessionId = session.Id,
                    OrderIndex = index,
                    QuestionContent = q,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.SessionDetails.AddRange(details);
                await _context.SaveChangesAsync();
            }

            return Ok(new { SessionId = session.Id });
        }

        // POST: api/interview/submit-answer
        [HttpPost("{sessionId}/submit-answer")]
        public async Task<IActionResult> SubmitAnswer(int sessionId, [FromBody] SubmitAnswerRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var session = await _context.InterviewSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null) return NotFound("Session not found or specific to user.");

            // Find the specific question detail by ID or Index. Using DetailId is safer.
            // Or if passed index, use that. Let's rely on QuestionIndex for simplicity if DetailId is null.
            
            var detail = await _context.SessionDetails
                .FirstOrDefaultAsync(d => d.SessionId == sessionId && d.OrderIndex == request.QuestionIndex);

            if (detail == null) return NotFound("Question not found.");

            detail.AnswerContent = request.AnswerContent;
            detail.TimeTakenSeconds = request.TimeTakenSeconds;
            // potential: detail.AnswerAudioUrl = request.AudioUrl;
            // potential: detail.Score = request.Score; // If AI graded immediately
            
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Answer saved." });
        }

        // POST: api/interview/{sessionId}/complete
        [HttpPost("{sessionId}/complete")]
        public async Task<IActionResult> CompleteSession(int sessionId, [FromBody] CompleteSessionRequest request)
        {
             var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
             var session = await _context.InterviewSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

             if (session == null) return NotFound();

             session.Status = 1; // Completed
             session.EndedAt = DateTime.UtcNow;
             session.OverallFeedback = request.OverallFeedback;
             
             await _context.SaveChangesAsync();
             return Ok();
        }

        // GET: api/interview/history
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var history = await _context.InterviewSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.StartedAt)
                .Select(s => new 
                {
                    s.Id,
                    s.StartedAt,
                    s.EndedAt, // Include EndedAt to calculate duration
                    s.Status,
                    JobPosition = s.JobPositionId // If you included JobPosition navigation, use s.JobPosition.Title
                })
                .ToListAsync();

            return Ok(history);
        }

        // GET: api/interview/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSessionDetails(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var session = await _context.InterviewSessions
                .Include(s => s.SessionDetails)
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (session == null) return NotFound();

            return Ok(new 
            {
                session.Id,
                session.StartedAt,
                session.EndedAt,
                session.CvAnalysisJson, // The stored analysis
                session.OverallFeedback,
                Questions = session.SessionDetails.OrderBy(d => d.OrderIndex).Select(d => new 
                {
                    d.QuestionContent,
                    d.AnswerContent,
                    d.AiFeedback,
                    d.Score,
                    d.TimeTakenSeconds
                })
            });
        }
    }

    public class StartSessionRequest
    {
        public int JobPositionId { get; set; }
        public object CvAnalysisData { get; set; }
        public List<string> Questions { get; set; }
    }

    public class SubmitAnswerRequest
    {
        public int QuestionIndex { get; set; }
        public string AnswerContent { get; set; }
        public int TimeTakenSeconds { get; set; }
    }

    public class CompleteSessionRequest
    {
        public string OverallFeedback { get; set; }
    }
}
