export const satAmountDisplay = (amount: number): string => {
  if (amount === 1) {
    return "1 sat"
  }
  return Intl.NumberFormat("en-US").format(amount) + " sats"
}
