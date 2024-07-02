import { useContext } from "react"
import { BreezContext } from "@app/contexts/BreezContext"
import { WalletCurrency } from "@app/graphql/generated"

type BtcWallet = {
  id: string
  walletCurrency: WalletCurrency
  balance: number
}

interface ContextProps {
  btcWallet: BtcWallet
  loading: boolean
  refreshBreez: () => void
}

export const useBreez = () => {
  const context: ContextProps = useContext(BreezContext)
  return context
}
