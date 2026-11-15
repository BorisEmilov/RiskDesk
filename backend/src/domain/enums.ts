
export const USER_ROLES = ['Admin', 'Analyst'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const EVENT_TYPES = [
    'Registration',
    'Login',
    'Deposit',
    'Withdrawal',
    'Bet',
    'Win',
    'BonusClaim',
] as const
export type eventType = (typeof EVENT_TYPES)[number]

export const ALERT_CATEGORIES = ['Fraud', 'Aml', 'Compliance', 'ResponsibleGambling'] as const
export type AlertCategory = (typeof ALERT_CATEGORIES)[number]

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export type Severity = (typeof SEVERITIES)[number]

export const ALERT_STATUSES = ['Open', 'InReview', 'Escalated', 'Closed'] as const
export type AlertStatus = (typeof ALERT_STATUSES)[number]

export const ALERT_RESOLUTIONS = ['None', 'TruePositive', 'FalsePositive'] as const
export type AlertResolution = (typeof ALERT_RESOLUTIONS)[number]

export const PLAYER_STATUSES = ['Active', 'Suspended', 'SelfExcluded', 'Closed'] as const
export type PlayerStatus = (typeof PLAYER_STATUSES)[number]

export const KYC_STATUSES = ['NotStarted', 'Requested', 'Verified', 'Rejected'] as const
export type KycStatus = (typeof KYC_STATUSES)[number]

export const IDENTIFIER_TYPES = ['Device', 'Ip', 'PaymentMethod', 'Email'] as const
export type IdentifierType = (typeof IDENTIFIER_TYPES)[number]

export const DETECTOR_TYPES = [
'MultiAccount',
'BonusAbuse',
'PaymentVelocity',
'AccountTakeover',
'DepositWithdrawNoPlay',
'Structuring',
'LargeTransaction',
'SanctionsScreening',
'SelfExclusionBreach',
'LossChasing',
'AiPatternAnalysis',
] as const
export type DetectorType = (typeof DETECTOR_TYPES)[number]

export const PLAYER_ACTIONS = [
'FreezeWithdrawals',
'UnfreezeWithdrawals',
'BlockBonuses',
'UnblockBonuses',
'RequestKyc',
'MarkKycVerified',
'RejectKyc',
'Suspend',
'Reactivate',
'SelfExclude',
'Close',
] as const
export type PlayerAction = (typeof PLAYER_ACTIONS)[number]

export const WATCHLIST_CATEGORIES = ['Sanction', 'Pep'] as const
export type WatchlistCategory = (typeof WATCHLIST_CATEGORIES)[number]

export const AUDIT_KINDS = [
'AlertCreated',
'AlertAssigned',
'AlertStatusChanged',
'AlertCommented',
'AiAnalysisCompleted',
'PlayerActionApplied',
'DetectorUpdated',
'WatchlistChanged',
'UserChanged',
'ApiKeyRotated',
] as const
export type AuditKind = (typeof AUDIT_KINDS)[number]

export const AI_STATUSES = ['NotRequested', 'Pending', 'Completed', 'Failed'] as const
export type AiStatus = (typeof AI_STATUSES)[number]

export const BULK_ACTIONS = ['AssignToMe', 'Escalate', 'Close'] as const
export type BulkAction = (typeof BULK_ACTIONS)[number]

export const severityRank = (s: Severity) => SEVERITIES.indexOf(s)