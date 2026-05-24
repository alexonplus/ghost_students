using GhostStudentBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GhostStudentBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/room/{roomId}
        [HttpGet("{roomId}")]
        public async Task<IActionResult> GetRoom(string roomId)
        {
            var activeThreshold = DateTime.UtcNow.AddMinutes(-1);
            var students = await _context.StudentSessions
                .AsNoTracking()
                .Where(s => s.RoomId == roomId && s.LastUpdated >= activeThreshold)
                .OrderByDescending(s => s.Score)
                .ToListAsync();

            return Ok(students);
        }
    }
}
