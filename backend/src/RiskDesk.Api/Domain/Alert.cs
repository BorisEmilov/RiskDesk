namespace RiskDesk.Api.Domain
{
    public class Alert
    {
        private static readonly Dictionary<AlertStatus, AlertStatus[]> Transitions = new()
        {
            [AlertStatus.Open] = [AlertStatus.InReview, AlertStatus.Escalated, AlertStatus.Escalated],
            [AlertStatus.InReview] = [AlertStatus.Open, AlertStatus.Escalated, AlertStatus.Closed],
            [AlertStatus.Escalated] = [AlertStatus.InReview, AlertStatus.Closed],
            [AlertStatus.Closed] = [AlertStatus.Open]
        };

        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid OperatorId { get; set; }
        public Guid PlayerId { get; set; }
        public Player Player { get; set; } = null!;
        public DetectorType Detector { get; set; }
        public AlertCategory Category { get; set; }
        public Severity Severity { get; set; }
        public string Title { get; set; } = string.Empty;

        public string EvidenceJson { get; set; } = "{}";
        public int RiskPoints { get; set; }
        public AlertStatus Status { get; private set; } = AlertStatus.Open;
        public AlertResolution Resolution { get; private set; } = AlertResolution.None;
        public Guid? AssignedToId { get; private set; }
        public AppUser? AssignedTo { get; set; }
        public DateTime DueAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime? ClosedAt { get; private set; }
        public uint Version { get; set; }

        public bool IsOverdue => Status != AlertStatus.Closed && DateTime.UtcNow > DueAt;

        public static TimeSpan SlaFor(Severity severity) => severity switch
        {
            Severity.Critical => TimeSpan.FromHours(4),
            Severity.High => TimeSpan.FromHours(24),
            Severity.Medium => TimeSpan.FromHours(72),
            _ => TimeSpan.FromHours(7)
        };

        public void AssignTo(Guid? userId)
        {
            if (Status == AlertStatus.Closed) throw new DomainException("Closed Alert can not be assigned");
            AssignedToId = userId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ChangeStatus(AlertStatus next, AlertResolution resolution)
        {
            if (!Transitions[Status].Contains(next))
            {
                throw new DomainException($"Incorrect status {next}");
            }
            if (next == AlertStatus.Closed && resolution == AlertResolution.None)
            {
                throw new DomainException("Provide a resolution befor closing");
            }
            Status = next;
            Resolution = next == AlertStatus.Closed ? resolution : AlertResolution.None;
            ClosedAt = next == AlertStatus.Closed ? DateTime.UtcNow : null;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
