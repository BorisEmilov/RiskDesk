namespace RiskDesk.Api.Domain
{
    public enum UserRole { Admin, Analyst }
    public enum EventType { Registration, Login, Deposit, Withdrawl, Bet, Win, BonusClaim }
    public enum AlertCategory { Fraud, Aml, Compliance, ResponsibleGaming }
    public enum Severity { Low, Medium, High, Critical }
    public enum AlertStatus { Open, InReview, Escalated, Closed }
    public enum AlertResolution { None, TuePositive, FalsePositive }
    public enum PlayerStatus { Active, Suspended, SelfExcluded, Closed }
    public enum KycStatus { NotStarted, Requested, Verified, Rejected }
    public enum IdentifierType { Device, Ip, PaymentMethod, Email }
    public enum DetectorType
    {
        MultiAccount,
        BonusAbuse,
        PaymentVelocity,
        AccountTakeover,
        DepositWithdrawlNoPlay,
        Structuring,
        LargeTransaction,
        SactionsScreening,
        SelfExclusionBreach,
        LossChasing
    }
    public enum PlayerAction
    {
        FreezeWithdrawls,
        UnfreezeWithdrawls,
        BlockBonuses,
        UnblockBonuses,
        RequestKyc,
        MarkKycVerified,
        RejectKyc,
        Suspend,
        Reactivate,
        SelfExclude,
        Close
    }
    public enum WhatchListCategory { Sanction, Pep }
    public enum AuditKind
    {
        AlertCreated,
        AlertAssigned,
        AlertStatusChanged,
        AlertCommented,
        PlayerActionApplied,
        DetectorUpdated,
        WhatchlistChanged,
        UserChanged,
        ApiKeyRotated
    }
}
