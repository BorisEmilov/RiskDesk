namespace RiskDesk.Api.Domain
{
    public class Operator
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public string Name { get; set; } = string.Empty;
        public string? ApiKeyHash { get; set; }
        public string? ApiKeyPrefix { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
