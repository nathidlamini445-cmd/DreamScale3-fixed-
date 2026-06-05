import {
  formatProChargeSummary,
  formatProMonthlyUsd,
  getProMonthlyUsd,
  getProMonthlyZarAmount,
  getZarPerUsd,
} from './pro-price'

export {
  formatProChargeSummary,
  formatProMonthlyUsd,
  getProMonthlyUsd,
  getProMonthlyZarAmount,
  getZarPerUsd,
}

export function zarToUsd(zarAmount: string): number {
  const zar = parseFloat(zarAmount)
  if (!Number.isFinite(zar) || zar < 0) return 0
  return zar / getZarPerUsd()
}

export function formatUsdFromZarMonthly(_zarRecurring?: string): string {
  return formatProMonthlyUsd()
}

export function formatUsdFree(): string {
  return '$0'
}

export function formatZarChargeNote(zarRecurring?: string): string {
  return formatProChargeSummary(zarRecurring)
}
