using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RiskDesk.Api.Domain;

namespace RiskDesk.Api.Infrastructure.Data
{
    public class OperatorConfiguration : IEntityTypeConfiguration<Operator>
    {
        public void Configure(EntityTypeBuilder<Operator> b)
        {
            b.ToTable("operators");
            b.Property(o => o.Name).HasMaxLength(100).IsRequired();
            b.Property(o => o.ApiKeyHash).HasMaxLength(128);
            b.Property(o => o.ApiKeyPrefix).HasMaxLength(20);
            b.HasIndex(o => o.ApiKeyHash).IsUnique();
        }
    }


    public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
    {
        public void Configure(EntityTypeBuilder<AppUser> b)
        {
            b.ToTable("users");
            b.Property(u => u.Email).HasMaxLength(256).IsRequired();
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.Name).HasMaxLength(100).IsRequired();
            b.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
            b.HasOne(u => u.Operator).WithMany().HasForeignKey(u => u.OperatorId)
              .OnDelete(DeleteBehavior.Cascade);
        }
    }


    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> b)
        {
            b.ToTable("refresh_tokens");
            b.Property(r => r.TokenHash).HasMaxLength(128).IsRequired();
            b.HasIndex(r => r.TokenHash).IsUnique();
            b.Property(r => r.ReplacedByTokenHash).HasMaxLength(128);
            b.HasOne(r => r.User).WithMany(u => u.RefreshTokens).HasForeignKey(r => r.Userid)
              .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class PlayerConfiguration : IEntityTypeConfiguration<Player>
    {
        public void Configure(EntityTypeBuilder<Player> b)
        {
            b.ToTable("players");
            b.Property(p => p.ExternalId).HasMaxLength(100).IsRequired();
            b.Property(p => p.Email).HasMaxLength(256);
            b.Property(p => p.FullName).HasMaxLength(150);
            b.Property(p => p.Country).HasMaxLength(2);
            b.Property(p => p.LastLoginCountry).HasMaxLength(2);
            b.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(p => p.KycStatus).HasConversion<string>().HasMaxLength(20);
            b.HasIndex(p => new { p.OperatorId, p.ExternalId }).IsUnique();
            b.HasIndex(p => new { p.OperatorId, p.RiskScore });
            b.HasOne<Operator>().WithMany().HasForeignKey(p => p.OperatorId)
              .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class PlayerIdentifierConfiguration : IEntityTypeConfiguration<PlayerIdentifier>
    {
        public void Configure(EntityTypeBuilder<PlayerIdentifier> b)
        {
            b.ToTable("player_dentifiers");
            b.Property(i => i.Type).HasConversion<string>().HasMaxLength(20);
            b.Property(i => i.Value).HasMaxLength(256).IsRequired();
            b.HasIndex(i => new { i.PlayerId, i.Type, i.Value }).IsUnique();
            b.HasIndex(i => new { i.OperatorId, i.Value });
            b.HasOne<Player>().WithMany().HasForeignKey(i => i.PlayerId)
              .OnDelete(DeleteBehavior.Cascade);
        }
    }


    public class CasinoEventConfiguration() : IEntityTypeConfiguration<CasinoEvent>
    {
        public void Configure(EntityTypeBuilder<CasinoEvent> b)
        {
            b.ToTable("events");
            b.Property(e => e.ExternalEventId).HasMaxLength(100).IsRequired();
            b.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
            b.Property(e => e.Amount).HasPrecision(18, 2);
            b.Property(e => e.Currency).HasMaxLength(3);
            b.Property(e => e.PaymentFingerprint).HasMaxLength(128);
            b.Property(e => e.Ip).HasMaxLength(45);
            b.Property(e => e.DeviceId).HasMaxLength(128);
            b.Property(e => e.Country).HasMaxLength(2);
            b.Property(e => e.BonusCode).HasMaxLength(50);
            b.HasIndex(e => new { e.OperatorId, e.ExternalEventId }).IsUnique();
            b.HasIndex(e => new { e.PlayerId, e.Type, e.OccurredAt });
            b.HasIndex(e => e.ProcessedAt);
            b.HasOne(e => e.Player).WithMany().HasForeignKey(e => e.PlayerId)
              .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class AlertConfiguration : IEntityTypeConfiguration<Alert>
    {
        public void Configure(EntityTypeBuilder<Alert> b)
        {
            b.ToTable("alerts");
            b.Property(a => a.Detector).HasConversion<string>().HasMaxLength(40);
            b.Property(a => a.Category).HasConversion<string>().HasMaxLength(30);
            b.Property(a => a.Severity);
            b.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(a => a.Resolution).HasConversion<string>().HasMaxLength(20);
            b.Property(a => a.Title).HasMaxLength(200).IsRequired();
            b.Property(a => a.EvidenceJson).HasColumnType("jsonb");
            b.Property(a => a.Version).IsRowVersion();
            b.HasIndex(a => new { a.OperatorId, a.Status, a.CreatedAt });
            b.HasIndex(a => new { a.PlayerId, a.Detector, a.CreatedAt });
            b.HasOne(a => a.Player).WithMany().HasForeignKey(a => a.PlayerId)
              .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(a => a.AssignedTo).WithMany().HasForeignKey(a => a.AssignedToId)
              .OnDelete(DeleteBehavior.SetNull);
        }
    }


    public class DetectorSettingConfiguration : IEntityTypeConfiguration<DetectorSettings>
    {
        public void Configure(EntityTypeBuilder<DetectorSettings> b)
        {
            b.ToTable("detector_settings");
            b.Property(s => s.Detector).HasConversion<string>().HasMaxLength(40);
            b.Property(s => s.Severity).HasConversion<string>().HasMaxLength(20);
            b.Property(s => s.ParametersJson).HasColumnType("jsonb");
            b.HasIndex(s => new { s.OperatorId, s.Detector }).IsUnique();
            b.HasOne<Operator>().WithMany().HasForeignKey(s => s.OperatorId)
             .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class WatchlistEntryConfiguration : IEntityTypeConfiguration<WatchlistEntry>
    {
        public void Configure(EntityTypeBuilder<WatchlistEntry> b)
        {
            b.ToTable("watchlist");
            b.Property(w => w.FullName).HasMaxLength(200).IsRequired();
            b.Property(w => w.NormalizedName).HasMaxLength(200).IsRequired();
            b.Property(w => w.Category).HasConversion<string>().HasMaxLength(20);
            b.Property(w => w.Source).HasMaxLength(50).IsRequired();
            b.Property(w => w.Country).HasMaxLength(2);
            b.HasIndex(w => w.OperatorId);
            b.HasOne<Operator>().WithMany().HasForeignKey(w => w.OperatorId)
              .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class AuditEntryConfiguration : IEntityTypeConfiguration<AuditEntry>
    {
        public void Configure(EntityTypeBuilder<AuditEntry> b)
        {
            b.ToTable("audit_log");
            b.Property(a => a.Id).UseIdentityAlwaysColumn();
            b.Property(a => a.Kind).HasConversion<string>().HasMaxLength(30);
            b.Property(a => a.ActorName).HasMaxLength(100).IsRequired();
            b.Property(a => a.Message).HasMaxLength(2000).IsRequired();
            b.Property(a => a.PreviousHash).HasMaxLength(64).IsRequired();
            b.Property(a => a.Hash).HasMaxLength(64).IsRequired();
            b.HasIndex(a => new { a.OperatorId, a.Id });
            b.HasIndex(a => a.AlertId);
            b.HasIndex(a => a.PlayerId);
            b.HasOne<Operator>().WithMany().HasForeignKey(a => a.OperatorId)
              .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
