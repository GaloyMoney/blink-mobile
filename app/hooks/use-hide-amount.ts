import { useHideBalanceQuery } from "@app/graphql/generated"
import { makeVar, useReactiveVar } from "@apollo/client"

const currentStatusVar = makeVar<boolean | undefined>(undefined)

export const useHideAmount = (): boolean => {
  const { data: { hideBalance } = { hideBalance: false } } = useHideBalanceQuery()

  const currentStatus = useReactiveVar(currentStatusVar)

  if (currentStatus === undefined) {
    currentStatusVar(hideBalance)
    return hideBalance
  }

  return currentStatus
}

export const switchHideAmount = (): void => {
  currentStatusVar(!currentStatusVar())
}
