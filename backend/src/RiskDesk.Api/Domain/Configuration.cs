namespace RiskDesk.Api.Domain
{
    public class DetectorSettings
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid OperatorId { get; set; }
        public DetectorType Detector { get; set; }
        public bool IsEnabled { get; set; }
        public Severity Severity { get; set; }
        public int RiskPoints { get; set; }
        public int CooldownHours { get; set; }
        public string ParametersJson { get; set; } = "{}";
    }

    public class WatchlistEntry
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid OperatorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string NormalizedName { get; set; } = string.Empty;
        public WhatchListCategory Category { get; set; }
        public string Source { get; set; } = string.Empty;
        public string? Country { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
