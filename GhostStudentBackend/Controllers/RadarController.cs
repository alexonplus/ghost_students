using GhostStudentBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GhostStudentBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RadarController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadarController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/radar
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var activeThreshold = DateTime.UtcNow.AddMinutes(-1);
            var students = await _context.StudentSessions
                .AsNoTracking()
                .Where(s => s.LastUpdated >= activeThreshold)
                .OrderBy(s => s.Score)
                .ToListAsync();

            return Ok(students);
        }
    }
}
