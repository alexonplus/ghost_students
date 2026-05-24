namespace GhostStudentBackend.Models
{
    public class StudentSession
    {
        public int Id { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public int Score { get; set; }
        public bool IsPresent { get; set; }
        public DateTime LastUpdated { get; set; }
        public string RoomId { get; set; } = string.Empty;

    }
}
