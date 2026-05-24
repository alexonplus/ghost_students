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

        // GET: api/stats/categories
        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = new[]
            {
                new { id = 1, name = "Programming", xpMultiplier = 1.5 },
                new { id = 2, name = "Languages", xpMultiplier = 1.3 },
                new { id = 3, name = "Sports", xpMultiplier = 1.0 },
                new { id = 4, name = "Music", xpMultiplier = 1.2 },
                new { id = 5, name = "Art", xpMultiplier = 1.1 },
                new { id = 6, name = "Science", xpMultiplier = 1.4 },
                new { id = 7, name = "Other", xpMultiplier = 1.0 }
            };
            return Ok(categories);
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

            int xpMultiplier = GetXpMultiplierForCategory(request.Category);
            int finalXp = (int)(request.TotalXpEarned * xpMultiplier);

            var session = new SessionHistory
            {
                UserId = request.UserId,
                SkillName = request.SkillName,
                StartedAt = request.StartedAt,
                EndedAt = DateTime.UtcNow,
                FinalScore = request.FinalScore,
                TotalXpEarned = finalXp,
                TotalTimeSeconds = request.TotalTimeSeconds,
                DistractionTimeSeconds = request.DistractionTimeSeconds,
                Category = request.Category,
                XpMultiplier = xpMultiplier
            };

            _context.SessionHistories.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Session saved", sessionHistoryId = session.Id, xpEarned = finalXp });
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

        private int GetXpMultiplierForCategory(int category)
        {
            return category switch
            {
                1 => (int)1.5, // Programming
                2 => (int)1.3, // Languages
                3 => 1,        // Sports
                4 => (int)1.2, // Music
                5 => (int)1.1, // Art
                6 => (int)1.4, // Science
                _ => 1         // Other
            };
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
        public int Category { get; set; }
    }
}
