
namespace RiskDesk.Api.Domain
{
    public class AppUser
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid OperatorId { get; set; }
        public Operator Operator { get; set; } = null!;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Analyst;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<RefreshToken> RefreshTokens { get; set; } = [];
    }

    public class RefreshToken
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid Userid { get; set; }
        public AppUser User { get; set; } = null!;
        public string TokenHash { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByTokenHash { get; set; }
        public bool IsActive => RevokedAt is null && DateTime.UtcNow < ExpiresAt;
    }
}
