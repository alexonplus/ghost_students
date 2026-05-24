namespace GhostStudentBackend.Models
{
    public class SessionHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime EndedAt { get; set; }
        public int FinalScore { get; set; }
        public int TotalXpEarned { get; set; }
        public int TotalTimeSeconds { get; set; }
        public int DistractionTimeSeconds { get; set; }
    }
}
