namespace RiskDesk.Api.Domain
{
    public class CasinoEvent
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid Operatorid { get; set; }
        public Guid PlayerId { get; set; }
        public Player Player { get; set; } = null!;
        public string ExternalEventId { get; set; } = string.Empty;
        public EventType Type { get; set; }
        public decimal? Amount { get; set; }
        public string? Currency { get; set; }
        public string? PaymentFingerprint { get; set; }
        public string? Ip { get; set; }
        public string? DeviceId { get; set; }
        public string? Country { get; set; }
        public string? BonusCode { get; set; }
        public DateTime OccurredAt { get; set; }
        public DateTime RecivedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; private set; }

        public void MarkProcessed() => ProcessedAt = DateTime.UtcNow;
    }


    public class PlayerIdentifier
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid OperatorId { get; set; }
        public Guid PlayerId { get; set; }
        public IdentifierType Type { get; set; }
        public string Value { get; set; } = string.Empty;
        public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;
        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
    }
}
