using GhostStudentBackend.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace GhostStudentBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<StudentSession> StudentSessions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<SessionHistory> SessionHistories { get; set; }
    }
}
