using GhostStudentBackend.Data;
using GhostStudentBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GhostStudentBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HeartbeatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HeartbeatController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/heartbeat
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] StudentSession payload)
        {
            var session = await _context.StudentSessions
                .FirstOrDefaultAsync(s => s.SessionId == payload.SessionId);

            if (session == null)
            {
                payload.LastUpdated = DateTime.UtcNow;
                _context.StudentSessions.Add(payload);
            }
            else
            {
                session.Score = payload.Score;
                session.IsPresent = payload.IsPresent;
                session.RoomId = payload.RoomId;
                session.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
