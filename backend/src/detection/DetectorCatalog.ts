// Qué es: el catálogo de detectores con su configuración por defecto.
// Conexión: AuthService.register lo usa para sembrar detector_settings de cada operador nuevo.
import type { Prisma } from '@prisma/client'
import type { AlertCategory, DetectorType, Severity } from '../domain/enums.js'

export interface DetectorDefinition {
  type: DetectorType
  category: AlertCategory
  severity: Severity
  riskPoints: number
  cooldownHours: number
  parameters: Record<string, number>
}

const DEFINITIONS: readonly DetectorDefinition[] = [
  { type: 'MultiAccount', category: 'Fraud', severity: 'High', riskPoints: 30, cooldownHours: 24, parameters: { minLinkedAccounts: 2 } },
  { type: 'BonusAbuse', category: 'Fraud', severity: 'Medium', riskPoints: 20, cooldownHours: 24, parameters: { windowDays: 30, maxBonusClaims: 3 } },
  { type: 'PaymentVelocity', category: 'Fraud', severity: 'Medium', riskPoints: 15, cooldownHours: 6, parameters: { windowMinutes: 60, maxDeposits: 5 } },
  { type: 'AccountTakeover', category: 'Fraud', severity: 'High', riskPoints: 25, cooldownHours: 12, parameters: { windowHours: 24 } },
  { type: 'DepositWithdrawNoPlay', category: 'Aml', severity: 'High', riskPoints: 25, cooldownHours: 24, parameters: { windowDays: 7, maxWageredRatio: 0.3 } },
  { type: 'Structuring', category: 'Aml', severity: 'High', riskPoints: 30, cooldownHours: 24, parameters: { windowDays: 7, threshold: 2000, minTransactions: 3 } },
  { type: 'LargeTransaction', category: 'Aml', severity: 'Medium', riskPoints: 15, cooldownHours: 1, parameters: { threshold: 10000 } },
  { type: 'SanctionsScreening', category: 'Compliance', severity: 'Critical', riskPoints: 50, cooldownHours: 168, parameters: { minSimilarity: 0.9 } },
  { type: 'SelfExclusionBreach', category: 'ResponsibleGambling', severity: 'Critical', riskPoints: 40, cooldownHours: 24, parameters: {} },
  { type: 'LossChasing', category: 'ResponsibleGambling', severity: 'Medium', riskPoints: 15, cooldownHours: 24, parameters: { windowHours: 24, minDepositsAfterLoss: 3 } },
  { type: 'AiPatternAnalysis', category: 'Fraud', severity: 'Medium', riskPoints: 10, cooldownHours: 24, parameters: { minEvents: 10 } },
]

export const DetectorCatalog = {
  all: DEFINITIONS,

  get(type: DetectorType): DetectorDefinition {
    const def = DEFINITIONS.find((d) => d.type === type)
    if (!def) throw new Error(`Detector desconocido: ${type}`)
    return def
  },

  defaultSettings(operatorId: string): Prisma.DetectorSettingCreateManyInput[] {
    return DEFINITIONS.map((d) => ({
      operatorId,
      detector: d.type,
      isEnabled: true,
      severity: d.severity,
      riskPoints: d.riskPoints,
      cooldownHours: d.cooldownHours,
      parameters: d.parameters,
    }))
  },
}
