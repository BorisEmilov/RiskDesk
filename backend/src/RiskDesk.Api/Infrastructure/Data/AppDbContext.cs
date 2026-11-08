using Microsoft.EntityFrameworkCore;
using RiskDesk.Api.Domain;

namespace RiskDesk.Api.Infrastructure.Data {
  public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options) {
    public DbSet<Operator> Operators => Set<Operator>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<PlayerIdentifier> PlayerIdentifiers => Set<PlayerIdentifier>();
    public DbSet<CasinoEvent> Events => Set<CasinoEvent>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<DetectorSettings> DetectorSettings => Set<DetectorSettings>();
    public DbSet<WatchlistEntry> Watchlist => Set<WatchlistEntry>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
      modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
  }

  public static class TransactionExtension {
    public static async Task<T> InTransactionAsync<T>(this AppDbContext db,
      Func<Task<T>> work, CancellationToken ct
    ){
      await using var transaction = await db.Database.BeginTransactionAsync(ct);
      var result = await work();
      await db.SaveChangesAsync(ct);
      await transaction.CommitAsync(ct);
      return result;
    }

    public static Task InTransactionAsync(this AppDbContext db, 
      Func<Task> work, 
      CancellationToken ct
    ) => db.InTransactionAsync(async () => { await work(); return true; }, ct);

  }
}
