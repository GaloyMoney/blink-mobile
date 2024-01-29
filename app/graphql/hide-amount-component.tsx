import * as React from "react"
import { PropsWithChildren, useState } from "react"

import { useHideBalanceQuery } from "@app/graphql/generated"

import { HideAmountContextProvider } from "./hide-amount-context"

export const HideAmountContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const { data: { hideBalance } = { hideBalance: false } } = useHideBalanceQuery()
  const [hideAmount, setHideAmount] = useState(hideBalance)

  const switchMemoryHideAmount = () => {
    setHideAmount(!hideAmount)
  }

  return (
    <HideAmountContextProvider value={{ hideAmount, switchMemoryHideAmount }}>
      {children}
    </HideAmountContextProvider>
  )
}
