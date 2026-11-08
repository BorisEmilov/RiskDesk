using System.Security.Cryptography;
using System.Text;


namespace RiskDesk.Api.Domain {
  public class AuditEntry {
    public long Id {get; set;}
    public Guid OperatorId {get; set;}
    public AuditKind Kind {get; set;}
    public Guid? ActorUserId {get; set;}
    public string ActorName {get; set;} = "System";
    public Guid? AlertId {get; set;}
    public Guid? PlayerId {get; set;}
    public string Message {get; set;} = string.Empty;
    public DateTime CreatedAt {get; set;} 
    public string PreviousHash {get; set;} = string.Empty;
    public string Hash {get; set;} = string.Empty;

    public string ComputeHash(){
      var payload = string.Join('|', PreviousHash, OperatorId, Kind, ActorUserId, ActorName,
        AlertId, PlayerId, Message, CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.ffffffZ"));
      return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payload)));
    }

    public static DateTime NowTruncated(){
      var now = DateTime.UtcNow;
      return new DateTime(now.Ticks - now.Ticks % 10, DateTimeKind.Utc);
    }
  }
}
