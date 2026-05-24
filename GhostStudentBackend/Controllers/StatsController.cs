using GhostStudentBackend.Data;
using GhostStudentBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GhostStudentBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/stats/end
        [HttpPost("end")]
        public async Task<IActionResult> EndSession([FromBody] EndSessionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("User not found");

            var session = new SessionHistory
            {
                UserId = request.UserId,
                SkillName = request.SkillName,
                StartedAt = request.StartedAt,
                EndedAt = DateTime.UtcNow,
                FinalScore = request.FinalScore,
                TotalXpEarned = request.TotalXpEarned,
                TotalTimeSeconds = request.TotalTimeSeconds,
                DistractionTimeSeconds = request.DistractionTimeSeconds
            };

            _context.SessionHistories.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Session saved", sessionHistoryId = session.Id });
        }

        // GET: api/stats/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetStats(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found");

            var sessions = await _context.SessionHistories
                .Where(s => s.UserId == userId)
                .AsNoTracking()
                .ToListAsync();

            if (sessions.Count == 0)
                return Ok(new
                {
                    totalStudyTimeSeconds = 0,
                    totalSessions = 0,
                    averageScore = 0,
                    topSkills = new List<dynamic>(),
                    recentSessions = new List<dynamic>(),
                    dailyScores = new List<dynamic>()
                });

            var totalTime = sessions.Sum(s => s.TotalTimeSeconds);
            var avgScore = sessions.Count > 0 ? (int)sessions.Average(s => s.FinalScore) : 0;

            // Top skills by total time
            var topSkills = sessions
                .GroupBy(s => s.SkillName)
                .Select(g => new
                {
                    skillName = g.Key,
                    totalTimeSeconds = g.Sum(s => s.TotalTimeSeconds),
                    averageScore = (int)g.Average(s => s.FinalScore)
                })
                .OrderByDescending(x => x.totalTimeSeconds)
                .Take(5)
                .ToList();

            // Recent sessions (last 10)
            var recentSessions = sessions
                .OrderByDescending(s => s.EndedAt)
                .Take(10)
                .Select(s => new
                {
                    skillName = s.SkillName,
                    finalScore = s.FinalScore,
                    date = s.EndedAt.ToString("yyyy-MM-dd"),
                    durationSeconds = s.TotalTimeSeconds
                })
                .ToList();

            // Daily scores (last 7 days)
            var last7Days = DateTime.UtcNow.AddDays(-7);
            var dailyScores = sessions
                .Where(s => s.EndedAt >= last7Days)
                .GroupBy(s => s.EndedAt.Date)
                .Select(g => new
                {
                    date = g.Key.ToString("yyyy-MM-dd"),
                    avgScore = (int)g.Average(s => s.FinalScore),
                    sessionCount = g.Count()
                })
                .OrderBy(x => x.date)
                .ToList();

            return Ok(new
            {
                totalStudyTimeSeconds = totalTime,
                totalSessions = sessions.Count,
                averageScore = avgScore,
                topSkills = topSkills,
                recentSessions = recentSessions,
                dailyScores = dailyScores
            });
        }
    }

    public class EndSessionRequest
    {
        public int UserId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public int FinalScore { get; set; }
        public int TotalXpEarned { get; set; }
        public int TotalTimeSeconds { get; set; }
        public int DistractionTimeSeconds { get; set; }
    }
}
