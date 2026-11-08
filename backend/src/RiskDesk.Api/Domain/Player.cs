namespace RiskDesk.Api.Domain
{
    public class Player
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public Guid OperatorId { get; set; }
        public string ExternalId { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Country { get; set; }
        public DateOnly? DateOfBirth { get; set; }

        public PlayerStatus Status { get; private set; } = PlayerStatus.Active;
        public KycStatus KycStatus { get; private set; } = KycStatus.NotStarted;
        public bool WithdrawlsFrozen { get; private set; }
        public bool BonusesBlocked { get; private set; }
        public int RiskScore { get; set; }

        public string? LastLoginCountry { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

        public bool CanWithdrawl => Status == PlayerStatus.Active && !WithdrawlsFrozen
          && KycStatus != KycStatus.Requested;
        public bool CanRecivebonus => Status == PlayerStatus.Active && !BonusesBlocked;
        public bool CanPlay => Status == PlayerStatus.Active;

        public void Apply(PlayerAction action)
        {
            if (Status == PlayerStatus.Closed)
            {
                throw new DomainException("Account is closed: No actions allowed");
            }
            ;

            switch (action)
            {
                case PlayerAction.FreezeWithdrawls: WithdrawlsFrozen = true; break;
                case PlayerAction.UnfreezeWithdrawls: WithdrawlsFrozen = false; break;
                case PlayerAction.BlockBonuses: BonusesBlocked = true; break;
                case PlayerAction.UnblockBonuses: BonusesBlocked = false; break;
                case PlayerAction.RequestKyc: KycStatus = KycStatus.Requested; break;
                case PlayerAction.MarkKycVerified: KycStatus = KycStatus.Verified; break;
                case PlayerAction.RejectKyc: KycStatus = KycStatus.Rejected; break;
                case PlayerAction.Suspend:
                    if (Status == PlayerStatus.SelfExcluded) throw new DomainException("Player alredy excluded");
                    Status = PlayerStatus.Suspended;
                    break;
                case PlayerAction.Reactivate:
                    if (Status != PlayerStatus.Suspended)
                    {
                        throw new DomainException("Only Suspended account can be reactivated");
                    }
                    Status = PlayerStatus.Active;
                    break;
                case PlayerAction.SelfExclude: Status = PlayerStatus.SelfExcluded; break;
                case PlayerAction.Close: Status = PlayerStatus.Closed; WithdrawlsFrozen = true; break;
                default: throw new DomainException($"Unknown Action {action}");
            }
        }
    }
}
